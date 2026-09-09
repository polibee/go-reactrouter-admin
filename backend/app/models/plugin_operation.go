package models

import (
	"time"

	"github.com/goravel/framework/database/orm"
)

// PluginOperation records a durable lifecycle request. Operations are kept
// after uninstall so an administrator can inspect what happened to a plugin.
type PluginOperation struct {
	orm.Model
	OperationID     string         `gorm:"size:80;uniqueIndex;not null" json:"operation_id"`
	PluginID        uint           `gorm:"not null;index" json:"plugin_id"`
	PluginVersionID *uint          `gorm:"index" json:"plugin_version_id,omitempty"`
	Type            string         `gorm:"size:32;not null" json:"type"`
	State           string         `gorm:"size:32;not null" json:"state"`
	Progress        int            `gorm:"not null;default:0" json:"progress"`
	Message         *string        `gorm:"type:text" json:"message,omitempty"`
	LastError       *string        `gorm:"type:text" json:"last_error,omitempty"`
	UserID          *uint          `gorm:"index" json:"user_id,omitempty"`
	StartedAt       *time.Time     `json:"started_at,omitempty"`
	FinishedAt      *time.Time     `json:"finished_at,omitempty"`
	Plugin          *Plugin        `json:"plugin,omitempty"`
	PluginVersion   *PluginVersion `json:"plugin_version,omitempty"`
}

func (PluginOperation) TableName() string { return "plugin_operations" }
