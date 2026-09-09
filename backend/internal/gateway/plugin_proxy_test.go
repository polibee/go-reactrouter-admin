package gateway

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

type staticRegistry struct{ target RuntimeTarget }

func (r staticRegistry) Lookup(string) (RuntimeTarget, bool) { return r.target, true }

func TestPluginProxyRoutesEnabledPluginAndInjectsIdentity(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Core-User-ID") != "42" {
			t.Errorf("user id = %q", r.Header.Get("X-Core-User-ID"))
		}
		if r.Header.Get("X-Core-Permissions") != `posts.view,posts.update` {
			t.Errorf("permissions = %q", r.Header.Get("X-Core-Permissions"))
		}
		if r.Header.Get("X-Plugin-Process-Token") != "runtime-token" {
			t.Errorf("process token = %q", r.Header.Get("X-Plugin-Process-Token"))
		}
		w.WriteHeader(http.StatusCreated)
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	t.Cleanup(server.Close)

	proxy := NewPluginProxy(staticRegistry{target: RuntimeTarget{
		PluginID:     "example.plugin",
		State:        "enabled",
		Address:      server.URL,
		APIPrefix:    "/api/plugins/example",
		ProcessToken: "runtime-token",
	}})
	response, err := proxy.Proxy(context.Background(), "example.plugin", GatewayRequest{
		Method: http.MethodGet,
		Path:   "/posts",
		Header: http.Header{"X-Plugin-Process-Token": []string{"spoofed"}},
		Identity: Identity{
			UserID:      "42",
			Permissions: []string{"posts.view", "posts.update"},
		},
	})
	if err != nil {
		t.Fatalf("proxy request: %v", err)
	}
	if response.Status != http.StatusCreated {
		t.Fatalf("status = %d, want %d", response.Status, http.StatusCreated)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("read response: %v", err)
	}
	if string(body) != `{"ok":true}` {
		t.Fatalf("body = %s", body)
	}
}

func TestPluginProxyBlocksDisabledPluginBeforeNetworkCall(t *testing.T) {
	called := false
	server := httptest.NewServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { called = true }))
	t.Cleanup(server.Close)

	proxy := NewPluginProxy(staticRegistry{target: RuntimeTarget{
		PluginID: "example.plugin", State: "disabled", Address: server.URL,
		APIPrefix: "/api/plugins/example", ProcessToken: "runtime-token",
	}})
	if _, err := proxy.Proxy(context.Background(), "example.plugin", GatewayRequest{Method: http.MethodGet, Path: "/posts"}); err == nil {
		t.Fatal("disabled plugin request must fail")
	}
	if called {
		t.Fatal("disabled plugin must be blocked before dialing")
	}
}
