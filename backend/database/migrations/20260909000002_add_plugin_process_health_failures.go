package migrations

import (
	"github.com/goravel/framework/contracts/database/schema"

	"github.com/polibee/go-reactrouter/backend/app/facades"
)

// M20260909000002AddPluginProcessHealthFailures stores bounded health failure
// evidence for the supervisor without persisting process authentication tokens.
type M20260909000002AddPluginProcessHealthFailures struct{}

func (r *M20260909000002AddPluginProcessHealthFailures) Signature() string {
	return "20260909000002_add_plugin_process_health_failures"
}

func (r *M20260909000002AddPluginProcessHealthFailures) Up() error {
	if !facades.Schema().HasTable("plugin_processes") {
		return nil
	}
	return facades.Schema().Table("plugin_processes", func(table schema.Blueprint) {
		table.Integer("health_failures").Default(0)
		table.DateTimeTz("last_health_at").Nullable()
	})
}

func (r *M20260909000002AddPluginProcessHealthFailures) Down() error {
	if !facades.Schema().HasTable("plugin_processes") {
		return nil
	}
	return facades.Schema().Table("plugin_processes", func(table schema.Blueprint) {
		table.DropColumn("health_failures")
		table.DropColumn("last_health_at")
	})
}
