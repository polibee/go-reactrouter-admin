package openapi

import (
	_ "embed"
)

// Spec is the generated Core OpenAPI document served by the backend.
//
//go:embed core.openapi.json
var spec []byte

func Spec() []byte {
	return spec
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
