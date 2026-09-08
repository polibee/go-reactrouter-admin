package controllers

import (
	"sort"
	"strconv"
	"strings"

	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

// LoginRequest is the public credential input for Core authentication.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthUser is the frontend-safe authorization view of a user. It intentionally
// excludes password hashes and database relationships.
type AuthUser struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Email       string   `json:"email"`
	Roles       []string `json:"roles"`
	Permissions []string `json:"permissions"`
}

func normalizeLoginRequest(request LoginRequest) LoginRequest {
	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	return request
}

func validateLoginRequest(request LoginRequest) contracts.APIFieldErrors {
	fieldErrors := contracts.APIFieldErrors{}
	if strings.TrimSpace(request.Email) == "" {
		fieldErrors["email"] = []string{"Email is required"}
	}
	if request.Password == "" {
		fieldErrors["password"] = []string{"Password is required"}
	}
	return fieldErrors
}

func buildAuthUser(user models.User) AuthUser {
	roles := make([]string, 0, len(user.Roles))
	permissions := make(map[string]struct{})
	for _, role := range user.Roles {
		if role.Name != "" {
			roles = append(roles, role.Name)
		}
		for _, permission := range role.Permissions {
			if permission.Code != "" {
				permissions[permission.Code] = struct{}{}
			}
		}
	}

	permissionCodes := make([]string, 0, len(permissions))
	for code := range permissions {
		permissionCodes = append(permissionCodes, code)
	}
	sort.Strings(permissionCodes)

	return AuthUser{
		ID:          strconv.FormatUint(uint64(user.ID), 10),
		Name:        user.Name,
		Email:       user.Email,
		Roles:       roles,
		Permissions: permissionCodes,
	}
}
