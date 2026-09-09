package routes

import (
	"github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/http/controllers"
	"github.com/polibee/go-reactrouter/backend/app/http/middleware"
)

// API registers the versioned Core API boundary. Public and authenticated
// routes are separated explicitly so future resource controllers can attach
// permission middleware without changing the frontend contract.
func API() {
	authController := controllers.NewAuthController()
	resolver := middleware.NewDatabaseUserResolver()
	resourceController := controllers.NewCoreResourceController(resolver)
	pluginController := controllers.NewPluginController(PluginLifecycleService())

	facades.Route().Prefix("/api/v1/auth").Post("/login", func(ctx http.Context) http.Response {
		return authController.Login(ctx)
	})

	authenticated := facades.Route().Prefix("/api/v1/auth").Middleware(middleware.Authenticate())
	authenticated.Get("/me", func(ctx http.Context) http.Response {
		return authController.Me(ctx)
	})
	authenticated.Post("/logout", func(ctx http.Context) http.Response {
		return authController.Logout(ctx)
	})

	admin := facades.Route().Prefix("/api/v1/admin").Middleware(middleware.Authenticate())
	admin.Middleware(middleware.RequirePermission("users.view", resolver)).Get("/users", func(ctx http.Context) http.Response {
		return resourceController.Users(ctx)
	})
	admin.Middleware(middleware.RequirePermission("users.view", resolver)).Get("/users/{id}", func(ctx http.Context) http.Response {
		return resourceController.User(ctx)
	})
	admin.Middleware(middleware.RequirePermission("roles.view", resolver)).Get("/roles", func(ctx http.Context) http.Response {
		return resourceController.Roles(ctx)
	})
	admin.Middleware(middleware.RequirePermission("roles.view", resolver)).Get("/roles/{id}", func(ctx http.Context) http.Response {
		return resourceController.Role(ctx)
	})
	admin.Middleware(middleware.RequirePermission("permissions.view", resolver)).Get("/permissions", func(ctx http.Context) http.Response {
		return resourceController.Permissions(ctx)
	})
	admin.Middleware(middleware.RequirePermission("permissions.view", resolver)).Get("/permissions/{id}", func(ctx http.Context) http.Response {
		return resourceController.Permission(ctx)
	})
	admin.Middleware(middleware.RequirePermission("menus.view", resolver)).Get("/menus", func(ctx http.Context) http.Response {
		return resourceController.Menus(ctx)
	})
	admin.Middleware(middleware.RequirePermission("menus.view", resolver)).Get("/menus/{id}", func(ctx http.Context) http.Response {
		return resourceController.Menu(ctx)
	})
	admin.Middleware(middleware.RequirePermission("settings.view", resolver)).Get("/settings", func(ctx http.Context) http.Response {
		return resourceController.Settings(ctx)
	})
	admin.Middleware(middleware.RequirePermission("settings.view", resolver)).Get("/settings/{id}", func(ctx http.Context) http.Response {
		return resourceController.Setting(ctx)
	})
	admin.Middleware(middleware.RequirePermission("audit.view", resolver)).Get("/audit-logs", func(ctx http.Context) http.Response {
		return resourceController.AuditLogs(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.view", resolver)).Get("/plugins", func(ctx http.Context) http.Response {
		return pluginController.List(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.view", resolver)).Get("/plugins/{id}", func(ctx http.Context) http.Response {
		return pluginController.Detail(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.validate", resolver)).Post("/plugins/validate", func(ctx http.Context) http.Response {
		return pluginController.Validate(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.manage", resolver)).Post("/plugins/install", func(ctx http.Context) http.Response {
		return pluginController.Install(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.manage", resolver)).Post("/plugins/{id}/enable", func(ctx http.Context) http.Response {
		return pluginController.Enable(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.manage", resolver)).Post("/plugins/{id}/disable", func(ctx http.Context) http.Response {
		return pluginController.Disable(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.manage", resolver)).Post("/plugins/{id}/upgrade", func(ctx http.Context) http.Response {
		return pluginController.Upgrade(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.manage", resolver)).Post("/plugins/{id}/uninstall", func(ctx http.Context) http.Response {
		return pluginController.Uninstall(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.view", resolver)).Get("/plugins/{id}/versions", func(ctx http.Context) http.Response {
		return pluginController.Versions(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.view", resolver)).Get("/plugins/{id}/logs", func(ctx http.Context) http.Response {
		return pluginController.Logs(ctx)
	})
	admin.Middleware(middleware.RequirePermission("plugins.view", resolver)).Get("/plugin-operations/{operationID}", func(ctx http.Context) http.Response {
		return pluginController.Operation(ctx)
	})

	admin.Middleware(middleware.RequirePermission("users.create", resolver)).Post("/users", func(ctx http.Context) http.Response {
		return resourceController.CreateUser(ctx)
	})
	admin.Middleware(middleware.RequirePermission("users.update", resolver)).Put("/users/{id}", func(ctx http.Context) http.Response {
		return resourceController.UpdateUser(ctx)
	})
	admin.Middleware(middleware.RequirePermission("users.delete", resolver)).Delete("/users/{id}", func(ctx http.Context) http.Response {
		return resourceController.DeleteUser(ctx)
	})
	admin.Middleware(middleware.RequirePermission("roles.create", resolver)).Post("/roles", func(ctx http.Context) http.Response {
		return resourceController.CreateRole(ctx)
	})
	admin.Middleware(middleware.RequirePermission("roles.update", resolver)).Put("/roles/{id}", func(ctx http.Context) http.Response {
		return resourceController.UpdateRole(ctx)
	})
	admin.Middleware(middleware.RequirePermission("roles.delete", resolver)).Delete("/roles/{id}", func(ctx http.Context) http.Response {
		return resourceController.DeleteRole(ctx)
	})
	admin.Middleware(middleware.RequirePermission("permissions.create", resolver)).Post("/permissions", func(ctx http.Context) http.Response {
		return resourceController.CreatePermission(ctx)
	})
	admin.Middleware(middleware.RequirePermission("permissions.update", resolver)).Put("/permissions/{id}", func(ctx http.Context) http.Response {
		return resourceController.UpdatePermission(ctx)
	})
	admin.Middleware(middleware.RequirePermission("permissions.delete", resolver)).Delete("/permissions/{id}", func(ctx http.Context) http.Response {
		return resourceController.DeletePermission(ctx)
	})
	admin.Middleware(middleware.RequirePermission("menus.create", resolver)).Post("/menus", func(ctx http.Context) http.Response {
		return resourceController.CreateMenu(ctx)
	})
	admin.Middleware(middleware.RequirePermission("menus.update", resolver)).Put("/menus/{id}", func(ctx http.Context) http.Response {
		return resourceController.UpdateMenu(ctx)
	})
	admin.Middleware(middleware.RequirePermission("menus.delete", resolver)).Delete("/menus/{id}", func(ctx http.Context) http.Response {
		return resourceController.DeleteMenu(ctx)
	})
	admin.Middleware(middleware.RequirePermission("settings.create", resolver)).Post("/settings", func(ctx http.Context) http.Response {
		return resourceController.CreateSetting(ctx)
	})
	admin.Middleware(middleware.RequirePermission("settings.update", resolver)).Put("/settings/{id}", func(ctx http.Context) http.Response {
		return resourceController.UpdateSetting(ctx)
	})
	admin.Middleware(middleware.RequirePermission("settings.delete", resolver)).Delete("/settings/{id}", func(ctx http.Context) http.Response {
		return resourceController.DeleteSetting(ctx)
	})

	RegisterPluginGatewayRoutes()
}
