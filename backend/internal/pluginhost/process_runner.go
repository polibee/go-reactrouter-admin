package pluginhost

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const (
	envPluginID           = "PLUGIN_ID"
	envPluginAPIPrefix    = "PLUGIN_API_PREFIX"
	envPluginCoreURL      = "PLUGIN_CORE_URL"
	envPluginProcessToken = "PLUGIN_PROCESS_TOKEN"
	envPluginListenAddr   = "PLUGIN_LISTEN_ADDR"
)

var (
	ErrPluginAlreadyRunning = errors.New("plugin process is already running")
	ErrPluginNotRunning     = errors.New("plugin process is not running")
)

type ProcessHandle interface {
	PluginID() string
	PID() int
	Address() string
	Token() string
	State() ProcessState
	Done() <-chan error
}

type CommandResolver func(plugin ValidatedPlugin) (string, []string, error)
type CommandFactory func(ctx context.Context, executable string, args ...string) *exec.Cmd

type ProcessRunnerConfig struct {
	CoreURL          string
	StopTimeout      time.Duration
	CommandResolver  CommandResolver
	CommandFactory   CommandFactory
	ExtraEnvironment map[string]string
	Output           io.Writer
	Logger           *slog.Logger
	MaxOutputBytes   int64
}

type ProcessRunner struct {
	config ProcessRunnerConfig
	mu     sync.Mutex
	items  map[string]*processHandle
}

type processHandle struct {
	runner   *ProcessRunner
	pluginID string
	pid      int
	address  string
	token    string
	command  *exec.Cmd
	state    *ProcessStateTracker
	done     chan error
	stopOnce sync.Once
}

func NewProcessRunner(config ProcessRunnerConfig) *ProcessRunner {
	if config.StopTimeout <= 0 {
		config.StopTimeout = 5 * time.Second
	}
	if config.MaxOutputBytes <= 0 {
		config.MaxOutputBytes = 1 << 20
	}
	if config.Output == nil {
		config.Output = io.Discard
	}
	if config.Logger == nil {
		config.Logger = slog.Default()
	}
	if config.CommandFactory == nil {
		config.CommandFactory = func(ctx context.Context, executable string, args ...string) *exec.Cmd {
			return exec.CommandContext(ctx, executable, args...)
		}
	}
	return &ProcessRunner{config: config, items: make(map[string]*processHandle)}
}

func (runner *ProcessRunner) Start(ctx context.Context, plugin ValidatedPlugin) (ProcessHandle, error) {
	pluginID := strings.TrimSpace(plugin.Manifest.ID)
	if pluginID == "" {
		return nil, errors.New("plugin id is required")
	}

	runner.mu.Lock()
	if current, ok := runner.items[pluginID]; ok && current.State() != ProcessStateStopped && current.State() != ProcessStateFailed {
		runner.mu.Unlock()
		return nil, fmt.Errorf("%w: %s", ErrPluginAlreadyRunning, pluginID)
	}
	runner.mu.Unlock()

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, fmt.Errorf("allocate plugin address: %w", err)
	}
	address := listener.Addr().String()
	_ = listener.Close()

	executable, args, err := runner.resolveCommand(plugin)
	if err != nil {
		return nil, err
	}
	token, err := processToken()
	if err != nil {
		return nil, fmt.Errorf("create plugin process token: %w", err)
	}

	command := runner.config.CommandFactory(ctx, executable, args...)
	command.Dir = plugin.Root
	command.Env = minimalPluginEnvironment(plugin, address, token, runner.config.CoreURL, runner.config.ExtraEnvironment)
	stdout := &boundedProcessOutput{
		writer:   runner.config.Output,
		limit:    runner.config.MaxOutputBytes,
		logger:   runner.config.Logger,
		pluginID: pluginID,
		stream:   "stdout",
		redact:   token,
	}
	stderr := &boundedProcessOutput{
		writer:   runner.config.Output,
		limit:    runner.config.MaxOutputBytes,
		logger:   runner.config.Logger,
		pluginID: pluginID,
		stream:   "stderr",
		redact:   token,
	}
	command.Stdout = stdout
	command.Stderr = stderr
	command.WaitDelay = runner.config.StopTimeout
	if err := command.Start(); err != nil {
		return nil, fmt.Errorf("start plugin %s: %w", pluginID, err)
	}
	stdout.pid = command.Process.Pid
	stderr.pid = command.Process.Pid

	handle := &processHandle{
		runner: runner, pluginID: pluginID, pid: command.Process.Pid,
		address: address, token: token, command: command,
		state: NewProcessState(), done: make(chan error, 1),
	}
	if err := handle.state.Transition(ProcessStateRunning); err != nil {
		_ = command.Process.Kill()
		_ = command.Wait()
		return nil, err
	}

	runner.mu.Lock()
	runner.items[pluginID] = handle
	runner.mu.Unlock()
	go runner.wait(handle)
	return handle, nil
}

func (runner *ProcessRunner) Stop(ctx context.Context, pluginID string) error {
	runner.mu.Lock()
	handle, ok := runner.items[pluginID]
	runner.mu.Unlock()
	if !ok {
		return fmt.Errorf("%w: %s", ErrPluginNotRunning, pluginID)
	}
	return runner.stopHandle(ctx, handle)
}

func (runner *ProcessRunner) Handle(pluginID string) (ProcessHandle, bool) {
	runner.mu.Lock()
	defer runner.mu.Unlock()
	handle, ok := runner.items[pluginID]
	return handle, ok
}

func (runner *ProcessRunner) wait(handle *processHandle) {
	err := handle.command.Wait()
	if err != nil {
		_ = handle.state.Transition(ProcessStateFailed)
	} else {
		_ = handle.state.Transition(ProcessStateStopped)
	}
	handle.done <- err
	close(handle.done)
}

func (runner *ProcessRunner) stopHandle(ctx context.Context, handle *processHandle) error {
	var stopErr error
	handle.stopOnce.Do(func() {
		if handle.State() == ProcessStateRunning {
			_ = handle.state.Transition(ProcessStateStopping)
		}
		stopErr = requestPluginShutdown(ctx, handle.address, handle.token, runner.config.StopTimeout)
		waitContext, cancel := context.WithTimeout(ctx, runner.config.StopTimeout)
		defer cancel()
		select {
		case err := <-handle.done:
			if err != nil {
				stopErr = fmt.Errorf("plugin exited while stopping: %w", err)
			}
		case <-waitContext.Done():
			if handle.command.Process != nil {
				_ = handle.command.Process.Kill()
			}
			select {
			case <-handle.done:
			case <-time.After(runner.config.StopTimeout):
				stopErr = errors.Join(stopErr, errors.New("plugin process did not terminate after kill"))
			}
			if stopErr == nil {
				stopErr = waitContext.Err()
			}
		}
	})
	return stopErr
}

func (runner *ProcessRunner) resolveCommand(plugin ValidatedPlugin) (string, []string, error) {
	if runner.config.CommandResolver != nil {
		return runner.config.CommandResolver(plugin)
	}
	root, err := filepath.Abs(plugin.Root)
	if err != nil {
		return "", nil, fmt.Errorf("resolve plugin root: %w", err)
	}
	entrypoint := filepath.Clean(plugin.Manifest.Backend.Entrypoint)
	if entrypoint == "." || filepath.IsAbs(entrypoint) || entrypoint == ".." || strings.HasPrefix(entrypoint, ".."+string(os.PathSeparator)) {
		return "", nil, errors.New("plugin backend entrypoint escapes package root")
	}
	path := filepath.Join(root, entrypoint)
	pathAbs, err := filepath.Abs(path)
	if err != nil || (pathAbs != root && !strings.HasPrefix(pathAbs, root+string(os.PathSeparator))) {
		return "", nil, errors.New("plugin backend entrypoint escapes package root")
	}
	info, err := os.Lstat(pathAbs)
	if err != nil {
		return "", nil, fmt.Errorf("plugin backend entrypoint: %w", err)
	}
	if !info.Mode().IsRegular() || info.Mode()&os.ModeSymlink != 0 {
		return "", nil, errors.New("plugin backend entrypoint must be a regular file")
	}
	if err := os.Chmod(pathAbs, 0o750); err != nil {
		return "", nil, fmt.Errorf("prepare plugin backend entrypoint: %w", err)
	}
	return pathAbs, nil, nil
}

func processToken() (string, error) {
	var raw [32]byte
	if _, err := rand.Read(raw[:]); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(raw[:]), nil
}

func minimalPluginEnvironment(plugin ValidatedPlugin, address, token, coreURL string, extra map[string]string) []string {
	pathValue := os.Getenv("PATH")
	environment := []string{"PATH=" + pathValue}
	if systemRoot := os.Getenv("SystemRoot"); systemRoot != "" {
		environment = append(environment, "SystemRoot="+systemRoot)
	}
	environment = append(environment,
		envPluginID+"="+plugin.Manifest.ID,
		envPluginAPIPrefix+"="+plugin.Manifest.Backend.APIPrefix,
		envPluginCoreURL+"="+coreURL,
		envPluginProcessToken+"="+token,
		envPluginListenAddr+"="+address,
	)
	for key, value := range extra {
		if strings.TrimSpace(key) == "" || strings.ContainsAny(key, "=\x00") || strings.ContainsRune(value, '\x00') {
			continue
		}
		environment = append(environment, key+"="+value)
	}
	return environment
}

func requestPluginShutdown(parent context.Context, address, token string, timeout time.Duration) error {
	baseURL, err := localPluginURL(address)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(parent, timeout)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/shutdown", nil)
	if err != nil {
		return err
	}
	request.Header.Set("X-Plugin-Process-Token", token)
	response, err := (&http.Client{Timeout: timeout}).Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 4096))
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("plugin shutdown returned status %d", response.StatusCode)
	}
	return nil
}

func localPluginURL(address string) (string, error) {
	if strings.HasPrefix(address, "http://") || strings.HasPrefix(address, "https://") {
		address = strings.TrimPrefix(strings.TrimPrefix(address, "http://"), "https://")
	}
	host, _, err := net.SplitHostPort(address)
	if err != nil || net.ParseIP(host) == nil || !net.ParseIP(host).IsLoopback() {
		return "", errors.New("plugin address must be loopback")
	}
	return "http://" + address, nil
}

type boundedProcessOutput struct {
	writer   io.Writer
	limit    int64
	used     int64
	logger   *slog.Logger
	pluginID string
	stream   string
	pid      int
	redact   string
	mu       sync.Mutex
}

func (output *boundedProcessOutput) Write(data []byte) (int, error) {
	output.mu.Lock()
	defer output.mu.Unlock()
	originalLength := len(data)
	if output.redact != "" {
		data = bytes.ReplaceAll(data, []byte(output.redact), []byte("[REDACTED]"))
	}
	remaining := output.limit - output.used
	if remaining <= 0 {
		return originalLength, nil
	}
	if int64(len(data)) > remaining {
		data = data[:remaining]
	}
	if output.writer != nil {
		_, _ = output.writer.Write(data)
	}
	output.used += int64(len(data))
	if output.logger != nil && len(data) > 0 {
		output.logger.Info("plugin_process_output", "plugin_id", output.pluginID, "process_id", output.pid, "stream", output.stream, "bytes", len(data))
	}
	return originalLength, nil
}

func (handle *processHandle) PluginID() string { return handle.pluginID }
func (handle *processHandle) PID() int         { return handle.pid }
func (handle *processHandle) Address() string  { return handle.address }
func (handle *processHandle) Token() string    { return handle.token }
func (handle *processHandle) State() ProcessState {
	return handle.state.State()
}
func (handle *processHandle) Done() <-chan error { return handle.done }
