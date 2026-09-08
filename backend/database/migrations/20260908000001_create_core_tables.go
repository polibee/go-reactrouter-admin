package migrations

import (
	"github.com/goravel/framework/contracts/database/schema"

	"github.com/polibee/go-reactrouter/backend/app/facades"
)

// M20260908000001CreateCoreTables creates the persistence foundation shared by
// the admin module and application modules.
type M20260908000001CreateCoreTables struct{}

// Signature returns the unique migration signature.
func (r *M20260908000001CreateCoreTables) Signature() string {
	return "20260908000001_create_core_tables"
}

// Up creates core identity, authorization, navigation, settings, and audit
// tables. The migration is intentionally free of seed data; projects decide
// how their first administrator is provisioned.
func (r *M20260908000001CreateCoreTables) Up() error {
	if !facades.Schema().HasTable("users") {
		if err := facades.Schema().Create("users", func(table schema.Blueprint) {
			table.ID()
			table.String("name", 150)
			table.String("email", 255)
			table.String("password", 255)
			table.String("status", 32).Default("active")
			table.Boolean("is_active").Default(true)
			table.DateTimeTz("last_login_at").Nullable()
			table.TimestampsTz()
			table.SoftDeletesTz()
			table.Unique("email")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("roles") {
		if err := facades.Schema().Create("roles", func(table schema.Blueprint) {
			table.ID()
			table.String("name", 100)
			table.String("display_name", 150)
			table.Text("description").Nullable()
			table.Boolean("is_system").Default(false)
			table.TimestampsTz()
			table.Unique("name")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("permissions") {
		if err := facades.Schema().Create("permissions", func(table schema.Blueprint) {
			table.ID()
			table.String("code", 150)
			table.String("display_name", 150)
			table.Text("description").Nullable()
			table.String("module_id", 100).Nullable()
			table.TimestampsTz()
			table.Unique("code")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("user_roles") {
		if err := facades.Schema().Create("user_roles", func(table schema.Blueprint) {
			table.ID()
			table.ForeignID("user_id").Constrained("users", "id", "fk_user_roles_user_id").CascadeOnDelete()
			table.ForeignID("role_id").Constrained("roles", "id", "fk_user_roles_role_id").CascadeOnDelete()
			table.TimestampsTz()
			table.Unique("user_id", "role_id")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("role_permissions") {
		if err := facades.Schema().Create("role_permissions", func(table schema.Blueprint) {
			table.ID()
			table.ForeignID("role_id").Constrained("roles", "id", "fk_role_permissions_role_id").CascadeOnDelete()
			table.ForeignID("permission_id").Constrained("permissions", "id", "fk_role_permissions_permission_id").CascadeOnDelete()
			table.TimestampsTz()
			table.Unique("role_id", "permission_id")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("menus") {
		if err := facades.Schema().Create("menus", func(table schema.Blueprint) {
			table.ID()
			table.String("key", 150)
			table.String("label", 150)
			table.String("path", 255).Nullable()
			table.String("icon", 100).Nullable()
			table.String("permission", 150).Nullable()
			table.UnsignedBigInteger("parent_id").Nullable()
			table.Integer("sort").Default(0)
			table.Boolean("is_visible").Default(true)
			table.Text("meta").Nullable()
			table.TimestampsTz()
			table.Unique("key")
			table.Index("parent_id")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("settings") {
		if err := facades.Schema().Create("settings", func(table schema.Blueprint) {
			table.ID()
			table.String("key", 150)
			table.Text("value")
			table.String("type", 32).Default("string")
			table.Boolean("is_public").Default(false)
			table.TimestampsTz()
			table.Unique("key")
		}); err != nil {
			return err
		}
	}

	if !facades.Schema().HasTable("audit_logs") {
		if err := facades.Schema().Create("audit_logs", func(table schema.Blueprint) {
			table.ID()
			table.UnsignedBigInteger("user_id").Nullable()
			table.String("action", 100)
			table.String("resource_type", 150)
			table.String("resource_id", 100).Nullable()
			table.String("request_id", 100).Nullable()
			table.String("ip_address", 64).Nullable()
			table.Text("user_agent").Nullable()
			table.Text("before_data").Nullable()
			table.Text("after_data").Nullable()
			table.TimestampsTz()
			table.Index("user_id")
			table.Index("resource_type", "resource_id")
			table.Index("created_at")
		}); err != nil {
			return err
		}
	}

	return nil
}

// Down removes the core tables in dependency order.
func (r *M20260908000001CreateCoreTables) Down() error {
	for _, table := range []string{
		"audit_logs",
		"settings",
		"menus",
		"role_permissions",
		"user_roles",
		"permissions",
		"roles",
		"users",
	} {
		if err := facades.Schema().DropIfExists(table); err != nil {
			return err
		}
	}

	return nil
}
