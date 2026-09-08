package middleware

import (
	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/internal/authn"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

// Authenticate parses the Core JWT from the Authorization header or the
// HttpOnly cookie and makes the authenticated guard available to downstream
// controllers through the Goravel auth facade.
func Authenticate() contractshttp.Middleware {
	return &authenticateMiddleware{}
}

type authenticateMiddleware struct{}

func (m *authenticateMiddleware) Signature() string {
	return "go-reactrouter:authenticate"
}

func (m *authenticateMiddleware) Handle(ctx contractshttp.Context) {
	token, ok := authn.ExtractToken(
		ctx.Request().Header("Authorization"),
		ctx.Request().Cookie(authn.AccessTokenCookieName),
	)
	if !ok {
		abortAuthentication(ctx, "auth.unauthenticated", "authentication is required")
		return
	}

	if _, err := facades.Auth(ctx).Parse(token); err != nil {
		abortAuthentication(ctx, "auth.invalid_token", "authentication token is invalid or expired")
		return
	}

	ctx.Request().Next()
}

func abortAuthentication(ctx contractshttp.Context, code, message string) {
	if err := ctx.Response().Json(contractshttp.StatusUnauthorized, contracts.Failure(code, message)).Abort(); err != nil {
		panic(err)
	}
}
