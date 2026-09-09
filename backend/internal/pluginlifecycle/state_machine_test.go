package pluginlifecycle_test

import (
	"testing"

	"github.com/polibee/go-reactrouter/backend/internal/contracts"
	"github.com/polibee/go-reactrouter/backend/internal/pluginlifecycle"
)

func TestTransitionAllowsInstallEnableDisableUpgradeAndUninstallStates(t *testing.T) {
	tests := []struct {
		from contracts.PluginState
		to   contracts.PluginState
	}{
		{contracts.PluginStateInstalled, contracts.PluginStateEnabling},
		{contracts.PluginStateEnabling, contracts.PluginStateEnabled},
		{contracts.PluginStateEnabled, contracts.PluginStateDisabling},
		{contracts.PluginStateDisabling, contracts.PluginStateDisabled},
		{contracts.PluginStateDisabled, contracts.PluginStateEnabling},
		{contracts.PluginStateInstalled, contracts.PluginStateUninstalling},
		{contracts.PluginStateDisabled, contracts.PluginStateUninstalling},
		{contracts.PluginStateFailed, contracts.PluginStateEnabling},
		{contracts.PluginStateUninstalling, contracts.PluginStateUninstalled},
	}

	for _, test := range tests {
		if err := pluginlifecycle.Transition(test.from, test.to); err != nil {
			t.Errorf("Transition(%q, %q) returned error: %v", test.from, test.to, err)
		}
	}
}

func TestTransitionRejectsSkippingLifecycleGuards(t *testing.T) {
	tests := [][2]contracts.PluginState{
		{contracts.PluginStateInstalled, contracts.PluginStateEnabled},
		{contracts.PluginStateEnabled, contracts.PluginStateDisabled},
		{contracts.PluginStateUninstalled, contracts.PluginStateEnabled},
		{contracts.PluginStateUninstalling, contracts.PluginStateEnabled},
	}

	for _, test := range tests {
		if err := pluginlifecycle.Transition(test[0], test[1]); err == nil {
			t.Errorf("Transition(%q, %q) unexpectedly succeeded", test[0], test[1])
		}
	}
}
