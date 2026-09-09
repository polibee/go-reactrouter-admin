package openapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
)

var ErrPluginOpenAPINotFound = errors.New("plugin OpenAPI document not found")

type registeredPluginDocument struct {
	enabled bool
	data    []byte
}

// PluginDocumentRegistry keeps plugin contracts separate from plugin source
// files. The lifecycle service registers a document only after validation and
// changes enabled state as part of its durable plugin transition.
type PluginDocumentRegistry struct {
	mu        sync.RWMutex
	documents map[string]registeredPluginDocument
}

func NewPluginDocumentRegistry() *PluginDocumentRegistry {
	return &PluginDocumentRegistry{documents: make(map[string]registeredPluginDocument)}
}

func (registry *PluginDocumentRegistry) Register(pluginID string, enabled bool, document []byte) error {
	if strings.TrimSpace(pluginID) == "" {
		return errors.New("plugin id is required")
	}
	if err := validateOpenAPIDocument(document); err != nil {
		return err
	}
	registry.mu.Lock()
	defer registry.mu.Unlock()
	registry.documents[pluginID] = registeredPluginDocument{enabled: enabled, data: append([]byte(nil), document...)}
	return nil
}

func (registry *PluginDocumentRegistry) SetEnabled(pluginID string, enabled bool) error {
	registry.mu.Lock()
	defer registry.mu.Unlock()
	document, ok := registry.documents[pluginID]
	if !ok {
		return fmt.Errorf("%w: %s", ErrPluginOpenAPINotFound, pluginID)
	}
	document.enabled = enabled
	registry.documents[pluginID] = document
	return nil
}

func (registry *PluginDocumentRegistry) Document(pluginID string) ([]byte, bool) {
	registry.mu.RLock()
	defer registry.mu.RUnlock()
	document, ok := registry.documents[pluginID]
	if !ok || !document.enabled {
		return nil, false
	}
	return append([]byte(nil), document.data...), true
}

func (registry *PluginDocumentRegistry) Aggregate(core []byte) ([]byte, error) {
	var aggregate map[string]any
	if err := json.Unmarshal(core, &aggregate); err != nil {
		return nil, fmt.Errorf("decode core OpenAPI document: %w", err)
	}
	if _, ok := aggregate["paths"].(map[string]any); !ok {
		return nil, errors.New("core OpenAPI document must contain paths")
	}

	registry.mu.RLock()
	plugins := make(map[string]registeredPluginDocument, len(registry.documents))
	for pluginID, document := range registry.documents {
		if document.enabled {
			plugins[pluginID] = registeredPluginDocument{enabled: true, data: append([]byte(nil), document.data...)}
		}
	}
	registry.mu.RUnlock()

	for pluginID, document := range plugins {
		var plugin map[string]any
		if err := json.Unmarshal(document.data, &plugin); err != nil {
			return nil, fmt.Errorf("decode plugin %s OpenAPI document: %w", pluginID, err)
		}
		if err := mergePluginDocument(aggregate, pluginID, plugin); err != nil {
			return nil, err
		}
	}
	return json.MarshalIndent(aggregate, "", "  ")
}

func mergePluginDocument(aggregate map[string]any, pluginID string, plugin map[string]any) error {
	aggregatedPaths, ok := aggregate["paths"].(map[string]any)
	if !ok {
		return errors.New("core OpenAPI paths must be an object")
	}
	pluginPaths, ok := plugin["paths"].(map[string]any)
	if !ok {
		return fmt.Errorf("plugin %s OpenAPI paths must be an object", pluginID)
	}
	serverPrefix := ""
	if servers, ok := plugin["servers"].([]any); ok && len(servers) > 0 {
		if server, ok := servers[0].(map[string]any); ok {
			serverPrefix, _ = server["url"].(string)
		}
	}
	for route, value := range pluginPaths {
		fullPath := strings.TrimRight(serverPrefix, "/") + "/" + strings.TrimLeft(route, "/")
		if serverPrefix == "" {
			fullPath = route
		}
		if _, exists := aggregatedPaths[fullPath]; exists {
			return fmt.Errorf("OpenAPI path collision: %s", fullPath)
		}
		aggregatedPaths[fullPath] = namespaceComponentRefs(value, pluginID)
	}

	pluginComponents, _ := plugin["components"].(map[string]any)
	aggregatedComponents, _ := aggregate["components"].(map[string]any)
	if aggregatedComponents == nil {
		aggregatedComponents = make(map[string]any)
		aggregate["components"] = aggregatedComponents
	}
	for section, rawValues := range pluginComponents {
		values, ok := rawValues.(map[string]any)
		if !ok {
			continue
		}
		target, _ := aggregatedComponents[section].(map[string]any)
		if target == nil {
			target = make(map[string]any)
			aggregatedComponents[section] = target
		}
		for name, value := range values {
			namespaced := componentName(pluginID, name)
			if _, exists := target[namespaced]; exists {
				return fmt.Errorf("OpenAPI component collision: %s/%s", section, namespaced)
			}
			target[namespaced] = namespaceComponentRefs(value, pluginID)
		}
	}

	if permissions, ok := plugin["x-permissions"].(map[string]any); ok {
		current, _ := aggregate["x-permissions"].(map[string]any)
		if current == nil {
			current = make(map[string]any)
			aggregate["x-permissions"] = current
		}
		for operation, permission := range permissions {
			key := pluginID + "." + operation
			if _, exists := current[key]; exists {
				return fmt.Errorf("OpenAPI permission collision: %s", key)
			}
			current[key] = permission
		}
	}
	return nil
}

func namespaceComponentRefs(value any, pluginID string) any {
	switch current := value.(type) {
	case map[string]any:
		result := make(map[string]any, len(current))
		for key, item := range current {
			if key == "security" {
				result[key] = namespaceSecurityRequirements(item, pluginID)
				continue
			}
			if key == "$ref" {
				if reference, ok := item.(string); ok && strings.HasPrefix(reference, "#/components/") {
					parts := strings.SplitN(strings.TrimPrefix(reference, "#/components/"), "/", 2)
					if len(parts) == 2 {
						item = "#/components/" + parts[0] + "/" + componentName(pluginID, parts[1])
					}
				}
			}
			result[key] = namespaceComponentRefs(item, pluginID)
		}
		return result
	case []any:
		result := make([]any, len(current))
		for index, item := range current {
			result[index] = namespaceComponentRefs(item, pluginID)
		}
		return result
	default:
		return value
	}
}

func namespaceSecurityRequirements(value any, pluginID string) any {
	requirements, ok := value.([]any)
	if !ok {
		return value
	}
	result := make([]any, len(requirements))
	for index, rawRequirement := range requirements {
		requirement, ok := rawRequirement.(map[string]any)
		if !ok {
			result[index] = rawRequirement
			continue
		}
		namespaced := make(map[string]any, len(requirement))
		for scheme, scopes := range requirement {
			namespaced[componentName(pluginID, scheme)] = scopes
		}
		result[index] = namespaced
	}
	return result
}

func componentName(pluginID, name string) string {
	return strings.NewReplacer(".", "_", "-", "_").Replace(pluginID) + "__" + name
}

func validateOpenAPIDocument(document []byte) error {
	var parsed struct {
		OpenAPI string         `json:"openapi"`
		Info    map[string]any `json:"info"`
		Paths   map[string]any `json:"paths"`
	}
	if err := json.Unmarshal(document, &parsed); err != nil {
		return fmt.Errorf("invalid plugin OpenAPI JSON: %w", err)
	}
	if parsed.OpenAPI == "" || len(parsed.Info) == 0 || parsed.Paths == nil {
		return errors.New("plugin OpenAPI requires openapi, info, and paths")
	}
	return nil
}
