package models

import (
	"encoding/json"
	"testing"
)

func TestCoreModelsUseStableTableNames(t *testing.T) {
	tests := []struct {
		name  string
		table string
		got   string
	}{
		{name: "users", table: "users", got: (User{}).TableName()},
		{name: "roles", table: "roles", got: (Role{}).TableName()},
		{name: "permissions", table: "permissions", got: (Permission{}).TableName()},
		{name: "menus", table: "menus", got: (Menu{}).TableName()},
		{name: "settings", table: "settings", got: (Setting{}).TableName()},
		{name: "audit logs", table: "audit_logs", got: (AuditLog{}).TableName()},
	}

	for _, tt := range tests {
		if tt.got != tt.table {
			t.Errorf("%s table name = %q, want %q", tt.name, tt.got, tt.table)
		}
	}
}

func TestUserDoesNotExposePasswordInJSON(t *testing.T) {
	payload, err := json.Marshal(User{Password: "hashed-secret"})
	if err != nil {
		t.Fatal(err)
	}

	if string(payload) == "" || containsJSONField(payload, "password") {
		t.Fatalf("password must not be serialized: %s", payload)
	}
}

func containsJSONField(payload []byte, field string) bool {
	var value map[string]any
	if err := json.Unmarshal(payload, &value); err != nil {
		return false
	}
	_, exists := value[field]
	return exists
}
