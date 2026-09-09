package runtime

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestServerProtectsRuntimeEndpointsWithProcessToken(t *testing.T) {
	server, err := NewServer(Config{ID: "example.plugin", APIPrefix: "/api/plugins/example", ProcessToken: "secret"})
	if err != nil {
		t.Fatalf("new server: %v", err)
	}
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	response := httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want unauthorized", response.Code)
	}

	request = httptest.NewRequest(http.MethodGet, "/health", nil)
	request.Header.Set("X-Plugin-Process-Token", "secret")
	response = httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("authenticated status = %d, want ok", response.Code)
	}
}

func TestServerRegistersAuthenticatedPluginRoute(t *testing.T) {
	server, err := NewServer(Config{ID: "example.plugin", APIPrefix: "/api/plugins/example", ProcessToken: "secret"})
	if err != nil {
		t.Fatalf("new server: %v", err)
	}
	if err := server.Handle("/hello", http.HandlerFunc(func(writer http.ResponseWriter, _ *http.Request) {
		writer.WriteHeader(http.StatusCreated)
	})); err != nil {
		t.Fatalf("register route: %v", err)
	}
	request := httptest.NewRequest(http.MethodGet, "/api/plugins/example/hello", nil)
	request.Header.Set("X-Plugin-Process-Token", "secret")
	response := httptest.NewRecorder()
	server.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusCreated {
		t.Fatalf("status = %d, want created", response.Code)
	}
	_ = server.Shutdown(context.Background())
}
