package models

import "github.com/goravel/framework/database/orm"

// Menu is a server-owned navigation item. The API filters it by permission
// before the frontend receives it.
type Menu struct {
	orm.Model

	Key        string  `gorm:"size:150;uniqueIndex;not null" json:"key"`
	Label      string  `gorm:"size:150;not null" json:"label"`
	Path       *string `gorm:"size:255" json:"path,omitempty"`
	Icon       *string `gorm:"size:100" json:"icon,omitempty"`
	Permission *string `gorm:"size:150" json:"permission,omitempty"`
	ParentID   *uint   `json:"parent_id,omitempty"`
	Sort       int     `gorm:"not null;default:0" json:"sort"`
	IsVisible  bool    `gorm:"not null;default:true" json:"is_visible"`
	Meta       *string `json:"meta,omitempty"`
}

func (Menu) TableName() string { return "menus" }
