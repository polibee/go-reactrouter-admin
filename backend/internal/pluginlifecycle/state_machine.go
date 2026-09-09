package pluginlifecycle

import (
	"fmt"

	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

var transitions = map[contracts.PluginState]map[contracts.PluginState]struct{}{
	contracts.PluginStateInstalled: {
		contracts.PluginStateEnabling:     {},
		contracts.PluginStateUninstalling: {},
		contracts.PluginStateVerifying:    {},
	},
	contracts.PluginStateVerifying: {
		contracts.PluginStateInstalled: {},
		contracts.PluginStateFailed:    {},
	},
	contracts.PluginStateEnabling: {
		contracts.PluginStateEnabled: {},
		contracts.PluginStateFailed:  {},
	},
	contracts.PluginStateEnabled: {
		contracts.PluginStateDisabling:    {},
		contracts.PluginStateUninstalling: {},
		contracts.PluginStateFailed:       {},
	},
	contracts.PluginStateDisabling: {
		contracts.PluginStateDisabled: {},
		contracts.PluginStateFailed:   {},
	},
	contracts.PluginStateDisabled: {
		contracts.PluginStateEnabling:     {},
		contracts.PluginStateUninstalling: {},
	},
	contracts.PluginStateFailed: {
		contracts.PluginStateEnabling:     {},
		contracts.PluginStateDisabling:    {},
		contracts.PluginStateUninstalling: {},
	},
	contracts.PluginStateUninstalling: {
		contracts.PluginStateUninstalled: {},
		contracts.PluginStateFailed:      {},
	},
}

func Transition(from, to contracts.PluginState) error {
	if next, ok := transitions[from]; ok {
		if _, allowed := next[to]; allowed {
			return nil
		}
	}
	return fmt.Errorf("invalid plugin state transition %q -> %q", from, to)
}
