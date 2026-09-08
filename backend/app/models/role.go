package models

import "github.com/goravel/framework/database/orm"

// Role groups permissions for assignment to users.
type Role struct {
	orm.Model

	Name        string       `gorm:"size:100;uniqueIndex;not null" json:"name"`
	DisplayName string       `gorm:"size:150;not null" json:"display_name"`
	Description *string      `json:"description,omitempty"`
	IsSystem    bool         `gorm:"not null;default:false" json:"is_system"`
	Users       []User       `gorm:"many2many:user_roles" json:"users,omitempty"`
	Permissions []Permission `gorm:"many2many:role_permissions" json:"permissions,omitempty"`
}

func (Role) TableName() string { return "roles" }
