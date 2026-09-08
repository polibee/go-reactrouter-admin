package middleware

import (
	"testing"

	"github.com/polibee/go-reactrouter/backend/internal/authz"
)

func TestAuthorizePermissionDistinguishesUnauthenticatedAndForbidden(t *testing.T) {
	tests := []struct {
		name       string
		user       *authz.User
		permission string
		want       Decision
	}{
		{name: "missing user", permission: "users.view", want: DecisionUnauthenticated},
		{name: "missing permission", user: &authz.User{}, permission: "users.view", want: DecisionForbidden},
		{name: "allowed", user: &authz.User{Permissions: authz.NewPermissionSet("users.view")}, permission: "users.view", want: DecisionAllowed},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := Authorize(tt.user, tt.permission); got != tt.want {
				t.Fatalf("Authorize() = %q, want %q", got, tt.want)
			}
		})
	}
}
