package models

import "github.com/goravel/framework/database/orm"

// Setting stores typed application configuration values owned by Core.
type Setting struct {
	orm.Model

	Key      string `gorm:"size:150;uniqueIndex;not null" json:"key"`
	Value    string `gorm:"type:text;not null" json:"value"`
	Type     string `gorm:"size:32;not null;default:string" json:"type"`
	IsPublic bool   `gorm:"not null;default:false" json:"is_public"`
}

func (Setting) TableName() string { return "settings" }
