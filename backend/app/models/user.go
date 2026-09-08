package models

import (
	"time"

	"github.com/goravel/framework/database/orm"
)

// User is the persistent identity used by the default Goravel ORM provider.
type User struct {
	orm.Model
	orm.SoftDeletes

	Name        string     `gorm:"size:150;not null" json:"name"`
	Email       string     `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password    string     `gorm:"size:255;not null" json:"-"`
	Status      string     `gorm:"size:32;not null;default:active" json:"status"`
	IsActive    bool       `gorm:"not null;default:true" json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
	Roles       []Role     `gorm:"many2many:user_roles" json:"roles,omitempty"`
}

func (User) TableName() string { return "users" }
