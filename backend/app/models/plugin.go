package models

import "github.com/goravel/framework/database/orm"

// Plugin is the durable identity and current state of an installable plugin.
type Plugin struct {
	orm.Model
	PluginID       string          `gorm:"size:150;uniqueIndex;not null" json:"plugin_id"`
	Name           string          `gorm:"size:150;not null" json:"name"`
	DisplayName    string          `gorm:"size:200;not null" json:"display_name"`
	State          string          `gorm:"size:32;not null" json:"state"`
	CurrentVersion *string         `gorm:"size:64" json:"current_version,omitempty"`
	LastError      *string         `gorm:"type:text" json:"last_error,omitempty"`
	HealthStatus   string          `gorm:"size:32;not null;default:'unknown'" json:"health_status"`
	Versions       []PluginVersion `json:"versions,omitempty"`
}

func (Plugin) TableName() string { return "plugins" }
