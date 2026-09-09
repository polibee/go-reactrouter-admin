package pluginhost

import (
	"bytes"
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"testing"
	"time"

	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

func TestBoundedProcessOutputRedactsProcessToken(t *testing.T) {
	var output bytes.Buffer
	writer := &boundedProcessOutput{
		writer: &output, limit: 1024, logger: slog.Default(), redact: "secret-token",
	}
	if _, err := writer.Write([]byte("plugin secret-token output")); err != nil {
		t.Fatalf("write process output: %v", err)
	}
	if bytes.Contains(output.Bytes(), []byte("secret-token")) {
		t.Fatal("process token must not appear in captured output")
	}
}

func TestPluginHelperProcess(t *testing.T) {
	if os.Getenv("GO_WANT_PLUGIN_HELPER") != "1" {
		return
	}
	address := os.Getenv("PLUGIN_LISTEN_ADDR")
	server := &http.Server{Addr: address}
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Plugin-Process-Token") != os.Getenv("PLUGIN_PROCESS_TOKEN") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusOK)
	})
	http.HandleFunc("/shutdown", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
		go func() { _ = server.Close() }()
	})
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		os.Exit(2)
	}
	os.Exit(0)
}

func TestProcessRunnerStartsHealthChecksAndStopsPlugin(t *testing.T) {
	plugin := ValidatedPlugin{
		Manifest: contracts.PluginManifest{
			ID: "example.plugin",
			Backend: contracts.BackendManifest{
				Entrypoint: "backend/plugin",
				HealthPath: "/health",
				APIPrefix:  "/api/plugins/example",
			},
		},
		Root: t.TempDir(),
	}

	runner := NewProcessRunner(ProcessRunnerConfig{
		CommandResolver: func(_ ValidatedPlugin) (string, []string, error) {
			return os.Args[0], []string{"-test.run=TestPluginHelperProcess", "--"}, nil
		},
		CommandFactory: func(ctx context.Context, executable string, args ...string) *exec.Cmd {
			return exec.CommandContext(ctx, executable, args...)
		},
		ExtraEnvironment: map[string]string{"GO_WANT_PLUGIN_HELPER": "1"},
		StopTimeout:      2 * time.Second,
	})

	handle, err := runner.Start(context.Background(), plugin)
	if err != nil {
		t.Fatalf("start plugin: %v", err)
	}

	checker := NewHealthChecker(HealthCheckerConfig{RequestTimeout: time.Second})
	healthContext, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := checker.Wait(healthContext, handle.Address(), "/health", handle.Token()); err != nil {
		t.Fatalf("wait for plugin health: %v", err)
	}
	if handle.State() != ProcessStateRunning {
		t.Fatalf("state = %s, want running", handle.State())
	}
	if err := runner.Stop(context.Background(), plugin.Manifest.ID); err != nil {
		t.Fatalf("stop plugin: %v", err)
	}
	if handle.State() != ProcessStateStopped {
		t.Fatalf("state = %s, want stopped", handle.State())
	}
}
