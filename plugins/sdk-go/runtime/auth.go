package runtime

import (
	"crypto/subtle"
	"net/http"
)

func RequireProcessToken(expected string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		provided := request.Header.Get("X-Plugin-Process-Token")
		if expected == "" || subtle.ConstantTimeCompare([]byte(expected), []byte(provided)) != 1 {
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusUnauthorized)
			_, _ = writer.Write([]byte(`{"error":{"code":"plugin.unauthorized","message":"plugin process token is invalid"}}`))
			return
		}
		next.ServeHTTP(writer, request)
	})
}
