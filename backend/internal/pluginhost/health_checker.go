package pluginhost

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"
)

type HealthCheckerConfig struct {
	Client         *http.Client
	RequestTimeout time.Duration
	RetryInterval  time.Duration
}

type HealthChecker struct {
	client         *http.Client
	requestTimeout time.Duration
	retryInterval  time.Duration
}

func NewHealthChecker(config HealthCheckerConfig) *HealthChecker {
	if config.RequestTimeout <= 0 {
		config.RequestTimeout = 2 * time.Second
	}
	if config.RetryInterval <= 0 {
		config.RetryInterval = 50 * time.Millisecond
	}
	if config.Client == nil {
		config.Client = &http.Client{}
	}
	return &HealthChecker{client: config.Client, requestTimeout: config.RequestTimeout, retryInterval: config.RetryInterval}
}

func (checker *HealthChecker) Check(ctx context.Context, address, healthPath, token string) error {
	baseURL, err := localPluginURL(address)
	if err != nil {
		return err
	}
	if !strings.HasPrefix(healthPath, "/") {
		return errors.New("plugin health path must start with /")
	}
	requestContext, cancel := context.WithTimeout(ctx, checker.requestTimeout)
	defer cancel()
	request, err := http.NewRequestWithContext(requestContext, http.MethodGet, baseURL+healthPath, nil)
	if err != nil {
		return err
	}
	request.Header.Set("X-Plugin-Process-Token", token)
	response, err := checker.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 4096))
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("plugin health returned status %d", response.StatusCode)
	}
	return nil
}

func (checker *HealthChecker) Wait(ctx context.Context, address, healthPath, token string) error {
	var lastErr error
	for {
		if err := checker.Check(ctx, address, healthPath, token); err == nil {
			return nil
		} else {
			lastErr = err
		}
		timer := time.NewTimer(checker.retryInterval)
		select {
		case <-ctx.Done():
			if lastErr != nil {
				return fmt.Errorf("plugin health wait: %w: last error: %v", ctx.Err(), lastErr)
			}
			return ctx.Err()
		case <-timer.C:
		}
	}
}

func isLoopbackAddress(address string) bool {
	host, _, err := net.SplitHostPort(strings.TrimPrefix(strings.TrimPrefix(address, "http://"), "https://"))
	return err == nil && net.ParseIP(host) != nil && net.ParseIP(host).IsLoopback()
}
