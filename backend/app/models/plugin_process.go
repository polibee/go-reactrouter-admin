package models

import (
	"time"

	"github.com/goravel/framework/database/orm"
)

// PluginProcess reserves lifecycle state for the supervised process stage.
type PluginProcess struct {
	orm.Model
	PluginVersionID uint           `gorm:"not null;index" json:"plugin_version_id"`
	PID             *int           `json:"pid,omitempty"`
	Address         *string        `gorm:"size:255" json:"address,omitempty"`
	State           string         `gorm:"size:32;not null" json:"state"`
	HealthStatus    string         `gorm:"size:32;not null;default:'unknown'" json:"health_status"`
	LastError       *string        `gorm:"type:text" json:"last_error,omitempty"`
	StartedAt       *time.Time     `json:"started_at,omitempty"`
	StoppedAt       *time.Time     `json:"stopped_at,omitempty"`
	PluginVersion   *PluginVersion `json:"plugin_version,omitempty"`
}

func (PluginProcess) TableName() string { return "plugin_processes" }
