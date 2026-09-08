// Package authz contains the framework-independent authorization rules used by
// the core admin module and by future business modules.
package authz

import "strings"

// PermissionSet is a normalized set of permission codes.
type PermissionSet map[string]struct{}

// NewPermissionSet trims codes and removes empty or duplicate values.
func NewPermissionSet(codes ...string) PermissionSet {
	permissions := make(PermissionSet, len(codes))
	for _, code := range codes {
		code = strings.TrimSpace(code)
		if code == "" {
			continue
		}
		permissions[code] = struct{}{}
	}

	return permissions
}

// Allows reports whether the set grants a permission code. The global "*"
// code grants all permissions and a namespace wildcard such as "users.*"
// grants every permission below that namespace.
func (permissions PermissionSet) Allows(code string) bool {
	code = strings.TrimSpace(code)
	if code == "" {
		return false
	}

	if _, ok := permissions["*"]; ok {
		return true
	}
	if _, ok := permissions[code]; ok {
		return true
	}

	for candidate := code; ; {
		separator := strings.LastIndexByte(candidate, '.')
		if separator < 0 {
			return false
		}

		candidate = candidate[:separator]
		if _, ok := permissions[candidate+".*"]; ok {
			return true
		}
	}
}

// Role groups permissions that can be assigned to a user.
type Role struct {
	ID          string
	Name        string
	Permissions PermissionSet
}

// User is the authorization view of an authenticated user. Persistence and
// authentication concerns stay in the application layer; this type only
// models the permissions needed by policy checks.
type User struct {
	ID          string
	Permissions PermissionSet
	Roles       []Role
}

// Allows reports whether the user has a direct or role-derived permission.
func (user User) Allows(code string) bool {
	if user.Permissions.Allows(code) {
		return true
	}

	for _, role := range user.Roles {
		if role.Permissions.Allows(code) {
			return true
		}
	}

	return false
}
