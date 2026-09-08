package audit

import "testing"

func TestSnapshotOmitsEmptyValuesAndSerializesModels(t *testing.T) {
	if got := snapshot(nil); got != nil {
		t.Fatalf("nil snapshot = %q, want nil", *got)
	}

	value := map[string]any{"name": "Admin", "active": true}
	got := snapshot(value)
	if got == nil || *got != `{"active":true,"name":"Admin"}` {
		t.Fatalf("snapshot = %v, want stable JSON", got)
	}
}
