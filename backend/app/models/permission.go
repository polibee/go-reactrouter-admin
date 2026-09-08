package models

import "github.com/goravel/framework/database/orm"

// Permission is a stable capability code used by backend policies and menu
// visibility checks.
type Permission struct {
	orm.Model

	Code        string  `gorm:"size:150;uniqueIndex;not null" json:"code"`
	DisplayName string  `gorm:"size:150;not null" json:"display_name"`
	Description *string `json:"description,omitempty"`
	ModuleID    *string `gorm:"size:100" json:"module_id,omitempty"`
	Roles       []Role  `gorm:"many2many:role_permissions" json:"roles,omitempty"`
}

func (Permission) TableName() string { return "permissions" }
