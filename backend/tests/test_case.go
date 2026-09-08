package tests

import (
	"github.com/goravel/framework/testing"

	"github.com/polibee/go-reactrouter/backend/bootstrap"
)

func init() {
	bootstrap.Boot()
}

type TestCase struct {
	testing.TestCase
}
