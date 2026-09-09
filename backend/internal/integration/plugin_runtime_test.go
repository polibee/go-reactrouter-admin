package integration

import (
	"context"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
	"time"

	"github.com/polibee/go-reactrouter/backend/app/services"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
	"github.com/polibee/go-reactrouter/backend/internal/gateway"
	"github.com/polibee/go-reactrouter/backend/internal/pluginhost"
)

func TestExamplePluginRunsBehindSupervisedGateway(t *testing.T) {
	root := filepath.Clean(filepath.Join("..", "..", ".."))
	exampleDir := filepath.Join(root, "plugins", "sdk-go", "example-plugin")
	binaryPath := filepath.Join(t.TempDir(), "example-plugin")
	build := exec.Command("go", "build", "-o", binaryPath, ".")
	build.Dir = exampleDir
	if output, err := build.CombinedOutput(); err != nil {
		t.Fatalf("build example plugin: %v\n%s", err, output)
	}

	runner := pluginhost.NewProcessRunner(pluginhost.ProcessRunnerConfig{
		CommandResolver: func(_ pluginhost.ValidatedPlugin) (string, []string, error) {
			return binaryPath, nil, nil
		},
		StopTimeout: 3 * time.Second,
	})
	service := services.NewPluginRuntimeService(services.PluginRuntimeConfig{Runner: runner})
	plugin := pluginhost.ValidatedPlugin{Manifest: contracts.PluginManifest{
		ID: "example.plugin",
		Backend: contracts.BackendManifest{
			HealthPath: "/health",
			APIPrefix:  "/api/plugins/example",
		},
	}}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if _, err := service.Start(ctx, plugin); err != nil {
		t.Fatalf("start example plugin: %v", err)
	}
	t.Cleanup(func() { _ = service.Stop(context.Background(), plugin.Manifest.ID) })

	response, err := service.Proxy(ctx, plugin.Manifest.ID, gateway.GatewayRequest{Method: "GET", Path: "/hello"})
	if err != nil {
		t.Fatalf("proxy example plugin: %v", err)
	}
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("read plugin response: %v", err)
	}
	if response.Status != 200 || string(body) != "{\"data\":{\"message\":\"hello from plugin\"}}\n" {
		t.Fatalf("plugin response = %d %q", response.Status, body)
	}

	if err := service.Disable(ctx, plugin.Manifest.ID); err != nil {
		t.Fatalf("disable example plugin: %v", err)
	}
	if _, err := service.Proxy(ctx, plugin.Manifest.ID, gateway.GatewayRequest{Method: "GET", Path: "/hello"}); err == nil {
		t.Fatal("disabled example plugin must not be routable")
	}
	_ = os.Remove(binaryPath)
}
