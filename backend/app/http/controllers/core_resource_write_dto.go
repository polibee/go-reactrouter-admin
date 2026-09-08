package controllers

import (
	"net/mail"
	"strconv"
	"strings"
)

type UserWriteRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Status   string `json:"status"`
	IsActive *bool  `json:"is_active"`
	RoleIDs  []uint `json:"role_ids"`
}

type RoleWriteRequest struct {
	Name          string  `json:"name"`
	DisplayName   string  `json:"display_name"`
	Description   *string `json:"description"`
	IsSystem      *bool   `json:"is_system"`
	PermissionIDs []uint  `json:"permission_ids"`
}

type PermissionWriteRequest struct {
	Code        string  `json:"code"`
	DisplayName string  `json:"display_name"`
	Description *string `json:"description"`
	ModuleID    *string `json:"module_id"`
}

type MenuWriteRequest struct {
	Key        string  `json:"key"`
	Label      string  `json:"label"`
	Path       *string `json:"path"`
	Icon       *string `json:"icon"`
	Permission *string `json:"permission"`
	ParentID   *uint   `json:"parent_id"`
	Sort       *int    `json:"sort"`
	IsVisible  *bool   `json:"is_visible"`
	Meta       *string `json:"meta"`
}

type SettingWriteRequest struct {
	Key      string `json:"key"`
	Value    string `json:"value"`
	Type     string `json:"type"`
	IsPublic *bool  `json:"is_public"`
}

func validateUserWriteRequest(request UserWriteRequest, creating bool) map[string][]string {
	errors := map[string][]string{}
	if strings.TrimSpace(request.Name) == "" {
		errors["name"] = []string{"Name is required"}
	}
	if _, err := mail.ParseAddress(strings.TrimSpace(request.Email)); err != nil {
		errors["email"] = []string{"A valid email is required"}
	}
	if creating && strings.TrimSpace(request.Password) == "" {
		errors["password"] = []string{"Password is required"}
	}
	if request.Status == "" {
		request.Status = "active"
	}
	if request.Status != "active" && request.Status != "disabled" {
		errors["status"] = []string{"Status must be active or disabled"}
	}
	return errors
}

func parseResourceID(value string) (uint, bool) {
	parsed, err := strconv.ParseUint(strings.TrimSpace(value), 10, 32)
	if err != nil || parsed == 0 {
		return 0, false
	}
	return uint(parsed), true
}

func validateRoleWriteRequest(request RoleWriteRequest) map[string][]string {
	errors := map[string][]string{}
	if strings.TrimSpace(request.Name) == "" {
		errors["name"] = []string{"Name is required"}
	}
	if strings.TrimSpace(request.DisplayName) == "" {
		errors["display_name"] = []string{"Display name is required"}
	}
	return errors
}

func validatePermissionWriteRequest(request PermissionWriteRequest) map[string][]string {
	errors := map[string][]string{}
	if strings.TrimSpace(request.Code) == "" {
		errors["code"] = []string{"Code is required"}
	}
	if strings.TrimSpace(request.DisplayName) == "" {
		errors["display_name"] = []string{"Display name is required"}
	}
	return errors
}

func validateMenuWriteRequest(request MenuWriteRequest) map[string][]string {
	errors := map[string][]string{}
	if strings.TrimSpace(request.Key) == "" {
		errors["key"] = []string{"Key is required"}
	}
	if strings.TrimSpace(request.Label) == "" {
		errors["label"] = []string{"Label is required"}
	}
	return errors
}

func validateSettingWriteRequest(request SettingWriteRequest) map[string][]string {
	errors := map[string][]string{}
	if strings.TrimSpace(request.Key) == "" {
		errors["key"] = []string{"Key is required"}
	}
	if request.Type == "" {
		request.Type = "string"
	}
	return errors
}
