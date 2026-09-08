package modules

import "context"

// ApplicationModules is the single compile-time registration point for
// product-owned modules. Add a module here when its feature is ready; do not
// use this list for runtime-installable plugins.
func ApplicationModules() []Module {
	return nil
}

func BootApplicationModules(ctx context.Context) error {
	registry := NewRegistry()
	for _, module := range ApplicationModules() {
		if err := registry.Register(module); err != nil {
			return err
		}
	}
	return registry.Boot(ctx)
}
