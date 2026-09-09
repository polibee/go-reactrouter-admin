package routes

import (
	"context"

	"github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/modules"
	"github.com/polibee/go-reactrouter/backend/openapi"
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

	facades.Route().Get("/openapi.json", func(ctx http.Context) http.Response {
		return ctx.Response().Header("Content-Type", "application/json; charset=utf-8").Data(http.StatusOK, "application/json; charset=utf-8", openapi.Spec())
	})

	facades.Route().Get("/docs", func(ctx http.Context) http.Response {
		return ctx.Response().Header("Content-Type", "text/html; charset=utf-8").String(http.StatusOK, openapi.DocsHTML())
	})

	facades.Route().Static("public", "./public")
}
