package openapi

import (
	"encoding/json"
	"testing"
)

func TestPluginOpenAPIDocumentsAreAggregatedOnlyWhileEnabled(t *testing.T) {
	registry := NewPluginDocumentRegistry()
	pluginDocument := []byte(`{
        "openapi":"3.1.0",
        "info":{"title":"Example","version":"1.0.0"},
        "servers":[{"url":"/api/v1/plugins/example.plugin"}],
        "paths":{"/hello":{"get":{"operationId":"getHello","security":[{"cookieAuth":[]}]}}},
        "components":{"securitySchemes":{"cookieAuth":{"type":"apiKey","in":"cookie","name":"access"}}}
    }`)
	if err := registry.Register("example.plugin", true, pluginDocument); err != nil {
		t.Fatalf("register plugin document: %v", err)
	}

	aggregated, err := registry.Aggregate(Spec())
	if err != nil {
		t.Fatalf("aggregate enabled document: %v", err)
	}
	var document struct {
		Paths map[string]json.RawMessage `json:"paths"`
	}
	if err := json.Unmarshal(aggregated, &document); err != nil {
		t.Fatalf("decode aggregate: %v", err)
	}
	if _, ok := document.Paths["/api/v1/plugins/example.plugin/hello"]; !ok {
		t.Fatal("enabled plugin path is missing from aggregate")
	}
	var pathDocument map[string]any
	if err := json.Unmarshal(document.Paths["/api/v1/plugins/example.plugin/hello"], &pathDocument); err != nil {
		t.Fatalf("decode aggregated plugin path: %v", err)
	}
	getOperation := pathDocument["get"].(map[string]any)
	security := getOperation["security"].([]any)[0].(map[string]any)
	if _, ok := security["example_plugin__cookieAuth"]; !ok {
		t.Fatal("plugin security requirement must reference namespaced scheme")
	}

	if err := registry.SetEnabled("example.plugin", false); err != nil {
		t.Fatalf("disable plugin document: %v", err)
	}
	aggregated, err = registry.Aggregate(Spec())
	if err != nil {
		t.Fatalf("aggregate disabled document: %v", err)
	}
	document = struct {
		Paths map[string]json.RawMessage `json:"paths"`
	}{}
	if err := json.Unmarshal(aggregated, &document); err != nil {
		t.Fatalf("decode disabled aggregate: %v", err)
	}
	if _, ok := document.Paths["/api/v1/plugins/example.plugin/hello"]; ok {
		t.Fatal("disabled plugin path must not be exposed")
	}
}

func TestPluginDocumentRegistryRejectsInvalidOpenAPIJSON(t *testing.T) {
	registry := NewPluginDocumentRegistry()
	if err := registry.Register("example.plugin", true, []byte("not-json")); err == nil {
		t.Fatal("invalid plugin OpenAPI must be rejected")
	}
}
