// Package modules owns compile-time application modules.
//
// A module is part of the main binary and may register its routes, services,
// migrations, or policies during application boot. It is deliberately
// separate from the runtime plugin manager: modules are not installed or
// removed by end users while the process is running.
package modules

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrInvalidModuleID = errors.New("invalid module id")
	ErrDuplicateModule = errors.New("duplicate module")
)

// Module is the minimal lifecycle contract for a main application module.
type Module interface {
	ID() string
	Register(context.Context) error
}

// Registry preserves registration order so module startup is deterministic.
type Registry struct {
	modules []Module
	byID    map[string]Module
	booted  bool
}

func NewRegistry() *Registry {
	return &Registry{byID: make(map[string]Module)}
}

func (r *Registry) Register(module Module) error {
	if module == nil {
		return ErrInvalidModuleID
	}
	id := strings.TrimSpace(module.ID())
	if id == "" || id != module.ID() {
		return ErrInvalidModuleID
	}
	if _, exists := r.byID[id]; exists {
		return fmt.Errorf("%w: %s", ErrDuplicateModule, id)
	}
	r.byID[id] = module
	r.modules = append(r.modules, module)
	return nil
}

func (r *Registry) All() []Module {
	return append([]Module(nil), r.modules...)
}

func (r *Registry) Boot(ctx context.Context) error {
	if r.booted {
		return nil
	}
	for _, module := range r.modules {
		if err := module.Register(ctx); err != nil {
			return fmt.Errorf("boot module %q: %w", module.ID(), err)
		}
	}
	r.booted = true
	return nil
}
