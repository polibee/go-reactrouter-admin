package controllers

import "time"

type UserListItem struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Email       string     `json:"email"`
	Status      string     `json:"status"`
	IsActive    bool       `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
}

type RoleListItem struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	DisplayName string   `json:"display_name"`
	Description *string  `json:"description,omitempty"`
	IsSystem    bool     `json:"is_system"`
	Permissions []string `json:"permissions"`
}

type PermissionListItem struct {
	ID          string  `json:"id"`
	Code        string  `json:"code"`
	DisplayName string  `json:"display_name"`
	Description *string `json:"description,omitempty"`
	ModuleID    *string `json:"module_id,omitempty"`
}

type MenuListItem struct {
	ID         string  `json:"id"`
	Key        string  `json:"key"`
	Label      string  `json:"label"`
	Path       *string `json:"path,omitempty"`
	Icon       *string `json:"icon,omitempty"`
	Permission *string `json:"permission,omitempty"`
	ParentID   *string `json:"parent_id,omitempty"`
	Sort       int     `json:"sort"`
	IsVisible  bool    `json:"is_visible"`
	Meta       *string `json:"meta,omitempty"`
}

type SettingListItem struct {
	ID       string `json:"id"`
	Key      string `json:"key"`
	Value    string `json:"value"`
	Type     string `json:"type"`
	IsPublic bool   `json:"is_public"`
}

type AuditLogListItem struct {
	ID           string  `json:"id"`
	UserID       *string `json:"user_id,omitempty"`
	Action       string  `json:"action"`
	ResourceType string  `json:"resource_type"`
	ResourceID   *string `json:"resource_id,omitempty"`
	RequestID    *string `json:"request_id,omitempty"`
	IPAddress    *string `json:"ip_address,omitempty"`
	UserAgent    *string `json:"user_agent,omitempty"`
	BeforeData   *string `json:"before_data,omitempty"`
	AfterData    *string `json:"after_data,omitempty"`
}
