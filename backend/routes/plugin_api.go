package routes

import (
	"errors"
	"io"
	"sort"
	"strings"

	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/http/middleware"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/app/services"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
	"github.com/polibee/go-reactrouter/backend/internal/gateway"
)

var pluginRuntimeService = services.NewPluginRuntimeService(services.PluginRuntimeConfig{})

func PluginRuntimeService() *services.PluginRuntimeService { return pluginRuntimeService }

// RegisterPluginGatewayRoutes exposes the stable Core prefix used by frontend
// clients. The plugin process is never exposed directly to a browser.
func RegisterPluginGatewayRoutes() {
	resolver := middleware.NewDatabaseUserResolver()
	route := facades.Route().Prefix("/api/v1/plugins").Middleware(middleware.Authenticate())
	route.Any("/{pluginID}/*path", func(ctx contractshttp.Context) contractshttp.Response {
		return proxyPluginRequest(ctx, resolver)
	})
}

func proxyPluginRequest(ctx contractshttp.Context, resolver middleware.UserResolver) contractshttp.Response {
	authorized, err := resolver.Resolve(ctx)
	if err != nil {
		return ctx.Response().Json(contractshttp.StatusUnauthorized, contracts.Failure("auth.user_unavailable", "authenticated user is unavailable"))
	}
	var user models.User
	if err := facades.Auth(ctx).User(&user); err != nil {
		return ctx.Response().Json(contractshttp.StatusUnauthorized, contracts.Failure("auth.user_unavailable", "authenticated user is unavailable"))
	}

	permissionSet := make(map[string]struct{})
	for code := range authorized.Permissions {
		permissionSet[code] = struct{}{}
	}
	for _, role := range authorized.Roles {
		for code := range role.Permissions {
			permissionSet[code] = struct{}{}
		}
	}
	permissions := make([]string, 0, len(permissionSet))
	for code := range permissionSet {
		permissions = append(permissions, code)
	}
	sort.Strings(permissions)

	rawRequest := ctx.Request().Origin()
	pluginID := ctx.Request().Route("pluginID")
	path := ctx.Request().Path()
	prefix := "/api/v1/plugins/" + pluginID
	path = strings.TrimPrefix(path, prefix)
	if path == "" {
		path = "/"
	}
	response, err := pluginRuntimeService.Proxy(ctx, pluginID, gateway.GatewayRequest{
		Method: ctx.Request().Method(), Path: path, Query: rawRequest.URL.RawQuery,
		Header: ctx.Request().Headers(), Body: rawRequest.Body,
		Identity: gateway.Identity{UserID: authorized.ID, Email: user.Email, Permissions: permissions},
	})
	if err != nil {
		status := contractshttp.StatusBadGateway
		if errors.Is(err, gateway.ErrPluginNotEnabled) {
			status = contractshttp.StatusForbidden
		}
		return ctx.Response().Json(status, contracts.Failure("plugin.gateway_failed", err.Error()))
	}
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return ctx.Response().Json(contractshttp.StatusBadGateway, contracts.Failure("plugin.gateway_read_failed", err.Error()))
	}
	for key, values := range response.Header {
		if len(values) > 0 && key != "Content-Length" {
			ctx.Response().Header(key, values[0])
		}
	}
	contentType := response.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/json; charset=utf-8"
	}
	return ctx.Response().Data(response.Status, contentType, body)
}
