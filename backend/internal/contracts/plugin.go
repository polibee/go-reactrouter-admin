package contracts

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

const CurrentPluginAPIVersion = "1"

var (
	ErrInvalidManifest       = errors.New("invalid plugin manifest")
	ErrUnsupportedAPIVersion = errors.New("unsupported plugin api version")
)

type PluginState string

const (
	PluginStateDiscovered   PluginState = "discovered"
	PluginStateVerifying    PluginState = "verifying"
	PluginStateInstalled    PluginState = "installed"
	PluginStateEnabling     PluginState = "enabling"
	PluginStateEnabled      PluginState = "enabled"
	PluginStateDisabling    PluginState = "disabling"
	PluginStateDisabled     PluginState = "disabled"
	PluginStateUninstalling PluginState = "uninstalling"
	PluginStateFailed       PluginState = "failed"
	PluginStateUninstalled  PluginState = "uninstalled"
)

func (state PluginState) IsValid() bool {
	switch state {
	case PluginStateDiscovered, PluginStateVerifying, PluginStateInstalled,
		PluginStateEnabling, PluginStateEnabled, PluginStateDisabling,
		PluginStateDisabled, PluginStateUninstalling, PluginStateFailed,
		PluginStateUninstalled:
		return true
	default:
		return false
	}
}

type PluginDependency struct {
	ID      string `json:"id"`
	Version string `json:"version"`
}

type BackendManifest struct {
	Entrypoint string `json:"entrypoint"`
	HealthPath string `json:"healthPath"`
	APIPrefix  string `json:"apiPrefix"`
}

type FrontendManifest struct {
	Entrypoint string `json:"entrypoint"`
}

type PluginManifest struct {
	ID           string             `json:"id"`
	Name         string             `json:"name"`
	DisplayName  string             `json:"displayName"`
	Version      string             `json:"version"`
	APIVersion   string             `json:"apiVersion"`
	CoreRequires string             `json:"coreRequires"`
	Dependencies []PluginDependency `json:"dependencies,omitempty"`
	Backend      BackendManifest    `json:"backend"`
	Frontend     FrontendManifest   `json:"frontend"`
	Permissions  string             `json:"permissions"`
	Menus        string             `json:"menus"`
	OpenAPI      string             `json:"openapi"`
	Signature    string             `json:"signature,omitempty"`
}

var (
	pluginIDPattern      = regexp.MustCompile(`^[a-z0-9]+([.-][a-z0-9]+)*$`)
	pluginNamePattern    = regexp.MustCompile(`^[a-z][a-z0-9-]*$`)
	semanticVersionRegex = regexp.MustCompile(`^\d+\.\d+\.\d+([-.][0-9A-Za-z.-]+)?$`)
)

func ValidateManifest(manifest PluginManifest) error {
	switch {
	case !pluginIDPattern.MatchString(manifest.ID):
		return fmt.Errorf("%w: id must match %s", ErrInvalidManifest, pluginIDPattern.String())
	case !pluginNamePattern.MatchString(manifest.Name):
		return fmt.Errorf("%w: name must match %s", ErrInvalidManifest, pluginNamePattern.String())
	case strings.TrimSpace(manifest.DisplayName) == "":
		return fmt.Errorf("%w: display name is required", ErrInvalidManifest)
	case !semanticVersionRegex.MatchString(manifest.Version):
		return fmt.Errorf("%w: version must be semantic", ErrInvalidManifest)
	case manifest.APIVersion != CurrentPluginAPIVersion:
		return fmt.Errorf("%w: %s", ErrUnsupportedAPIVersion, manifest.APIVersion)
	case strings.TrimSpace(manifest.CoreRequires) == "":
		return fmt.Errorf("%w: core requirements are required", ErrInvalidManifest)
	case strings.TrimSpace(manifest.Backend.Entrypoint) == "":
		return fmt.Errorf("%w: backend entrypoint is required", ErrInvalidManifest)
	case !strings.HasPrefix(manifest.Backend.HealthPath, "/"):
		return fmt.Errorf("%w: backend health path must start with /", ErrInvalidManifest)
	case !strings.HasPrefix(manifest.Backend.APIPrefix, "/api/"):
		return fmt.Errorf("%w: backend api prefix must start with /api/", ErrInvalidManifest)
	case strings.TrimSpace(manifest.Frontend.EntryPoint()) == "":
		return fmt.Errorf("%w: frontend entrypoint is required", ErrInvalidManifest)
	case strings.TrimSpace(manifest.Permissions) == "":
		return fmt.Errorf("%w: permissions file is required", ErrInvalidManifest)
	case strings.TrimSpace(manifest.Menus) == "":
		return fmt.Errorf("%w: menus file is required", ErrInvalidManifest)
	case strings.TrimSpace(manifest.OpenAPI) == "":
		return fmt.Errorf("%w: openapi file is required", ErrInvalidManifest)
	}

	for _, dependency := range manifest.Dependencies {
		if !pluginIDPattern.MatchString(dependency.ID) || strings.TrimSpace(dependency.Version) == "" {
			return fmt.Errorf("%w: invalid dependency %q", ErrInvalidManifest, dependency.ID)
		}
	}

	return nil
}

func (manifest FrontendManifest) EntryPoint() string {
	return manifest.Entrypoint
}
