package pluginhost

import "testing"

func TestProcessStateTransitionsRejectRoutingBeforeRunning(t *testing.T) {
	state := NewProcessState()

	if state.Routable() {
		t.Fatal("a new process must not be routable")
	}
	if err := state.Transition(ProcessStateRunning); err != nil {
		t.Fatalf("start transition: %v", err)
	}
	if !state.Routable() {
		t.Fatal("a running process must be routable")
	}
	if err := state.Transition(ProcessStateStopping); err != nil {
		t.Fatalf("stop transition: %v", err)
	}
	if state.Routable() {
		t.Fatal("a stopping process must not be routable")
	}
}

func TestProcessStateRejectsRestartAfterStopped(t *testing.T) {
	state := NewProcessState()
	if err := state.Transition(ProcessStateRunning); err != nil {
		t.Fatalf("start transition: %v", err)
	}
	if err := state.Transition(ProcessStateStopped); err != nil {
		t.Fatalf("stop transition: %v", err)
	}
	if err := state.Transition(ProcessStateRunning); err == nil {
		t.Fatal("a stopped process must not be restarted through its old state")
	}
}
