package main

import (
	"context"
	"net/http"
	"os"

	"github.com/polibee/go-reactrouter/plugins/sdk-go/runtime"
)

func main() {
	config := runtime.ConfigFromEnv()
	server, err := runtime.NewServer(config)
	if err != nil {
		panic(err)
	}
	if err := server.Handle("/hello", http.HandlerFunc(func(writer http.ResponseWriter, _ *http.Request) {
		runtime.WriteJSON(writer, http.StatusOK, map[string]any{
			"data": map[string]string{"message": "hello from plugin"},
		})
	})); err != nil {
		panic(err)
	}
	if err := server.ListenAndServe(context.Background(), os.Getenv("PLUGIN_LISTEN_ADDR")); err != nil {
		panic(err)
	}
}
