package middleware

import (
	"testing"

	"github.com/polibee/go-reactrouter/backend/app/models"
)

func TestAuthorizationUserFromModelIncludesRolePermissions(t *testing.T) {
	user := models.User{
		Roles: []models.Role{
			{
				Name: "operators",
				Permissions: []models.Permission{
					{Code: "users.view"},
					{Code: "menus.*"},
				},
			},
		},
	}

	authorized := authorizationUserFromModel(user)
	if authorized.ID != "0" {
		t.Fatalf("expected zero-value model id to be preserved, got %q", authorized.ID)
	}
	if !authorized.Allows("users.view") || !authorized.Allows("menus.edit") {
		t.Fatalf("expected role permissions to be available: %+v", authorized)
	}
	if len(authorized.Roles) != 1 || authorized.Roles[0].Name != "operators" {
		t.Fatalf("expected role to be mapped, got %+v", authorized.Roles)
	}
}
