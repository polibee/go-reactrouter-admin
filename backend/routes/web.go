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
		document, err := openapi.AggregatedSpec()
		if err != nil {
			return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": http.Json{"code": "openapi.aggregate_failed", "message": err.Error()}})
		}
		return ctx.Response().Header("Content-Type", "application/json; charset=utf-8").Data(http.StatusOK, "application/json; charset=utf-8", document)
	})

	facades.Route().Get("/openapi/plugins/{pluginId}.json", func(ctx http.Context) http.Response {
		document, ok := openapi.PluginSpec(ctx.Request().Route("pluginId"))
		if !ok {
			return ctx.Response().Json(http.StatusNotFound, http.Json{"error": http.Json{"code": "openapi.plugin_not_found", "message": "plugin OpenAPI document was not found"}})
		}
		return ctx.Response().Header("Content-Type", "application/json; charset=utf-8").Data(http.StatusOK, "application/json; charset=utf-8", document)
	})

	facades.Route().Get("/docs", func(ctx http.Context) http.Response {
		return ctx.Response().Header("Content-Type", "text/html; charset=utf-8").String(http.StatusOK, openapi.DocsHTML())
	})

	facades.Route().Static("public", "./public")
}
