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
}
