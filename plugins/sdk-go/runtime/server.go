package runtime

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type Config struct {
	ID           string
	APIPrefix    string
	ProcessToken string
	CoreURL      string
	Metadata     map[string]any
}

func ConfigFromEnv() Config {
	return Config{
		ID:           os.Getenv("PLUGIN_ID"),
		APIPrefix:    os.Getenv("PLUGIN_API_PREFIX"),
		ProcessToken: os.Getenv("PLUGIN_PROCESS_TOKEN"),
		CoreURL:      os.Getenv("PLUGIN_CORE_URL"),
	}
}

type Server struct {
	config Config
	mux    *http.ServeMux
	http   *http.Server
}

func NewServer(config Config) (*Server, error) {
	if strings.TrimSpace(config.ID) == "" {
		return nil, errors.New("plugin id is required")
	}
	if !strings.HasPrefix(config.APIPrefix, "/api/") {
		return nil, errors.New("plugin api prefix must start with /api/")
	}
	if config.ProcessToken == "" {
		return nil, errors.New("plugin process token is required")
	}

	server := &Server{config: config, mux: http.NewServeMux()}
	server.mux.Handle("/health", RequireProcessToken(config.ProcessToken, http.HandlerFunc(healthHandler)))
	server.mux.Handle("/metadata", RequireProcessToken(config.ProcessToken, http.HandlerFunc(server.metadata)))
	server.mux.Handle("/shutdown", RequireProcessToken(config.ProcessToken, http.HandlerFunc(server.shutdown)))
	return server, nil
}

func (server *Server) Handle(relativePath string, handler http.Handler) error {
	if handler == nil {
		return errors.New("plugin handler is required")
	}
	if !strings.HasPrefix(relativePath, "/") || strings.Contains(relativePath, "..") {
		return errors.New("plugin handler path must be relative to the api prefix")
	}
	server.mux.Handle(server.config.APIPrefix+relativePath, RequireProcessToken(server.config.ProcessToken, handler))
	return nil
}

func (server *Server) Handler() http.Handler { return server.mux }

func (server *Server) ListenAndServe(ctx context.Context, address string) error {
	if strings.TrimSpace(address) == "" {
		return errors.New("plugin listen address is required")
	}
	server.http = &http.Server{Addr: address, Handler: server.mux}
	go func() {
		<-ctx.Done()
		_ = server.Shutdown(context.Background())
	}()
	if err := server.http.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("plugin server: %w", err)
	}
	return nil
}

func (server *Server) Shutdown(ctx context.Context) error {
	if server.http == nil {
		return nil
	}
	return server.http.Shutdown(ctx)
}

func (server *Server) metadata(writer http.ResponseWriter, _ *http.Request) {
	metadata := map[string]any{
		"id":        server.config.ID,
		"apiPrefix": server.config.APIPrefix,
		"coreUrl":   server.config.CoreURL,
	}
	for key, value := range server.config.Metadata {
		metadata[key] = value
	}
	WriteJSON(writer, http.StatusOK, map[string]any{"data": metadata})
}

func (server *Server) shutdown(writer http.ResponseWriter, request *http.Request) {
	WriteJSON(writer, http.StatusAccepted, map[string]any{"data": map[string]string{"status": "stopping"}})
	go func() { _ = server.Shutdown(context.Background()) }()
}
