package routes

import (
	"context"

	"github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/modules"
)

func Web() {
	// Add product-owned modules to modules.ApplicationModules as the application grows.
	// Runtime-installable plugins use a separate manager and are not compiled
	// into the main application module graph.
	if err := modules.BootApplicationModules(context.Background()); err != nil {
		panic(err)
	}

	facades.Route().Get("/", func(ctx http.Context) http.Response {
		return ctx.Response().Success().Json(http.Json{
			"data": http.Json{
				"name":   "go-reactrouter",
				"status": "ok",
			},
			"message": "API is running",
		})
	})

	facades.Route().Get("/health", func(ctx http.Context) http.Response {
		return ctx.Response().Success().Json(http.Json{
			"data": http.Json{
				"status": "ok",
			},
		})
	})

	facades.Route().Static("public", "./public")
}
