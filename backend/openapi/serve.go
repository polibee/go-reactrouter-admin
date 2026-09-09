package openapi

import (
	_ "embed"
	"fmt"
)

// Spec is the generated Core OpenAPI document served by the backend.
//
//go:embed core.openapi.json
var spec []byte

var pluginDocuments = NewPluginDocumentRegistry()

func Spec() []byte {
	return spec
}

func RegisterPluginDocument(pluginID string, enabled bool, document []byte) error {
	return pluginDocuments.Register(pluginID, enabled, document)
}

func SetPluginDocumentEnabled(pluginID string, enabled bool) error {
	return pluginDocuments.SetEnabled(pluginID, enabled)
}

func PluginSpec(pluginID string) ([]byte, bool) {
	return pluginDocuments.Document(pluginID)
}

func AggregatedSpec() ([]byte, error) {
	document, err := pluginDocuments.Aggregate(spec)
	if err != nil {
		return nil, fmt.Errorf("aggregate OpenAPI documents: %w", err)
	}
	return document, nil
}

func DocsHTML() string {
	return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>GoReactRouter API Docs</title></head>
<body>
<script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
<elements-api apiDescriptionUrl="/openapi.json" layout="responsive"></elements-api>
</body>
</html>`
}
