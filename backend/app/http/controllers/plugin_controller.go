package controllers

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	contractsorm "github.com/goravel/framework/contracts/database/orm"
	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/app/services"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
	"github.com/polibee/go-reactrouter/backend/internal/pluginhost"
)

type PluginListItem struct {
	ID             string                       `json:"id"`
	PluginID       string                       `json:"plugin_id"`
	Name           string                       `json:"name"`
	DisplayName    string                       `json:"display_name"`
	State          string                       `json:"state"`
	CurrentVersion string                       `json:"current_version,omitempty"`
	APIVersion     string                       `json:"api_version,omitempty"`
	CoreRequires   string                       `json:"core_requires,omitempty"`
	FrontendEntry  string                       `json:"frontend_entrypoint,omitempty"`
	Trusted        bool                         `json:"trusted"`
	Dependencies   []contracts.PluginDependency `json:"dependencies"`
	LastError      *string                      `json:"last_error,omitempty"`
	HealthStatus   string                       `json:"health_status"`
}

type PluginValidateRequest struct {
	Path string `json:"path"`
}

type PluginController struct {
	lifecycle *services.PluginLifecycleService
}

func NewPluginController(lifecycle ...*services.PluginLifecycleService) *PluginController {
	controller := &PluginController{}
	if len(lifecycle) > 0 {
		controller.lifecycle = lifecycle[0]
	}
	return controller
}

func (controller *PluginController) List(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	plugins := make([]models.Plugin, 0)
	databaseQuery := facades.Orm().WithContext(ctx).Query().Model(&models.Plugin{}).With("Versions").Where("state", "!=", "uninstalled").OrderByDesc("id")
	if query.Search != "" {
		databaseQuery = databaseQuery.WhereAny([]string{"plugin_id", "name", "display_name"}, "like", "%"+query.Search+"%")
	}
	var total int64
	if err := databaseQuery.Paginate(query.Page, query.PageSize, &plugins, &total); err != nil {
		return resourceLookupFailure(ctx, "plugins")
	}
	items := make([]PluginListItem, 0, len(plugins))
	for _, plugin := range plugins {
		items = append(items, pluginListItem(plugin))
	}
	return paginatedResponse(ctx, items, query, total)
}

func (controller *PluginController) Detail(ctx contractshttp.Context) contractshttp.Response {
	var plugin models.Plugin
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.Plugin{}).With("Versions").Where("plugin_id", ctx.Request().Route("id")).First(&plugin); err != nil || plugin.ID == 0 || plugin.State == string(contracts.PluginStateUninstalled) {
		return notFoundFailure(ctx, "plugin")
	}
	return ctx.Response().Success().Json(contracts.Success(pluginListItem(plugin)))
}

func (controller *PluginController) Install(ctx contractshttp.Context) contractshttp.Response {
	return controller.installOrUpgrade(ctx, services.OperationInstall)
}

func (controller *PluginController) Upgrade(ctx contractshttp.Context) contractshttp.Response {
	return controller.installOrUpgrade(ctx, services.OperationUpgrade)
}

func (controller *PluginController) Enable(ctx contractshttp.Context) contractshttp.Response {
	if controller.lifecycle == nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "plugin.lifecycle_unavailable", "plugin lifecycle service is unavailable")
	}
	operation, err := controller.lifecycle.Enable(ctx, ctx.Request().Route("id"), authenticatedUserID(ctx))
	return controller.lifecycleResponse(ctx, operation, err)
}

func (controller *PluginController) Disable(ctx contractshttp.Context) contractshttp.Response {
	if controller.lifecycle == nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "plugin.lifecycle_unavailable", "plugin lifecycle service is unavailable")
	}
	operation, err := controller.lifecycle.Disable(ctx, ctx.Request().Route("id"), authenticatedUserID(ctx))
	return controller.lifecycleResponse(ctx, operation, err)
}

func (controller *PluginController) Uninstall(ctx contractshttp.Context) contractshttp.Response {
	if controller.lifecycle == nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "plugin.lifecycle_unavailable", "plugin lifecycle service is unavailable")
	}
	var request PluginUninstallRequest
	if err := ctx.Request().Bind(&request); err != nil || !request.Confirm {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "plugin.confirmation_required", "confirm must be true to uninstall a plugin")
	}
	if request.DeleteData && !request.DeleteDataConfirm {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "plugin.data_confirmation_required", "delete_data_confirm must be true when deleting plugin data")
	}
	operation, err := controller.lifecycle.Uninstall(ctx, ctx.Request().Route("id"), request.DeleteData, authenticatedUserID(ctx))
	return controller.lifecycleResponse(ctx, operation, err)
}

func (controller *PluginController) Versions(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	var plugin models.Plugin
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.Plugin{}).With("Versions").Where("plugin_id", ctx.Request().Route("id")).First(&plugin); err != nil || plugin.ID == 0 {
		return notFoundFailure(ctx, "plugin")
	}
	items := make([]map[string]any, 0, len(plugin.Versions))
	for _, version := range plugin.Versions {
		items = append(items, pluginVersionListItem(version))
	}
	pageItems, total := paginateItems(items, query)
	return paginatedResponse(ctx, pageItems, query, total)
}

func (controller *PluginController) Logs(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	var plugin models.Plugin
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.Plugin{}).Where("plugin_id", ctx.Request().Route("id")).First(&plugin); err != nil || plugin.ID == 0 {
		return notFoundFailure(ctx, "plugin")
	}
	operations := make([]models.PluginOperation, 0)
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.PluginOperation{}).Where("plugin_id", plugin.ID).OrderByDesc("id").Get(&operations); err != nil {
		return resourceLookupFailure(ctx, "plugin operations")
	}
	items := make([]map[string]any, 0, len(operations))
	for _, operation := range operations {
		items = append(items, pluginOperationListItem(operation))
	}
	pageItems, total := paginateItems(items, query)
	return paginatedResponse(ctx, pageItems, query, total)
}

func (controller *PluginController) Operation(ctx contractshttp.Context) contractshttp.Response {
	var operation models.PluginOperation
	if err := facades.Orm().WithContext(ctx).Query().Model(&models.PluginOperation{}).Where("operation_id", ctx.Request().Route("operationID")).First(&operation); err != nil || operation.ID == 0 {
		return notFoundFailure(ctx, "plugin operation")
	}
	return ctx.Response().Success().Json(contracts.Success(pluginOperationListItem(operation)))
}

type PluginUninstallRequest struct {
	Confirm           bool `json:"confirm"`
	DeleteData        bool `json:"delete_data"`
	DeleteDataConfirm bool `json:"delete_data_confirm"`
}

func (controller *PluginController) installOrUpgrade(ctx contractshttp.Context, operationType string) contractshttp.Response {
	if controller.lifecycle == nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "plugin.lifecycle_unavailable", "plugin lifecycle service is unavailable")
	}
	packagePath, cleanup, err := pluginPackagePath(ctx)
	if err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "plugin.package_required", err.Error())
	}
	if cleanup != nil {
		defer cleanup()
	}
	validated, err := pluginhost.ValidatePackage(packagePath, pluginPlatform())
	if err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, pluginhost.ErrorCode(err), err.Error())
	}
	if operationType == services.OperationUpgrade && validated.Manifest.ID != ctx.Request().Route("id") {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "plugin.id_mismatch", "upgrade package id does not match the route plugin id")
	}
	var operationRecord models.PluginOperation
	if operationType == services.OperationUpgrade {
		operationRecord, err = controller.lifecycle.Upgrade(ctx, validated, authenticatedUserID(ctx))
	} else {
		operationRecord, err = controller.lifecycle.Install(ctx, validated, authenticatedUserID(ctx))
	}
	return controller.lifecycleResponse(ctx, operationRecord, err)
}

func (controller *PluginController) lifecycleResponse(ctx contractshttp.Context, operation models.PluginOperation, err error) contractshttp.Response {
	if err != nil {
		status := contractshttp.StatusInternalServerError
		code := "plugin.lifecycle_failed"
		switch {
		case errors.Is(err, services.ErrPluginNotFound):
			status, code = contractshttp.StatusNotFound, "plugin.not_found"
		case errors.Is(err, services.ErrVersionConflict):
			status, code = contractshttp.StatusConflict, "plugin.version_conflict"
		case errors.Is(err, services.ErrPluginAlreadyRemoved):
			status, code = contractshttp.StatusConflict, "plugin.already_uninstalled"
		case errors.Is(err, services.ErrPluginDataDelete):
			status, code = contractshttp.StatusConflict, "plugin.data_delete_unavailable"
		case strings.Contains(err.Error(), "invalid plugin state transition"):
			status, code = contractshttp.StatusUnprocessableEntity, "plugin.invalid_state_transition"
		}
		return failureResponse(ctx, status, code, err.Error())
	}
	return ctx.Response().Success().Json(contracts.Success(map[string]any{
		"operation": pluginOperationListItem(operation),
	}))
}

func authenticatedUserID(ctx contractshttp.Context) *uint {
	value, err := facades.Auth(ctx).ID()
	if err != nil {
		return nil
	}
	parsed, err := strconv.ParseUint(value, 10, 64)
	if err != nil || parsed == 0 {
		return nil
	}
	result := uint(parsed)
	return &result
}

func (controller *PluginController) Validate(ctx contractshttp.Context) contractshttp.Response {
	packagePath, cleanup, err := pluginPackagePath(ctx)
	if err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "plugin.package_required", err.Error())
	}
	if cleanup != nil {
		defer cleanup()
	}

	validated, err := pluginhost.ValidatePackage(packagePath, pluginPlatform())
	if err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, pluginhost.ErrorCode(err), err.Error())
	}
	plugin, version, err := persistValidatedPlugin(ctx, validated)
	if err != nil {
		_ = os.RemoveAll(validated.Root)
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "plugin.persist_failed", err.Error())
	}
	return ctx.Response().Json(contractshttp.StatusCreated, contracts.Success(map[string]any{
		"plugin":  pluginListItem(plugin),
		"version": pluginVersionListItem(version),
	}))
}

func pluginListItem(plugin models.Plugin) PluginListItem {
	item := PluginListItem{
		ID:           fmt.Sprintf("%d", plugin.ID),
		PluginID:     plugin.PluginID,
		Name:         plugin.Name,
		DisplayName:  plugin.DisplayName,
		State:        plugin.State,
		Dependencies: []contracts.PluginDependency{},
		LastError:    plugin.LastError,
		HealthStatus: plugin.HealthStatus,
	}
	if plugin.CurrentVersion != nil {
		item.CurrentVersion = *plugin.CurrentVersion
	}
	for _, version := range plugin.Versions {
		if plugin.CurrentVersion != nil && version.Version != *plugin.CurrentVersion {
			continue
		}
		_ = json.Unmarshal([]byte(version.Dependencies), &item.Dependencies)
		var manifest struct {
			APIVersion   string `json:"apiVersion"`
			CoreRequires string `json:"coreRequires"`
			Frontend     struct {
				Entrypoint string `json:"entrypoint"`
			} `json:"frontend"`
		}
		if json.Unmarshal([]byte(version.ManifestJSON), &manifest) == nil {
			item.APIVersion = manifest.APIVersion
			item.CoreRequires = manifest.CoreRequires
			item.FrontendEntry = manifest.Frontend.Entrypoint
			item.Trusted = item.APIVersion != "" && item.FrontendEntry != ""
		}
		break
	}
	return item
}

func pluginVersionListItem(version models.PluginVersion) map[string]any {
	return map[string]any{
		"id":               fmt.Sprintf("%d", version.ID),
		"version":          version.Version,
		"package_hash":     version.PackageHash,
		"signature_key_id": version.SignatureKeyID,
		"state":            version.State,
		"health_status":    version.HealthStatus,
	}
}

func pluginOperationListItem(operation models.PluginOperation) map[string]any {
	return map[string]any{
		"id":                fmt.Sprintf("%d", operation.ID),
		"operation_id":      operation.OperationID,
		"plugin_id":         fmt.Sprintf("%d", operation.PluginID),
		"plugin_version_id": optionalUintString(operation.PluginVersionID),
		"type":              operation.Type,
		"state":             operation.State,
		"progress":          operation.Progress,
		"message":           operation.Message,
		"last_error":        operation.LastError,
		"user_id":           optionalUintString(operation.UserID),
		"started_at":        operation.StartedAt,
		"finished_at":       operation.FinishedAt,
	}
}

func optionalUintString(value *uint) *string {
	if value == nil {
		return nil
	}
	result := strconv.FormatUint(uint64(*value), 10)
	return &result
}

func pluginPackagePath(ctx contractshttp.Context) (string, func(), error) {
	if uploaded, err := ctx.Request().File("package"); err == nil && uploaded != nil {
		return uploaded.File(), func() { _ = os.Remove(uploaded.File()) }, nil
	}
	var request PluginValidateRequest
	if err := ctx.Request().Bind(&request); err != nil && strings.TrimSpace(request.Path) == "" {
		return "", nil, errors.New("multipart field package or JSON path is required")
	}
	requested := strings.TrimSpace(request.Path)
	if requested == "" {
		return "", nil, errors.New("multipart field package or JSON path is required")
	}
	root := facades.Config().EnvString("PLUGIN_PACKAGE_DIR", filepath.Join(os.TempDir(), "go-reactrouter-plugins"))
	if err := os.MkdirAll(root, 0o700); err != nil {
		return "", nil, err
	}
	if !filepath.IsAbs(requested) {
		requested = filepath.Join(root, requested)
	}
	rootAbs, err := filepath.Abs(root)
	if err != nil {
		return "", nil, err
	}
	pathAbs, err := filepath.Abs(requested)
	if err != nil {
		return "", nil, err
	}
	if filepath.Dir(pathAbs) != rootAbs && !strings.HasPrefix(pathAbs, rootAbs+string(os.PathSeparator)) {
		return "", nil, errors.New("package path must remain inside PLUGIN_PACKAGE_DIR")
	}
	info, err := os.Lstat(pathAbs)
	if err != nil {
		return "", nil, err
	}
	if info.Mode()&os.ModeSymlink != 0 || !info.Mode().IsRegular() {
		return "", nil, errors.New("package path must be a regular file")
	}
	return pathAbs, nil, nil
}

func pluginPlatform() pluginhost.Platform {
	trustStore := make(map[string]ed25519.PublicKey)
	for _, item := range strings.Split(facades.Config().EnvString("PLUGIN_TRUST_KEYS", ""), ",") {
		parts := strings.SplitN(strings.TrimSpace(item), "=", 2)
		if len(parts) != 2 {
			continue
		}
		key, err := base64.RawStdEncoding.DecodeString(parts[1])
		if err == nil && len(key) == ed25519.PublicKeySize {
			trustStore[parts[0]] = ed25519.PublicKey(key)
		}
	}
	return pluginhost.Platform{
		CoreVersion:   facades.Config().EnvString("CORE_VERSION", "1.0.0"),
		OS:            runtime.GOOS,
		Arch:          runtime.GOARCH,
		TrustStore:    trustStore,
		AllowUnsigned: facades.Config().EnvBool("PLUGIN_ALLOW_UNSIGNED", false),
	}
}

func persistValidatedPlugin(ctx contractshttp.Context, validated pluginhost.ValidatedPlugin) (models.Plugin, models.PluginVersion, error) {
	manifestJSON, err := json.Marshal(validated.Manifest)
	if err != nil {
		return models.Plugin{}, models.PluginVersion{}, err
	}
	dependencies, err := json.Marshal(validated.Manifest.Dependencies)
	if err != nil {
		return models.Plugin{}, models.PluginVersion{}, err
	}
	plugin := models.Plugin{}
	version := models.PluginVersion{}
	err = facades.Orm().WithContext(ctx).Transaction(func(tx contractsorm.Query) error {
		if findErr := tx.Model(&models.Plugin{}).Where("plugin_id", validated.Manifest.ID).First(&plugin); findErr != nil || plugin.ID == 0 {
			plugin = models.Plugin{
				PluginID:     validated.Manifest.ID,
				Name:         validated.Manifest.Name,
				DisplayName:  validated.Manifest.DisplayName,
				State:        "installed",
				HealthStatus: "unknown",
			}
			if err := tx.Create(&plugin); err != nil {
				return err
			}
		} else {
			plugin.Name = validated.Manifest.Name
			plugin.DisplayName = validated.Manifest.DisplayName
			plugin.State = "installed"
			plugin.HealthStatus = "unknown"
			if err := tx.Save(&plugin); err != nil {
				return err
			}
		}

		if findErr := tx.Model(&models.PluginVersion{}).Where("plugin_id", plugin.ID).Where("version", validated.Manifest.Version).First(&version); findErr != nil || version.ID == 0 {
			version = models.PluginVersion{PluginID: plugin.ID, Version: validated.Manifest.Version}
		}
		version.PackageHash = validated.Hash
		version.InstallRoot = validated.Root
		version.ManifestJSON = string(manifestJSON)
		version.Dependencies = string(dependencies)
		version.SignatureKeyID = optionalString(validated.SignatureKeyID)
		version.State = "installed"
		version.HealthStatus = "unknown"
		if version.ID == 0 {
			if err := tx.Create(&version); err != nil {
				return err
			}
		} else if err := tx.Save(&version); err != nil {
			return err
		}
		plugin.CurrentVersion = &version.Version
		return tx.Save(&plugin)
	})
	return plugin, version, err
}

func optionalString(value string) *string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return &value
}
