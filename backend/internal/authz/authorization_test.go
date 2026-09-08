package authz

import "testing"

func TestPermissionSetAllowsExactAndWildcardPermissions(t *testing.T) {
	permissions := NewPermissionSet("users.view", "reports.*")

	tests := []struct {
		name       string
		permission string
		want       bool
	}{
		{name: "exact permission", permission: "users.view", want: true},
		{name: "wildcard permission", permission: "reports.export", want: true},
		{name: "unrelated permission", permission: "users.delete", want: false},
		{name: "empty permission", permission: "", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := permissions.Allows(tt.permission); got != tt.want {
				t.Fatalf("Allows(%q) = %v, want %v", tt.permission, got, tt.want)
			}
		})
	}
}

func TestUserAuthorizationMergesDirectAndRolePermissions(t *testing.T) {
	user := User{
		Permissions: NewPermissionSet("settings.view"),
		Roles: []Role{
			{Name: "operator", Permissions: NewPermissionSet("users.view", "reports.*")},
			{Name: "auditor", Permissions: NewPermissionSet("audit.view")},
		},
	}

	for _, permission := range []string{"settings.view", "users.view", "reports.export", "audit.view"} {
		if !user.Allows(permission) {
			t.Errorf("user should be allowed to %q", permission)
		}
	}

	if user.Allows("users.delete") {
		t.Error("user should not be allowed to users.delete")
	}
}

func TestPermissionSetNormalizesEmptyAndDuplicateCodes(t *testing.T) {
	permissions := NewPermissionSet("", " users.view ", "users.view", "reports.*")

	if len(permissions) != 2 {
		t.Fatalf("permission set has %d entries, want 2", len(permissions))
	}

	if !permissions.Allows("users.view") || !permissions.Allows("reports.export") {
		t.Error("normalized permissions should be effective")
	}
}
