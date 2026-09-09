package services

import (
	"context"
	"fmt"
	"sync"

	"github.com/polibee/go-reactrouter/backend/internal/gateway"
	"github.com/polibee/go-reactrouter/backend/internal/pluginhost"
)

type PluginRuntimeConfig struct {
	Runner             *pluginhost.ProcessRunner
	HealthChecker      *pluginhost.HealthChecker
	Registry           *gateway.MemoryRegistry
	HealthFailureLimit int
}

// PluginRuntimeService owns the volatile process registry. Durable plugin and
// version state remains in Core's database and is reconciled by the lifecycle
// service in Stage 7; this service never persists a process token.
type PluginRuntimeService struct {
	runner        *pluginhost.ProcessRunner
	healthChecker *pluginhost.HealthChecker
	registry      *gateway.MemoryRegistry
	proxy         *gateway.PluginProxy
	healthLimit   int
	mu            sync.Mutex
	healthFailure map[string]int
}

func NewPluginRuntimeService(config PluginRuntimeConfig) *PluginRuntimeService {
	if config.Runner == nil {
		config.Runner = pluginhost.NewProcessRunner(pluginhost.ProcessRunnerConfig{})
	}
	if config.HealthChecker == nil {
		config.HealthChecker = pluginhost.NewHealthChecker(pluginhost.HealthCheckerConfig{})
	}
	if config.Registry == nil {
		config.Registry = gateway.NewMemoryRegistry()
	}
	if config.HealthFailureLimit <= 0 {
		config.HealthFailureLimit = 3
	}
	return &PluginRuntimeService{
		runner: config.Runner, healthChecker: config.HealthChecker,
		registry: config.Registry, proxy: gateway.NewPluginProxy(config.Registry),
		healthLimit: config.HealthFailureLimit, healthFailure: make(map[string]int),
	}
}

func (service *PluginRuntimeService) Start(ctx context.Context, plugin pluginhost.ValidatedPlugin) (gateway.RuntimeTarget, error) {
	handle, err := service.runner.Start(ctx, plugin)
	if err != nil {
		return gateway.RuntimeTarget{}, err
	}
	if err := service.healthChecker.Wait(ctx, handle.Address(), plugin.Manifest.Backend.HealthPath, handle.Token()); err != nil {
		_ = service.runner.Stop(context.Background(), plugin.Manifest.ID)
		return gateway.RuntimeTarget{}, fmt.Errorf("plugin %s failed health check: %w", plugin.Manifest.ID, err)
	}
	target := gateway.RuntimeTarget{
		PluginID: plugin.Manifest.ID, State: "enabled", Address: handle.Address(),
		APIPrefix: plugin.Manifest.Backend.APIPrefix, HealthPath: plugin.Manifest.Backend.HealthPath,
		ProcessToken: handle.Token(),
	}
	service.registry.Set(target)
	service.mu.Lock()
	delete(service.healthFailure, plugin.Manifest.ID)
	service.mu.Unlock()
	return target, nil
}

func (service *PluginRuntimeService) Stop(ctx context.Context, pluginID string) error {
	service.registry.SetState(pluginID, "disabled")
	return service.runner.Stop(ctx, pluginID)
}

func (service *PluginRuntimeService) Disable(ctx context.Context, pluginID string) error {
	service.registry.SetState(pluginID, "disabled")
	if _, ok := service.runner.Handle(pluginID); !ok {
		return nil
	}
	return service.runner.Stop(ctx, pluginID)
}

func (service *PluginRuntimeService) Health(ctx context.Context, pluginID string) error {
	target, ok := service.registry.Lookup(pluginID)
	if !ok {
		return fmt.Errorf("plugin %q is not running", pluginID)
	}
	healthPath := target.HealthPath
	if healthPath == "" {
		healthPath = "/health"
	}
	if err := service.healthChecker.Check(ctx, target.Address, healthPath, target.ProcessToken); err != nil {
		service.mu.Lock()
		service.healthFailure[pluginID]++
		failures := service.healthFailure[pluginID]
		service.mu.Unlock()
		if failures >= service.healthLimit {
			service.registry.SetState(pluginID, "failed")
		}
		return err
	}
	service.mu.Lock()
	delete(service.healthFailure, pluginID)
	service.mu.Unlock()
	return nil
}

func (service *PluginRuntimeService) Proxy(ctx context.Context, pluginID string, request gateway.GatewayRequest) (gateway.GatewayResponse, error) {
	return service.proxy.Proxy(ctx, pluginID, request)
}

func (service *PluginRuntimeService) Registry() *gateway.MemoryRegistry { return service.registry }
