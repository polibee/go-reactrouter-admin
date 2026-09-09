package bootstrap

import (
	"context"

	contractsfoundation "github.com/goravel/framework/contracts/foundation"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/routes"
)

// PluginServiceProvider starts the one-shot reconciliation runner after the
// application has built its routes and database services. This keeps process
// recovery out of route registration, where the ORM may not be initialized in
// CLI and test builds.
type PluginServiceProvider struct{}

func (provider *PluginServiceProvider) Register(contractsfoundation.Application) {}

func (provider *PluginServiceProvider) Boot(contractsfoundation.Application) {}

func (provider *PluginServiceProvider) Runners(app contractsfoundation.Application) []contractsfoundation.Runner {
	ctx := app.Context()
	if ctx == nil {
		ctx = context.Background()
	}
	return []contractsfoundation.Runner{pluginLifecycleReconciler{ctx: ctx}}
}

type pluginLifecycleReconciler struct {
	ctx context.Context
}

func (pluginLifecycleReconciler) Signature() string { return "plugins:reconcile" }

func (pluginLifecycleReconciler) ShouldRun() bool { return true }

func (runner pluginLifecycleReconciler) Run() error {
	if err := routes.PluginLifecycleService().Reconcile(runner.ctx); err != nil {
		facades.Log().Warningf("plugin lifecycle reconciliation failed: %v", err)
	}
	return nil
}

func (pluginLifecycleReconciler) Shutdown() error { return nil }
