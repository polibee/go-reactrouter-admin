package controllers

import (
	"testing"

	"github.com/polibee/go-reactrouter/backend/app/models"
)

func TestNormalizeLoginRequestTrimsAndNormalizesEmail(t *testing.T) {
	request := normalizeLoginRequest(LoginRequest{
		Email:    " Admin@Example.COM ",
		Password: " secret ",
	})

	if request.Email != "admin@example.com" {
		t.Fatalf("email = %q, want admin@example.com", request.Email)
	}
	if request.Password != " secret " {
		t.Fatalf("password was modified: %q", request.Password)
	}
}

func TestValidateLoginRequestReportsFieldErrors(t *testing.T) {
	errors := validateLoginRequest(LoginRequest{})

	if len(errors["email"]) == 0 || len(errors["password"]) == 0 {
		t.Fatalf("validation errors = %#v, want email and password errors", errors)
	}
}

func TestBuildAuthUserFlattensRolesAndDeduplicatesPermissions(t *testing.T) {
	user := models.User{
		Name:  "Admin",
		Email: "admin@example.com",
		Roles: []models.Role{
			{
				Name: "operator",
				Permissions: []models.Permission{
					{Code: "users.view"},
					{Code: "reports.*"},
				},
			},
			{
				Name: "auditor",
				Permissions: []models.Permission{
					{Code: "users.view"},
				},
			},
		},
	}
	user.ID = 7

	result := buildAuthUser(user)

	if result.ID != "7" || len(result.Roles) != 2 {
		t.Fatalf("identity = %#v", result)
	}
	if len(result.Permissions) != 2 || result.Permissions[0] != "reports.*" || result.Permissions[1] != "users.view" {
		t.Fatalf("permissions = %#v, want sorted unique permissions", result.Permissions)
	}
}
