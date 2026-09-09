package gateway

import "testing"

func TestAuthorizeRejectsNonEnabledPlugin(t *testing.T) {
	if err := AuthorizePluginState("disabled"); err == nil {
		t.Fatal("disabled plugin must not be routable")
	}
	if err := AuthorizePluginState("failed"); err == nil {
		t.Fatal("failed plugin must not be routable")
	}
	if err := AuthorizePluginState("enabled"); err != nil {
		t.Fatalf("enabled plugin rejected: %v", err)
	}
}
