package pluginhost

import (
	"errors"
	"fmt"
	"sync"
)

type ProcessState string

const (
	ProcessStateStarting ProcessState = "starting"
	ProcessStateRunning  ProcessState = "running"
	ProcessStateStopping ProcessState = "stopping"
	ProcessStateStopped  ProcessState = "stopped"
	ProcessStateFailed   ProcessState = "failed"
)

var ErrInvalidProcessTransition = errors.New("invalid plugin process state transition")

type ProcessStateTracker struct {
	mu    sync.RWMutex
	state ProcessState
}

func NewProcessState() *ProcessStateTracker {
	return &ProcessStateTracker{state: ProcessStateStarting}
}

func (state *ProcessStateTracker) State() ProcessState {
	state.mu.RLock()
	defer state.mu.RUnlock()
	return state.state
}

func (state *ProcessStateTracker) Routable() bool {
	return state.State() == ProcessStateRunning
}

func (state *ProcessStateTracker) Transition(next ProcessState) error {
	state.mu.Lock()
	defer state.mu.Unlock()
	if !validProcessTransition(state.state, next) {
		return fmt.Errorf("%w: %s -> %s", ErrInvalidProcessTransition, state.state, next)
	}
	state.state = next
	return nil
}

func validProcessTransition(current, next ProcessState) bool {
	switch current {
	case ProcessStateStarting:
		return next == ProcessStateRunning || next == ProcessStateFailed || next == ProcessStateStopped
	case ProcessStateRunning:
		return next == ProcessStateStopping || next == ProcessStateFailed || next == ProcessStateStopped
	case ProcessStateStopping:
		return next == ProcessStateStopped || next == ProcessStateFailed
	default:
		return false
	}
}
