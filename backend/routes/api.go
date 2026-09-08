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
	resourceController := controllers.NewCoreResourceController()
	resolver := middleware.NewDatabaseUserResolver()

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
	admin.Middleware(middleware.RequirePermission("roles.view", resolver)).Get("/roles", func(ctx http.Context) http.Response {
		return resourceController.Roles(ctx)
	})
	admin.Middleware(middleware.RequirePermission("permissions.view", resolver)).Get("/permissions", func(ctx http.Context) http.Response {
		return resourceController.Permissions(ctx)
	})
	admin.Middleware(middleware.RequirePermission("menus.view", resolver)).Get("/menus", func(ctx http.Context) http.Response {
		return resourceController.Menus(ctx)
	})
	admin.Middleware(middleware.RequirePermission("settings.view", resolver)).Get("/settings", func(ctx http.Context) http.Response {
		return resourceController.Settings(ctx)
	})
	admin.Middleware(middleware.RequirePermission("audit.view", resolver)).Get("/audit-logs", func(ctx http.Context) http.Response {
		return resourceController.AuditLogs(ctx)
	})
}
