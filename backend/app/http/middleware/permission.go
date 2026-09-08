package middleware

import (
	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/internal/authz"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

// Decision is the result of a permission check.
type Decision string

const (
	DecisionAllowed         Decision = "allowed"
	DecisionUnauthenticated Decision = "unauthenticated"
	DecisionForbidden       Decision = "forbidden"
)

// Authorize applies the same policy used by the HTTP middleware without
// depending on a request or database. A nil user is treated as unauthenticated.
func Authorize(user *authz.User, permission string) Decision {
	if user == nil {
		return DecisionUnauthenticated
	}
	if !user.Allows(permission) {
		return DecisionForbidden
	}

	return DecisionAllowed
}

// UserResolver loads the authorization view for the current request. The
// authentication implementation owns JWT/session parsing and role loading;
// this seam keeps middleware independent from the selected auth strategy.
type UserResolver interface {
	Resolve(contractshttp.Context) (*authz.User, error)
}

// RequirePermission returns a middleware that enforces a single permission.
func RequirePermission(permission string, resolver UserResolver) contractshttp.Middleware {
	return &permissionMiddleware{permission: permission, resolver: resolver}
}

type permissionMiddleware struct {
	permission string
	resolver   UserResolver
}

func (m *permissionMiddleware) Signature() string {
	return "go-reactrouter:require_permission:" + m.permission
}

func (m *permissionMiddleware) Handle(ctx contractshttp.Context) {
	if m.resolver == nil {
		abortPermission(ctx, contractshttp.StatusInternalServerError, "auth.resolver_unavailable", "authorization resolver is not configured")
		return
	}

	user, err := m.resolver.Resolve(ctx)
	if err != nil {
		abortPermission(ctx, contractshttp.StatusUnauthorized, "auth.unauthenticated", err.Error())
		return
	}

	switch Authorize(user, m.permission) {
	case DecisionAllowed:
		ctx.Request().Next()
	case DecisionUnauthenticated:
		abortPermission(ctx, contractshttp.StatusUnauthorized, "auth.unauthenticated", "authentication is required")
	case DecisionForbidden:
		abortPermission(ctx, contractshttp.StatusForbidden, "auth.forbidden", "permission is required: "+m.permission)
	}
}

func abortPermission(ctx contractshttp.Context, status int, code, message string) {
	if err := ctx.Response().Json(status, contracts.Failure(code, message)).Abort(); err != nil {
		panic(err)
	}
}
