package gateway

import (
	"errors"
	"fmt"
)

var ErrPluginNotEnabled = errors.New("plugin is not enabled")

func AuthorizePluginState(state string) error {
	if state != "enabled" {
		return fmt.Errorf("%w: state=%s", ErrPluginNotEnabled, state)
	}
	return nil
}
