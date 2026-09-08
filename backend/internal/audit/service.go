// Package audit owns the durable administrative audit write boundary.
package audit

import (
	"encoding/json"
	"strconv"

	contractsorm "github.com/goravel/framework/contracts/database/orm"
	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/models"
)

// Event describes one auditable state transition. The writer accepts a query
// so callers can append the log in the same transaction as the mutation.
type Event struct {
	Action       string
	ResourceType string
	ResourceID   string
	Before       any
	After        any
}

// Write appends an audit event using request metadata and the authenticated
// actor. It is intentionally transaction-friendly: pass the transaction query
// returned by the caller instead of the global ORM query.
func Write(ctx contractshttp.Context, query contractsorm.Query, event Event) error {
	var userID *uint
	if id, err := facades.Auth(ctx).ID(); err == nil {
		if parsed, parseErr := strconv.ParseUint(id, 10, 64); parseErr == nil && parsed > 0 {
			value := uint(parsed)
			userID = &value
		}
	}

	return query.Create(&models.AuditLog{
		UserID:       userID,
		Action:       event.Action,
		ResourceType: event.ResourceType,
		ResourceID:   stringPointer(event.ResourceID),
		RequestID:    stringPointer(ctx.Request().Header("X-Request-ID")),
		IPAddress:    stringPointer(ctx.Request().Ip()),
		UserAgent:    stringPointer(ctx.Request().Header("User-Agent")),
		BeforeData:   snapshot(event.Before),
		AfterData:    snapshot(event.After),
	})
}

func snapshot(value any) *string {
	if value == nil {
		return nil
	}

	payload, err := json.Marshal(value)
	if err != nil {
		return nil
	}
	result := string(payload)
	return &result
}

func stringPointer(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
