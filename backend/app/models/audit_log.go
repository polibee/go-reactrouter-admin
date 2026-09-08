package models

import "github.com/goravel/framework/database/orm"

// AuditLog records administrative mutations and authentication events.
type AuditLog struct {
	orm.Model

	UserID       *uint   `json:"user_id,omitempty"`
	Action       string  `gorm:"size:100;not null" json:"action"`
	ResourceType string  `gorm:"size:150;not null" json:"resource_type"`
	ResourceID   *string `gorm:"size:100" json:"resource_id,omitempty"`
	RequestID    *string `gorm:"size:100" json:"request_id,omitempty"`
	IPAddress    *string `gorm:"size:64" json:"ip_address,omitempty"`
	UserAgent    *string `gorm:"type:text" json:"user_agent,omitempty"`
	BeforeData   *string `gorm:"type:text" json:"before_data,omitempty"`
	AfterData    *string `gorm:"type:text" json:"after_data,omitempty"`
	User         *User   `json:"user,omitempty"`
}

func (AuditLog) TableName() string { return "audit_logs" }
