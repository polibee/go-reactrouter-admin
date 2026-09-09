package pluginhost

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthCheckerWaitsForHealthyPluginWithProcessToken(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("X-Plugin-Process-Token"); got != "test-token" {
			http.Error(w, "missing token", http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(server.Close)

	checker := NewHealthChecker(HealthCheckerConfig{})
	if err := checker.Check(context.Background(), server.URL, "/health", "test-token"); err != nil {
		t.Fatalf("health check: %v", err)
	}
}

func TestHealthCheckerRejectsNonLoopbackAddress(t *testing.T) {
	checker := NewHealthChecker(HealthCheckerConfig{})
	if err := checker.Check(context.Background(), "http://example.com:80", "/health", "test-token"); err == nil {
		t.Fatal("health checker must reject non-loopback addresses")
	}
}
