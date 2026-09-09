package migrations

import (
	"github.com/goravel/framework/contracts/database/schema"

	"github.com/polibee/go-reactrouter/backend/app/facades"
)

// M20260909000001CreatePluginTables stores validated plugin identities,
// versions, and the process lifecycle records used by the next stage.
type M20260909000001CreatePluginTables struct{}

func (r *M20260909000001CreatePluginTables) Signature() string {
	return "20260909000001_create_plugin_tables"
}

func (r *M20260909000001CreatePluginTables) Up() error {
	if !facades.Schema().HasTable("plugins") {
		if err := facades.Schema().Create("plugins", func(table schema.Blueprint) {
			table.ID()
			table.String("plugin_id", 150)
			table.String("name", 150)
			table.String("display_name", 200)
			table.String("state", 32)
			table.String("current_version", 64).Nullable()
			table.Text("last_error").Nullable()
			table.String("health_status", 32).Default("unknown")
			table.TimestampsTz()
			table.Unique("plugin_id")
			table.Index("state")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("plugin_versions") {
		if err := facades.Schema().Create("plugin_versions", func(table schema.Blueprint) {
			table.ID()
			table.ForeignID("plugin_id").Constrained("plugins", "id", "fk_plugin_versions_plugin_id").CascadeOnDelete()
			table.String("version", 64)
			table.String("package_hash", 80)
			table.String("install_root", 500)
			table.Text("manifest_json")
			table.Text("dependencies")
			table.String("signature_key_id", 150).Nullable()
			table.String("state", 32)
			table.String("health_status", 32).Default("unknown")
			table.Text("last_error").Nullable()
			table.TimestampsTz()
			table.Unique("plugin_id", "version")
			table.Index("package_hash")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("plugin_processes") {
		if err := facades.Schema().Create("plugin_processes", func(table schema.Blueprint) {
			table.ID()
			table.ForeignID("plugin_version_id").Constrained("plugin_versions", "id", "fk_plugin_processes_version_id").CascadeOnDelete()
			table.Integer("pid").Nullable()
			table.String("address", 255).Nullable()
			table.String("state", 32)
			table.String("health_status", 32).Default("unknown")
			table.Text("last_error").Nullable()
			table.DateTimeTz("started_at").Nullable()
			table.DateTimeTz("stopped_at").Nullable()
			table.TimestampsTz()
			table.Index("state")
		}); err != nil {
			return err
		}
	}

	return nil
}

func (r *M20260909000001CreatePluginTables) Down() error {
	for _, table := range []string{"plugin_processes", "plugin_versions", "plugins"} {
		if err := facades.Schema().DropIfExists(table); err != nil {
			return err
		}
	}
	return nil
}
