package migrations

import (
	"github.com/goravel/framework/contracts/database/schema"

	"github.com/polibee/go-reactrouter/backend/app/facades"
)

// M20260909000003CreatePluginOperations stores durable lifecycle progress and
// errors independently from the current plugin state.
type M20260909000003CreatePluginOperations struct{}

func (r *M20260909000003CreatePluginOperations) Signature() string {
	return "20260909000003_create_plugin_operations"
}

func (r *M20260909000003CreatePluginOperations) Up() error {
	if facades.Schema().HasTable("plugin_operations") {
		return nil
	}
	return facades.Schema().Create("plugin_operations", func(table schema.Blueprint) {
		table.ID()
		table.String("operation_id", 80)
		table.ForeignID("plugin_id").Constrained("plugins", "id", "fk_plugin_operations_plugin_id").CascadeOnDelete()
		pluginVersionID := table.ForeignID("plugin_version_id")
		pluginVersionID.Nullable()
		pluginVersionID.Constrained("plugin_versions", "id", "fk_plugin_operations_version_id").NullOnDelete()
		table.String("type", 32)
		table.String("state", 32)
		table.Integer("progress").Default(0)
		table.Text("message").Nullable()
		table.Text("last_error").Nullable()
		userID := table.ForeignID("user_id")
		userID.Nullable()
		userID.Constrained("users", "id", "fk_plugin_operations_user_id").NullOnDelete()
		table.DateTimeTz("started_at").Nullable()
		table.DateTimeTz("finished_at").Nullable()
		table.TimestampsTz()
		table.Unique("operation_id")
		table.Index("plugin_id", "created_at")
		table.Index("state")
	})
}

func (r *M20260909000003CreatePluginOperations) Down() error {
	return facades.Schema().DropIfExists("plugin_operations")
}
