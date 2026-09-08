package contracts

import "testing"

func TestValidateManifestAcceptsValidRuntimePlugin(t *testing.T) {
	manifest := PluginManifest{
		ID:           "acme.inventory",
		Name:         "inventory",
		DisplayName:  "Inventory",
		Version:      "1.0.0",
		APIVersion:   "1",
		CoreRequires: ">=1.0.0 <2.0.0",
		Backend: BackendManifest{
			Entrypoint: "backend/inventory-plugin",
			HealthPath: "/health",
			APIPrefix:  "/api/v1/plugins/acme.inventory",
		},
		Frontend:    FrontendManifest{Entrypoint: "frontend/entry.js"},
		Permissions: "permissions.json",
		Menus:       "menus.json",
		OpenAPI:     "openapi.json",
	}

	if err := ValidateManifest(manifest); err != nil {
		t.Fatalf("expected valid manifest, got %v", err)
	}
}

func TestValidateManifestRejectsInvalidID(t *testing.T) {
	manifest := validManifest()
	manifest.ID = "Acme Inventory"

	if err := ValidateManifest(manifest); err == nil {
		t.Fatal("expected invalid id to be rejected")
	}
}

func TestValidateManifestRejectsInvalidVersion(t *testing.T) {
	manifest := validManifest()
	manifest.Version = "release-1"

	if err := ValidateManifest(manifest); err == nil {
		t.Fatal("expected invalid semantic version to be rejected")
	}
}

func TestValidateManifestRejectsMissingEntrypoint(t *testing.T) {
	manifest := validManifest()
	manifest.Backend.Entrypoint = ""

	if err := ValidateManifest(manifest); err == nil {
		t.Fatal("expected missing backend entrypoint to be rejected")
	}
}

func TestValidateManifestRejectsUnsupportedAPIVersion(t *testing.T) {
	manifest := validManifest()
	manifest.APIVersion = "2"

	if err := ValidateManifest(manifest); err == nil {
		t.Fatal("expected unsupported api version to be rejected")
	}
}

func TestPluginStateRejectsUnknownValues(t *testing.T) {
	if !PluginStateEnabled.IsValid() {
		t.Fatal("expected enabled state to be valid")
	}
	if PluginState("unknown").IsValid() {
		t.Fatal("expected unknown state to be invalid")
	}
}

func validManifest() PluginManifest {
	return PluginManifest{
		ID:           "acme.inventory",
		Name:         "inventory",
		DisplayName:  "Inventory",
		Version:      "1.0.0",
		APIVersion:   "1",
		CoreRequires: ">=1.0.0 <2.0.0",
		Backend: BackendManifest{
			Entrypoint: "backend/inventory-plugin",
			HealthPath: "/health",
			APIPrefix:  "/api/v1/plugins/acme.inventory",
		},
		Frontend:    FrontendManifest{Entrypoint: "frontend/entry.js"},
		Permissions: "permissions.json",
		Menus:       "menus.json",
		OpenAPI:     "openapi.json",
	}
}
