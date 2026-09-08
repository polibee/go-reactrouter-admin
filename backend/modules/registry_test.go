package modules

import (
	"context"
	"errors"
	"reflect"
	"testing"
)

type testModule struct {
	id    string
	calls *[]string
	err   error
}

func (m testModule) ID() string { return m.id }

func (m testModule) Register(context.Context) error {
	*m.calls = append(*m.calls, m.id)
	return m.err
}

func TestRegistryBootsModulesInRegistrationOrder(t *testing.T) {
	calls := make([]string, 0, 2)
	registry := NewRegistry()
	if err := registry.Register(testModule{id: "first", calls: &calls}); err != nil {
		t.Fatal(err)
	}
	if err := registry.Register(testModule{id: "second", calls: &calls}); err != nil {
		t.Fatal(err)
	}

	if err := registry.Boot(context.Background()); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(calls, []string{"first", "second"}) {
		t.Fatalf("unexpected boot order: %v", calls)
	}
}

func TestRegistryRejectsInvalidAndDuplicateIDs(t *testing.T) {
	registry := NewRegistry()
	module := testModule{id: "billing", calls: new([]string)}

	if err := registry.Register(module); err != nil {
		t.Fatal(err)
	}
	if err := registry.Register(module); !errors.Is(err, ErrDuplicateModule) {
		t.Fatalf("expected duplicate error, got %v", err)
	}
	if err := registry.Register(testModule{id: " ", calls: new([]string)}); !errors.Is(err, ErrInvalidModuleID) {
		t.Fatalf("expected invalid id error, got %v", err)
	}
}

func TestRegistryDoesNotMarkFailedBootAsComplete(t *testing.T) {
	calls := make([]string, 0, 2)
	registry := NewRegistry()
	if err := registry.Register(testModule{id: "failing", calls: &calls, err: errors.New("boom")}); err != nil {
		t.Fatal(err)
	}

	if err := registry.Boot(context.Background()); err == nil {
		t.Fatal("expected boot error")
	}
	if err := registry.Boot(context.Background()); err == nil {
		t.Fatal("expected retry to invoke the failed module")
	}
	if len(calls) != 2 {
		t.Fatalf("expected two boot attempts, got %d", len(calls))
	}
}
