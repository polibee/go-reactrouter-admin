package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	contractsorm "github.com/goravel/framework/contracts/database/orm"
	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/internal/audit"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
	"github.com/polibee/go-reactrouter/backend/internal/gateway"
	"github.com/polibee/go-reactrouter/backend/internal/pluginhost"
	"github.com/polibee/go-reactrouter/backend/internal/pluginlifecycle"
)

const (
	OperationInstall   = "install"
	OperationUpgrade   = "upgrade"
	OperationEnable    = "enable"
	OperationDisable   = "disable"
	OperationUninstall = "uninstall"

	OperationPending = "pending"
	OperationRunning = "running"
	OperationSuccess = "succeeded"
	OperationFailed  = "failed"
)

var (
	ErrPluginNotFound       = errors.New("plugin not found")
	ErrVersionConflict      = errors.New("plugin version already exists with a different package hash")
	ErrPluginDataDelete     = errors.New("plugin data deletion is not configured")
	ErrInvalidOperation     = errors.New("invalid plugin lifecycle operation")
	ErrPluginAlreadyRemoved = errors.New("plugin is already uninstalled")
)

type PluginProcessRuntime interface {
	Start(context.Context, pluginhost.ValidatedPlugin) (gateway.RuntimeTarget, error)
	Disable(context.Context, string) error
}

type PluginLifecycleConfig struct {
	Runtime     PluginProcessRuntime
	StorageRoot string
	DataDelete  func(context.Context, string) error
}

// PluginLifecycleService owns durable plugin state. ProcessRuntime is kept as
// a separate dependency because process tokens and live gateway targets are
// intentionally volatile and must never be persisted here.
type PluginLifecycleService struct {
	runtime     PluginProcessRuntime
	storageRoot string
	dataDelete  func(context.Context, string) error
	operationMu sync.Mutex
}

// Reconcile restores enabled plugin processes after a Core restart. Process
// handles are intentionally volatile, so only the durable enabled state is
// read from the database and each current version is health-checked by Start.
func (service *PluginLifecycleService) Reconcile(ctx context.Context) error {
	service.operationMu.Lock()
	defer service.operationMu.Unlock()

	if service.runtime == nil {
		return errors.New("plugin runtime is not configured")
	}
	plugins := make([]models.Plugin, 0)
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.Plugin{}).With("Versions").Where("state", string(contracts.PluginStateEnabled)).Get(&plugins); err != nil {
		return err
	}
	var firstErr error
	for _, plugin := range plugins {
		if plugin.CurrentVersion == nil {
			continue
		}
		versionID := pluginVersionID(plugin, *plugin.CurrentVersion)
		if versionID == 0 {
			continue
		}
		var version models.PluginVersion
		for _, candidate := range plugin.Versions {
			if candidate.ID == versionID {
				version = candidate
				break
			}
		}
		if _, err := service.enableVersion(ctx, plugin, version); err != nil {
			_ = service.setPluginState(ctx, plugin.ID, contracts.PluginStateFailed, stringPointer(err.Error()))
			if firstErr == nil {
				firstErr = fmt.Errorf("reconcile plugin %s: %w", plugin.PluginID, err)
			}
			continue
		}
		if err := service.setVersionState(ctx, version.ID, string(contracts.PluginStateEnabled)); err != nil && firstErr == nil {
			firstErr = fmt.Errorf("persist reconciled plugin %s: %w", plugin.PluginID, err)
		}
	}
	return firstErr
}

func NewPluginLifecycleService(config PluginLifecycleConfig) *PluginLifecycleService {
	if strings.TrimSpace(config.StorageRoot) == "" {
		config.StorageRoot = facades.Config().EnvString("PLUGIN_STORAGE_DIR", filepath.Join(os.TempDir(), "go-reactrouter-plugin-store"))
	}
	return &PluginLifecycleService{
		runtime:     config.Runtime,
		storageRoot: config.StorageRoot,
		dataDelete:  config.DataDelete,
	}
}

func (service *PluginLifecycleService) Install(ctx contractshttp.Context, validated pluginhost.ValidatedPlugin, actorID *uint) (models.PluginOperation, error) {
	service.operationMu.Lock()
	defer service.operationMu.Unlock()

	plugin, version, operation, created, err := service.installVersion(ctx, validated, OperationInstall, actorID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	if !created && operation.ID == 0 {
		operation, err = service.createOperation(ctx, plugin.ID, version.ID, OperationInstall, actorID)
		if err != nil {
			return models.PluginOperation{}, err
		}
	}
	if !created {
		return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin version already installed", nil)
	}
	return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin installed", nil)
}

func (service *PluginLifecycleService) Upgrade(ctx contractshttp.Context, validated pluginhost.ValidatedPlugin, actorID *uint) (models.PluginOperation, error) {
	service.operationMu.Lock()
	defer service.operationMu.Unlock()

	plugin, version, operation, created, err := service.installVersion(ctx, validated, OperationUpgrade, actorID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	if !created && operation.ID == 0 {
		operation, err = service.createOperation(ctx, plugin.ID, version.ID, OperationUpgrade, actorID)
		if err != nil {
			return models.PluginOperation{}, err
		}
	}
	if !created {
		return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin version already installed", nil)
	}

	oldVersion := ""
	if plugin.CurrentVersion != nil {
		oldVersion = *plugin.CurrentVersion
	}
	oldState := plugin.State
	if oldState == string(contracts.PluginStateEnabled) {
		if service.runtime == nil {
			return service.failOperation(ctx, operation, errors.New("plugin runtime is not configured"))
		}
		if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateDisabling, nil); err != nil {
			return service.failOperation(ctx, operation, err)
		}
		if err := service.runtime.Disable(ctx, plugin.PluginID); err != nil {
			_ = service.setPluginState(ctx, plugin.ID, contracts.PluginStateFailed, stringPointer(err.Error()))
			return service.failOperation(ctx, operation, fmt.Errorf("stop old plugin version: %w", err))
		}
		if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateDisabled, nil); err != nil {
			return service.failOperation(ctx, operation, err)
		}
		if oldVersionID := pluginVersionID(plugin, oldVersion); oldVersionID != 0 {
			if err := service.setVersionState(ctx, oldVersionID, string(contracts.PluginStateDisabled)); err != nil {
				return service.failOperation(ctx, operation, err)
			}
		}
	}

	upgradeState := contracts.PluginState(oldState)
	if oldState == string(contracts.PluginStateEnabled) {
		upgradeState = contracts.PluginStateDisabled
	} else if oldState == string(contracts.PluginStateFailed) {
		upgradeState = contracts.PluginStateInstalled
	}
	if err := service.setCurrentVersion(ctx, plugin.ID, version.Version, upgradeState); err != nil {
		return service.rollbackUpgrade(ctx, operation, plugin, oldVersion, oldState, err)
	}
	if oldState == string(contracts.PluginStateEnabled) {
		if _, err := service.enableVersion(ctx, plugin, version); err != nil {
			return service.rollbackUpgrade(ctx, operation, plugin, oldVersion, oldState, err)
		}
		if err := service.setVersionState(ctx, version.ID, string(contracts.PluginStateEnabled)); err != nil {
			return service.rollbackUpgrade(ctx, operation, plugin, oldVersion, oldState, err)
		}
		if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateEnabled, nil); err != nil {
			return service.rollbackUpgrade(ctx, operation, plugin, oldVersion, oldState, err)
		}
	} else if upgradeState == contracts.PluginStateDisabled {
		if err := service.setVersionState(ctx, version.ID, string(contracts.PluginStateDisabled)); err != nil {
			return service.rollbackUpgrade(ctx, operation, plugin, oldVersion, oldState, err)
		}
	}
	return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin upgraded", nil)
}

func (service *PluginLifecycleService) Enable(ctx contractshttp.Context, pluginID string, actorID *uint) (models.PluginOperation, error) {
	service.operationMu.Lock()
	defer service.operationMu.Unlock()

	plugin, version, err := service.currentPlugin(ctx, pluginID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	if plugin.State == string(contracts.PluginStateUninstalled) {
		return models.PluginOperation{}, ErrPluginAlreadyRemoved
	}
	operation, err := service.createOperation(ctx, plugin.ID, version.ID, OperationEnable, actorID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	if plugin.State == string(contracts.PluginStateEnabled) {
		return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin already enabled", nil)
	}
	if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateEnabling, nil); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	if _, err := service.enableVersion(ctx, plugin, version); err != nil {
		_ = service.setPluginState(ctx, plugin.ID, contracts.PluginStateFailed, stringPointer(err.Error()))
		return service.failOperation(ctx, operation, err)
	}
	if err := service.setVersionState(ctx, version.ID, string(contracts.PluginStateEnabled)); err != nil {
		_ = service.setPluginState(ctx, plugin.ID, contracts.PluginStateFailed, stringPointer(err.Error()))
		return service.failOperation(ctx, operation, err)
	}
	if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateEnabled, nil); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin enabled", nil)
}

func (service *PluginLifecycleService) Disable(ctx contractshttp.Context, pluginID string, actorID *uint) (models.PluginOperation, error) {
	service.operationMu.Lock()
	defer service.operationMu.Unlock()

	plugin, version, err := service.currentPlugin(ctx, pluginID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	if plugin.State == string(contracts.PluginStateUninstalled) {
		return models.PluginOperation{}, ErrPluginAlreadyRemoved
	}
	operation, err := service.createOperation(ctx, plugin.ID, version.ID, OperationDisable, actorID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	if plugin.State == string(contracts.PluginStateDisabled) || plugin.State == string(contracts.PluginStateInstalled) {
		return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin already disabled", nil)
	}
	if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateDisabling, nil); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	if service.runtime != nil {
		if err := service.runtime.Disable(ctx, pluginID); err != nil {
			_ = service.setPluginState(ctx, plugin.ID, contracts.PluginStateFailed, stringPointer(err.Error()))
			return service.failOperation(ctx, operation, err)
		}
	}
	if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateDisabled, nil); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	if err := service.setVersionState(ctx, version.ID, string(contracts.PluginStateDisabled)); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin disabled", nil)
}

func (service *PluginLifecycleService) Uninstall(ctx contractshttp.Context, pluginID string, deleteData bool, actorID *uint) (models.PluginOperation, error) {
	service.operationMu.Lock()
	defer service.operationMu.Unlock()

	plugin, version, err := service.currentPlugin(ctx, pluginID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	operation, err := service.createOperation(ctx, plugin.ID, version.ID, OperationUninstall, actorID)
	if err != nil {
		return models.PluginOperation{}, err
	}
	if plugin.State == string(contracts.PluginStateUninstalled) {
		return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin already uninstalled", nil)
	}
	if plugin.State == string(contracts.PluginStateEnabled) {
		if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateDisabling, nil); err != nil {
			return service.failOperation(ctx, operation, err)
		}
		if service.runtime == nil {
			return service.failOperation(ctx, operation, errors.New("plugin runtime is not configured"))
		}
		if err := service.runtime.Disable(ctx, pluginID); err != nil {
			_ = service.setPluginState(ctx, plugin.ID, contracts.PluginStateFailed, stringPointer(err.Error()))
			return service.failOperation(ctx, operation, err)
		}
		if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateDisabled, nil); err != nil {
			return service.failOperation(ctx, operation, err)
		}
	}
	if deleteData {
		if service.dataDelete == nil {
			return service.failOperation(ctx, operation, ErrPluginDataDelete)
		}
		if err := service.dataDelete(ctx, pluginID); err != nil {
			return service.failOperation(ctx, operation, err)
		}
	}
	if err := service.setPluginState(ctx, plugin.ID, contracts.PluginStateUninstalling, nil); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	if err := os.RemoveAll(filepath.Join(service.storageRoot, plugin.PluginID)); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	if err := service.markUninstalled(ctx, plugin.ID); err != nil {
		return service.failOperation(ctx, operation, err)
	}
	return service.finishOperation(ctx, operation, OperationSuccess, 100, "plugin uninstalled", nil)
}

func (service *PluginLifecycleService) installVersion(ctx contractshttp.Context, validated pluginhost.ValidatedPlugin, operationType string, actorID *uint) (models.Plugin, models.PluginVersion, models.PluginOperation, bool, error) {
	var plugin models.Plugin
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.Plugin{}).With("Versions").Where("plugin_id", validated.Manifest.ID).First(&plugin); err == nil && plugin.ID != 0 {
		for _, existing := range plugin.Versions {
			if existing.Version != validated.Manifest.Version {
				continue
			}
			if existing.PackageHash != validated.Hash {
				return models.Plugin{}, models.PluginVersion{}, models.PluginOperation{}, false, ErrVersionConflict
			}
			if plugin.State != string(contracts.PluginStateUninstalled) {
				_ = os.RemoveAll(validated.Root)
				return plugin, existing, models.PluginOperation{}, false, nil
			}
		}
		if operationType == OperationUpgrade && plugin.State == string(contracts.PluginStateUninstalled) {
			_ = os.RemoveAll(validated.Root)
			return models.Plugin{}, models.PluginVersion{}, models.PluginOperation{}, false, ErrPluginAlreadyRemoved
		}
	}

	destination := filepath.Join(service.storageRoot, validated.Manifest.ID, validated.Manifest.Version)
	if err := os.MkdirAll(filepath.Dir(destination), 0o750); err != nil {
		return models.Plugin{}, models.PluginVersion{}, models.PluginOperation{}, false, err
	}
	if err := movePluginRoot(validated.Root, destination); err != nil {
		return models.Plugin{}, models.PluginVersion{}, models.PluginOperation{}, false, err
	}
	validated.Root = destination
	manifestJSON, err := json.Marshal(validated.Manifest)
	if err != nil {
		_ = os.RemoveAll(destination)
		return models.Plugin{}, models.PluginVersion{}, models.PluginOperation{}, false, err
	}
	dependencies, err := json.Marshal(validated.Manifest.Dependencies)
	if err != nil {
		_ = os.RemoveAll(destination)
		return models.Plugin{}, models.PluginVersion{}, models.PluginOperation{}, false, err
	}
	version := models.PluginVersion{
		Version:        validated.Manifest.Version,
		PackageHash:    validated.Hash,
		InstallRoot:    destination,
		ManifestJSON:   string(manifestJSON),
		Dependencies:   string(dependencies),
		SignatureKeyID: stringPointer(validated.SignatureKeyID),
		State:          string(contracts.PluginStateInstalled),
		HealthStatus:   "unknown",
	}
	for _, existing := range plugin.Versions {
		if existing.Version == version.Version {
			version.ID = existing.ID
			version.CreatedAt = existing.CreatedAt
			break
		}
	}
	operation := models.PluginOperation{}
	if err := facades.Orm().WithContext(ctx).Transaction(func(tx contractsorm.Query) error {
		if plugin.ID == 0 {
			plugin = models.Plugin{
				PluginID: validated.Manifest.ID, Name: validated.Manifest.Name,
				DisplayName: validated.Manifest.DisplayName,
				State:       string(contracts.PluginStateInstalled), HealthStatus: "unknown",
			}
			if err := tx.Create(&plugin); err != nil {
				return err
			}
		}
		version.PluginID = plugin.ID
		if version.ID == 0 {
			if err := tx.Create(&version); err != nil {
				return err
			}
		} else if err := tx.Save(&version); err != nil {
			return err
		}
		if plugin.CurrentVersion == nil || plugin.State == string(contracts.PluginStateUninstalled) {
			current := version.Version
			plugin.CurrentVersion = &current
			plugin.State = string(contracts.PluginStateInstalled)
			if err := tx.Save(&plugin); err != nil {
				return err
			}
		}
		operation = newPluginOperation(plugin.ID, version.ID, operationType, actorID)
		if err := tx.Create(&operation); err != nil {
			return err
		}
		return nil
	}); err != nil {
		_ = os.RemoveAll(destination)
		return models.Plugin{}, models.PluginVersion{}, models.PluginOperation{}, false, err
	}
	return plugin, version, operation, true, nil
}

func (service *PluginLifecycleService) currentPlugin(ctx contractshttp.Context, pluginID string) (models.Plugin, models.PluginVersion, error) {
	var plugin models.Plugin
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.Plugin{}).With("Versions").Where("plugin_id", pluginID).First(&plugin); err != nil || plugin.ID == 0 {
		return models.Plugin{}, models.PluginVersion{}, ErrPluginNotFound
	}
	if plugin.CurrentVersion == nil {
		return models.Plugin{}, models.PluginVersion{}, errors.New("plugin has no current version")
	}
	for _, version := range plugin.Versions {
		if version.Version == *plugin.CurrentVersion {
			return plugin, version, nil
		}
	}
	return models.Plugin{}, models.PluginVersion{}, errors.New("plugin current version is missing")
}

func pluginVersionID(plugin models.Plugin, version string) uint {
	for _, candidate := range plugin.Versions {
		if candidate.Version == version {
			return candidate.ID
		}
	}
	return 0
}

func (service *PluginLifecycleService) enableVersion(ctx context.Context, plugin models.Plugin, version models.PluginVersion) (gateway.RuntimeTarget, error) {
	if service.runtime == nil {
		return gateway.RuntimeTarget{}, errors.New("plugin runtime is not configured")
	}
	var manifest contracts.PluginManifest
	if err := json.Unmarshal([]byte(version.ManifestJSON), &manifest); err != nil {
		return gateway.RuntimeTarget{}, fmt.Errorf("decode plugin manifest: %w", err)
	}
	return service.runtime.Start(ctx, pluginhost.ValidatedPlugin{
		Manifest: manifest, Hash: version.PackageHash, Root: version.InstallRoot,
		SignatureKeyID: valueOrEmpty(version.SignatureKeyID),
	})
}

func (service *PluginLifecycleService) setCurrentVersion(ctx contractshttp.Context, pluginID uint, version string, state contracts.PluginState) error {
	return facades.Orm().WithContext(ctx).Transaction(func(tx contractsorm.Query) error {
		var plugin models.Plugin
		if err := tx.Model(&models.Plugin{}).Where("id", pluginID).First(&plugin); err != nil || plugin.ID == 0 {
			return ErrPluginNotFound
		}
		plugin.CurrentVersion = &version
		plugin.State = string(state)
		return tx.Save(&plugin)
	})
}

func (service *PluginLifecycleService) setPluginState(ctx context.Context, pluginID uint, state contracts.PluginState, lastError *string) error {
	return facades.Orm().WithContext(ctx).Transaction(func(tx contractsorm.Query) error {
		var plugin models.Plugin
		if err := tx.Model(&models.Plugin{}).Where("id", pluginID).First(&plugin); err != nil || plugin.ID == 0 {
			return ErrPluginNotFound
		}
		if plugin.State != string(state) {
			if err := pluginlifecycle.Transition(contracts.PluginState(plugin.State), state); err != nil {
				return err
			}
		}
		plugin.State = string(state)
		plugin.LastError = lastError
		return tx.Save(&plugin)
	})
}

func (service *PluginLifecycleService) setVersionState(ctx context.Context, versionID uint, state string) error {
	return facades.Orm().WithContext(ctx).Transaction(func(tx contractsorm.Query) error {
		var version models.PluginVersion
		if err := tx.Model(&models.PluginVersion{}).Where("id", versionID).First(&version); err != nil || version.ID == 0 {
			return errors.New("plugin version not found")
		}
		version.State = state
		return tx.Save(&version)
	})
}

func (service *PluginLifecycleService) markUninstalled(ctx contractshttp.Context, pluginID uint) error {
	return facades.Orm().WithContext(ctx).Transaction(func(tx contractsorm.Query) error {
		var plugin models.Plugin
		if err := tx.Model(&models.Plugin{}).Where("id", pluginID).First(&plugin); err != nil || plugin.ID == 0 {
			return ErrPluginNotFound
		}
		plugin.State = string(contracts.PluginStateUninstalled)
		plugin.LastError = nil
		if err := tx.Save(&plugin); err != nil {
			return err
		}
		_, err := tx.Model(&models.PluginVersion{}).Where("plugin_id", plugin.ID).Update(map[string]any{"state": string(contracts.PluginStateUninstalled)})
		return err
	})
}

func (service *PluginLifecycleService) createOperation(ctx contractshttp.Context, pluginID, versionID uint, operationType string, actorID *uint) (models.PluginOperation, error) {
	operation := newPluginOperation(pluginID, versionID, operationType, actorID)
	if err := facades.Orm().WithContext(ctx).Query().Create(&operation); err != nil {
		return models.PluginOperation{}, err
	}
	return operation, nil
}

func newPluginOperation(pluginID, versionID uint, operationType string, actorID *uint) models.PluginOperation {
	return models.PluginOperation{
		OperationID: newOperationID(), PluginID: pluginID, PluginVersionID: &versionID,
		Type: operationType, State: OperationRunning, Progress: 0, UserID: actorID,
		StartedAt: timePointer(time.Now().UTC()),
	}
}

func (service *PluginLifecycleService) finishOperation(ctx contractshttp.Context, operation models.PluginOperation, state string, progress int, message string, operationErr error) (models.PluginOperation, error) {
	now := time.Now().UTC()
	operation.State, operation.Progress, operation.FinishedAt = state, progress, &now
	operation.Message = stringPointer(message)
	if operationErr != nil {
		operation.LastError = stringPointer(operationErr.Error())
	}
	if err := facades.Orm().WithContext(ctx).Query().Save(&operation); err != nil {
		return operation, err
	}
	auditError := audit.Write(ctx, facades.Orm().WithContext(ctx).Query(), audit.Event{
		Action:       "plugin." + operation.Type + "." + state,
		ResourceType: "plugin",
		ResourceID:   fmt.Sprintf("%d", operation.PluginID),
		After:        pluginOperationAudit(operation),
	})
	if auditError != nil {
		return operation, fmt.Errorf("write plugin lifecycle audit: %w", auditError)
	}
	if operationErr != nil {
		return operation, operationErr
	}
	return operation, nil
}

func (service *PluginLifecycleService) failOperation(ctx contractshttp.Context, operation models.PluginOperation, err error) (models.PluginOperation, error) {
	return service.finishOperation(ctx, operation, OperationFailed, operation.Progress, "plugin operation failed", err)
}

func (service *PluginLifecycleService) rollbackUpgrade(ctx contractshttp.Context, operation models.PluginOperation, plugin models.Plugin, oldVersion, oldState string, cause error) (models.PluginOperation, error) {
	if oldVersion != "" {
		restoreState := contracts.PluginState(oldState)
		if restoreState == contracts.PluginStateEnabled {
			restoreState = contracts.PluginStateDisabled
		}
		_ = service.setCurrentVersion(ctx, plugin.ID, oldVersion, restoreState)
	}
	if oldState == string(contracts.PluginStateEnabled) && oldVersion != "" {
		if current, version, err := service.currentPlugin(ctx, plugin.PluginID); err == nil {
			if _, startErr := service.enableVersion(ctx, current, version); startErr == nil {
				_ = service.setVersionState(ctx, version.ID, string(contracts.PluginStateEnabled))
				_ = service.setPluginState(ctx, plugin.ID, contracts.PluginStateEnabled, nil)
			}
		}
	}
	return service.failOperation(ctx, operation, fmt.Errorf("upgrade rolled back: %w", cause))
}

func pluginOperationAudit(operation models.PluginOperation) map[string]any {
	return map[string]any{
		"operation_id": operation.OperationID,
		"type":         operation.Type,
		"state":        operation.State,
		"progress":     operation.Progress,
		"message":      operation.Message,
		"last_error":   operation.LastError,
	}
}

func movePluginRoot(source, destination string) error {
	if err := os.RemoveAll(destination); err != nil {
		return err
	}
	if err := os.Rename(source, destination); err == nil {
		return nil
	}
	if err := copyDirectory(source, destination); err != nil {
		return err
	}
	return os.RemoveAll(source)
}

func copyDirectory(source, destination string) error {
	return filepath.Walk(source, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relative, err := filepath.Rel(source, path)
		if err != nil {
			return err
		}
		target := filepath.Join(destination, relative)
		if info.IsDir() {
			return os.MkdirAll(target, info.Mode().Perm())
		}
		input, err := os.Open(path)
		if err != nil {
			return err
		}
		defer input.Close()
		output, err := os.OpenFile(target, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, info.Mode().Perm())
		if err != nil {
			return err
		}
		_, copyErr := io.Copy(output, input)
		closeErr := output.Close()
		if copyErr != nil {
			return copyErr
		}
		return closeErr
	})
}

func newOperationID() string {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return fmt.Sprintf("op-%d", time.Now().UnixNano())
	}
	return "op-" + hex.EncodeToString(bytes[:])
}

func stringPointer(value string) *string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return &value
}

func timePointer(value time.Time) *time.Time { return &value }

func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
