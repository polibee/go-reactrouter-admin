package controllers

import (
	"encoding/json"
	"testing"

	"github.com/polibee/go-reactrouter/backend/app/models"
)

func TestPluginListItemExposesValidatedStateWithoutPackageSecrets(t *testing.T) {
	version := "1.2.3"
	lastError := ""
	item := pluginListItem(models.Plugin{
		PluginID:       "acme.billing",
		Name:           "billing",
		DisplayName:    "Billing",
		State:          "installed",
		CurrentVersion: &version,
		LastError:      &lastError,
		HealthStatus:   "unknown",
		Versions: []models.PluginVersion{{
			Version:      version,
			Dependencies: `[{"id":"acme.identity","version":">=1.0.0"}]`,
		}},
	})

	if item.PluginID != "acme.billing" || item.State != "installed" || item.CurrentVersion != "1.2.3" {
		t.Fatalf("plugin list item = %#v", item)
	}
	if len(item.Dependencies) != 1 || item.Dependencies[0].ID != "acme.identity" {
		t.Fatalf("dependencies = %#v", item.Dependencies)
	}
	payload, err := json.Marshal(item)
	if err != nil {
		t.Fatal(err)
	}
	var fields map[string]any
	if err := json.Unmarshal(payload, &fields); err != nil {
		t.Fatal(err)
	}
	if string(payload) == "" || fields["package_hash"] != nil || fields["install_root"] != nil {
		t.Fatalf("plugin list item leaked package details: %s", payload)
	}
}
