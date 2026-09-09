package gateway

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Identity struct {
	UserID      string
	Email       string
	Permissions []string
}

type GatewayRequest struct {
	Method   string
	Path     string
	Query    string
	Header   http.Header
	Body     io.Reader
	Identity Identity
}

type GatewayResponse struct {
	Status int
	Header http.Header
	Body   io.ReadCloser
}

type RuntimeTarget struct {
	PluginID     string
	State        string
	Address      string
	APIPrefix    string
	HealthPath   string
	ProcessToken string
}

type Registry interface {
	Lookup(pluginID string) (RuntimeTarget, bool)
}

type MemoryRegistry struct {
	mu      sync.RWMutex
	targets map[string]RuntimeTarget
}

func NewMemoryRegistry() *MemoryRegistry {
	return &MemoryRegistry{targets: make(map[string]RuntimeTarget)}
}

func (registry *MemoryRegistry) Lookup(pluginID string) (RuntimeTarget, bool) {
	registry.mu.RLock()
	defer registry.mu.RUnlock()
	target, ok := registry.targets[pluginID]
	return target, ok
}

func (registry *MemoryRegistry) Set(target RuntimeTarget) {
	registry.mu.Lock()
	defer registry.mu.Unlock()
	registry.targets[target.PluginID] = target
}

func (registry *MemoryRegistry) SetState(pluginID, state string) bool {
	registry.mu.Lock()
	defer registry.mu.Unlock()
	target, ok := registry.targets[pluginID]
	if !ok {
		return false
	}
	target.State = state
	registry.targets[pluginID] = target
	return true
}

func (registry *MemoryRegistry) Delete(pluginID string) {
	registry.mu.Lock()
	defer registry.mu.Unlock()
	delete(registry.targets, pluginID)
}

type PluginProxy struct {
	registry         Registry
	client           *http.Client
	maxResponseBytes int64
}

func NewPluginProxy(registry Registry) *PluginProxy {
	return &PluginProxy{
		registry:         registry,
		client:           &http.Client{Timeout: 30 * time.Second},
		maxResponseBytes: 8 << 20,
	}
}

func (proxy *PluginProxy) Proxy(ctx context.Context, pluginID string, request GatewayRequest) (GatewayResponse, error) {
	if proxy.registry == nil {
		return GatewayResponse{}, errors.New("plugin gateway registry is required")
	}
	target, ok := proxy.registry.Lookup(pluginID)
	if !ok {
		return GatewayResponse{}, fmt.Errorf("plugin %q was not found", pluginID)
	}
	if err := AuthorizePluginState(target.State); err != nil {
		return GatewayResponse{}, err
	}
	baseURL, err := localAddressURL(target.Address)
	if err != nil {
		return GatewayResponse{}, err
	}
	if !strings.HasPrefix(target.APIPrefix, "/api/") {
		return GatewayResponse{}, errors.New("plugin api prefix must start with /api/")
	}
	if strings.TrimSpace(target.ProcessToken) == "" {
		return GatewayResponse{}, errors.New("plugin process token is required")
	}
	requestPath, err := safeRequestPath(request.Path)
	if err != nil {
		return GatewayResponse{}, err
	}
	targetPath := path.Join(target.APIPrefix, requestPath)
	if strings.HasSuffix(requestPath, "/") && !strings.HasSuffix(targetPath, "/") {
		targetPath += "/"
	}
	targetURL := baseURL + targetPath
	if request.Query != "" {
		parsed, parseErr := url.ParseQuery(request.Query)
		if parseErr != nil {
			return GatewayResponse{}, fmt.Errorf("invalid gateway query: %w", parseErr)
		}
		targetURL += "?" + parsed.Encode()
	}
	outgoing, err := http.NewRequestWithContext(ctx, request.Method, targetURL, request.Body)
	if err != nil {
		return GatewayResponse{}, err
	}
	copyAllowedHeaders(outgoing.Header, request.Header)
	outgoing.Header.Set("X-Plugin-Process-Token", target.ProcessToken)
	outgoing.Header.Set("X-Core-User-ID", request.Identity.UserID)
	outgoing.Header.Set("X-Core-User-Email", request.Identity.Email)
	outgoing.Header.Set("X-Core-Permissions", strings.Join(request.Identity.Permissions, ","))
	if requestID := request.Header.Get("X-Request-ID"); requestID != "" {
		outgoing.Header.Set("X-Core-Request-ID", requestID)
	}

	response, err := proxy.client.Do(outgoing)
	if err != nil {
		return GatewayResponse{}, err
	}
	body := &limitedResponseBody{reader: response.Body, remaining: proxy.maxResponseBytes}
	return GatewayResponse{Status: response.StatusCode, Header: response.Header.Clone(), Body: body}, nil
}

func copyAllowedHeaders(destination, source http.Header) {
	for key, values := range source {
		canonical := http.CanonicalHeaderKey(key)
		switch canonical {
		case "Authorization", "Cookie", "Host", "X-Plugin-Process-Token", "X-Core-User-Id", "X-Core-User-Email", "X-Core-Permissions":
			continue
		}
		for _, value := range values {
			destination.Add(canonical, value)
		}
	}
}

func safeRequestPath(requestPath string) (string, error) {
	if requestPath == "" {
		return "/", nil
	}
	if !strings.HasPrefix(requestPath, "/") || strings.Contains(requestPath, "\\") {
		return "", errors.New("plugin request path must be absolute and use URL separators")
	}
	clean := path.Clean(requestPath)
	if clean == "." || strings.HasPrefix(clean, "/../") || clean == "/.." {
		return "", errors.New("plugin request path escapes api prefix")
	}
	return strings.TrimPrefix(clean, "/"), nil
}

func localAddressURL(address string) (string, error) {
	if strings.HasPrefix(address, "http://") || strings.HasPrefix(address, "https://") {
		parsed, err := url.Parse(address)
		if err != nil || parsed.Host == "" || parsed.Path != "" && parsed.Path != "/" {
			return "", errors.New("invalid plugin address")
		}
		address = parsed.Host
	}
	host, port, err := net.SplitHostPort(address)
	if err != nil || net.ParseIP(host) == nil || !net.ParseIP(host).IsLoopback() {
		return "", errors.New("plugin gateway address must be loopback")
	}
	if _, err := strconv.Atoi(port); err != nil {
		return "", errors.New("plugin gateway address must include a port")
	}
	return "http://" + net.JoinHostPort(host, port), nil
}

type limitedResponseBody struct {
	reader    io.ReadCloser
	remaining int64
}

func (body *limitedResponseBody) Read(data []byte) (int, error) {
	if body.remaining <= 0 {
		return 0, io.ErrUnexpectedEOF
	}
	if int64(len(data)) > body.remaining {
		data = data[:body.remaining]
	}
	read, err := body.reader.Read(data)
	body.remaining -= int64(read)
	if body.remaining == 0 && err == nil {
		return read, io.ErrUnexpectedEOF
	}
	return read, err
}

func (body *limitedResponseBody) Close() error { return body.reader.Close() }
