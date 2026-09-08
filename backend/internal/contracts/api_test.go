package contracts

import (
	"encoding/json"
	"testing"
)

func TestSuccessResponseUsesSharedEnvelope(t *testing.T) {
	payload, err := json.Marshal(Success(map[string]string{"status": "ok"}))
	if err != nil {
		t.Fatal(err)
	}
	if string(payload) != `{"data":{"status":"ok"}}` {
		t.Fatalf("unexpected success response: %s", payload)
	}
}

func TestFailureResponseUsesSharedErrorEnvelope(t *testing.T) {
	payload, err := json.Marshal(Failure("not_found", "Plugin was not found"))
	if err != nil {
		t.Fatal(err)
	}
	if string(payload) != `{"error":{"code":"not_found","message":"Plugin was not found"}}` {
		t.Fatalf("unexpected error response: %s", payload)
	}
}
