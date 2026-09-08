package config

import (
	"strings"

	"github.com/polibee/go-reactrouter/backend/app/facades"
)

func init() {
	config := facades.Config()
	originsValue := config.Env("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
	originsString, ok := originsValue.(string)
	if !ok {
		originsString = "http://localhost:5173,http://127.0.0.1:5173"
	}
	origins := strings.Split(originsString, ",")
	for index := range origins {
		origins[index] = strings.TrimSpace(origins[index])
	}

	config.Add("cors", map[string]any{
		// Cross-Origin Resource Sharing (CORS) Configuration
		//
		// Here you may configure your settings for cross-origin resource sharing
		// or "CORS". This determines what cross-origin operations may execute
		// in web browsers. You are free to adjust these settings as needed.
		//
		// To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
		"paths":                []string{"api/*"},
		"allowed_methods":      []string{"*"},
		"allowed_origins":      origins,
		"allowed_headers":      []string{"*"},
		"exposed_headers":      []string{},
		"max_age":              0,
		"supports_credentials": true,
	})
}
