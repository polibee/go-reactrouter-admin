package main

import (
	"github.com/polibee/go-reactrouter/backend/bootstrap"
)

func main() {
	app := bootstrap.Boot()

	app.Start()
}
