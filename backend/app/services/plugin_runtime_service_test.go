package services

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/polibee/go-reactrouter/backend/internal/gateway"
)

func TestPluginRuntimeServiceDisablesBeforeStopping(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(server.Close)

	registry := gateway.NewMemoryRegistry()
	registry.Set(gateway.RuntimeTarget{
		PluginID: "example.plugin", State: "enabled", Address: server.URL,
		APIPrefix: "/api/plugins/example", ProcessToken: "token",
	})
	service := NewPluginRuntimeService(PluginRuntimeConfig{Registry: registry})
	if err := service.Disable(context.Background(), "example.plugin"); err != nil {
		t.Fatalf("disable: %v", err)
	}
	if _, err := service.Proxy(context.Background(), "example.plugin", gateway.GatewayRequest{Method: http.MethodGet, Path: "/hello"}); err == nil {
		t.Fatal("disabled plugin must not remain routable")
	}
}

func TestPluginRuntimeServiceMarksRepeatedHealthFailuresFailed(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	t.Cleanup(server.Close)

	registry := gateway.NewMemoryRegistry()
	registry.Set(gateway.RuntimeTarget{
		PluginID: "example.plugin", State: "enabled", Address: server.URL,
		APIPrefix: "/api/plugins/example", ProcessToken: "token",
	})
	service := NewPluginRuntimeService(PluginRuntimeConfig{Registry: registry, HealthFailureLimit: 2})
	for range 2 {
		_ = service.Health(context.Background(), "example.plugin")
	}
	target, ok := registry.Lookup("example.plugin")
	if !ok || target.State != "failed" {
		t.Fatalf("target after health failures = %#v, want failed", target)
	}
}
