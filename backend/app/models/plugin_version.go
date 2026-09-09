package models

import "github.com/goravel/framework/database/orm"

// PluginVersion records a validated package without executing its backend.
type PluginVersion struct {
	orm.Model
	PluginID       uint            `gorm:"not null;index;uniqueIndex:plugin_version_unique" json:"plugin_id"`
	Version        string          `gorm:"size:64;not null;uniqueIndex:plugin_version_unique" json:"version"`
	PackageHash    string          `gorm:"size:80;not null;index" json:"package_hash"`
	InstallRoot    string          `gorm:"size:500;not null" json:"install_root"`
	ManifestJSON   string          `gorm:"type:text;not null" json:"manifest_json"`
	Dependencies   string          `gorm:"type:text;not null" json:"dependencies"`
	SignatureKeyID *string         `gorm:"size:150" json:"signature_key_id,omitempty"`
	State          string          `gorm:"size:32;not null" json:"state"`
	HealthStatus   string          `gorm:"size:32;not null;default:'unknown'" json:"health_status"`
	LastError      *string         `gorm:"type:text" json:"last_error,omitempty"`
	Plugin         *Plugin         `json:"plugin,omitempty"`
	Processes      []PluginProcess `json:"processes,omitempty"`
}

func (PluginVersion) TableName() string { return "plugin_versions" }
