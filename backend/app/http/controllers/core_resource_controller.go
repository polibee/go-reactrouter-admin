package controllers

import (
	"strconv"

	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/http/middleware"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

// CoreResourceController exposes the read side of Core's administrative
// resources. Write operations will use the same DTO and permission boundary
// once validation and audit transactions are added in the next slice.
type CoreResourceController struct {
	resolver middleware.UserResolver
}

func NewCoreResourceController(resolvers ...middleware.UserResolver) *CoreResourceController {
	controller := &CoreResourceController{}
	if len(resolvers) > 0 {
		controller.resolver = resolvers[0]
	}
	return controller
}

func (controller *CoreResourceController) Users(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	users := make([]models.User, 0)
	databaseQuery := facades.Orm().WithContext(ctx).Query().Model(&models.User{}).OrderByDesc("id")
	if query.Search != "" {
		databaseQuery = databaseQuery.WhereAny([]string{"name", "email"}, "like", "%"+query.Search+"%")
	}

	var total int64
	if err := databaseQuery.Paginate(query.Page, query.PageSize, &users, &total); err != nil {
		return resourceLookupFailure(ctx, "users")
	}

	items := make([]UserListItem, 0, len(users))
	for _, user := range users {
		items = append(items, UserListItem{
			ID:          strconv.FormatUint(uint64(user.ID), 10),
			Name:        user.Name,
			Email:       user.Email,
			Status:      user.Status,
			IsActive:    user.IsActive,
			LastLoginAt: user.LastLoginAt,
		})
	}

	return paginatedResponse(ctx, items, query, total)
}

func (controller *CoreResourceController) Roles(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	roles := make([]models.Role, 0)
	databaseQuery := facades.Orm().WithContext(ctx).Query().Model(&models.Role{}).OrderByDesc("id")
	if query.Search != "" {
		databaseQuery = databaseQuery.WhereAny([]string{"name", "display_name"}, "like", "%"+query.Search+"%")
	}

	var total int64
	if err := databaseQuery.Paginate(query.Page, query.PageSize, &roles, &total); err != nil {
		return resourceLookupFailure(ctx, "roles")
	}

	items := make([]RoleListItem, 0, len(roles))
	for _, role := range roles {
		items = append(items, RoleListItem{
			ID:          strconv.FormatUint(uint64(role.ID), 10),
			Name:        role.Name,
			DisplayName: role.DisplayName,
			Description: role.Description,
			IsSystem:    role.IsSystem,
		})
	}

	return paginatedResponse(ctx, items, query, total)
}

func (controller *CoreResourceController) Permissions(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	permissions := make([]models.Permission, 0)
	databaseQuery := facades.Orm().WithContext(ctx).Query().Model(&models.Permission{}).OrderBy("code")
	if query.Search != "" {
		databaseQuery = databaseQuery.WhereAny([]string{"code", "display_name"}, "like", "%"+query.Search+"%")
	}

	var total int64
	if err := databaseQuery.Paginate(query.Page, query.PageSize, &permissions, &total); err != nil {
		return resourceLookupFailure(ctx, "permissions")
	}

	items := make([]PermissionListItem, 0, len(permissions))
	for _, permission := range permissions {
		items = append(items, PermissionListItem{
			ID:          strconv.FormatUint(uint64(permission.ID), 10),
			Code:        permission.Code,
			DisplayName: permission.DisplayName,
			Description: permission.Description,
			ModuleID:    permission.ModuleID,
		})
	}

	return paginatedResponse(ctx, items, query, total)
}

func (controller *CoreResourceController) Menus(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	menus := make([]models.Menu, 0)
	databaseQuery := facades.Orm().WithContext(ctx).Query().Model(&models.Menu{}).Where("is_visible", true).OrderBy("sort").OrderBy("id")
	if query.Search != "" {
		databaseQuery = databaseQuery.WhereAny([]string{"key", "label"}, "like", "%"+query.Search+"%")
	}

	if err := databaseQuery.Get(&menus); err != nil {
		return resourceLookupFailure(ctx, "menus")
	}
	if controller.resolver == nil {
		return resourceLookupFailure(ctx, "menus")
	}
	user, err := controller.resolver.Resolve(ctx)
	if err != nil || user == nil {
		return resourceLookupFailure(ctx, "menus")
	}

	items := make([]MenuListItem, 0, len(menus))
	for _, menu := range menus {
		if menu.Permission != nil && !user.Allows(*menu.Permission) {
			continue
		}
		items = append(items, MenuListItem{
			ID:         strconv.FormatUint(uint64(menu.ID), 10),
			Key:        menu.Key,
			Label:      menu.Label,
			Path:       menu.Path,
			Icon:       menu.Icon,
			Permission: menu.Permission,
			ParentID:   uintPointerToString(menu.ParentID),
			Sort:       menu.Sort,
			IsVisible:  menu.IsVisible,
			Meta:       menu.Meta,
		})
	}

	pageItems, total := paginateItems(items, query)
	return paginatedResponse(ctx, pageItems, query, total)
}

func (controller *CoreResourceController) Settings(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	settings := make([]models.Setting, 0)
	databaseQuery := facades.Orm().WithContext(ctx).Query().Model(&models.Setting{}).OrderBy("key")
	if query.Search != "" {
		databaseQuery = databaseQuery.Where("key", "like", "%"+query.Search+"%")
	}

	var total int64
	if err := databaseQuery.Paginate(query.Page, query.PageSize, &settings, &total); err != nil {
		return resourceLookupFailure(ctx, "settings")
	}

	items := make([]SettingListItem, 0, len(settings))
	for _, setting := range settings {
		items = append(items, SettingListItem{
			ID:       strconv.FormatUint(uint64(setting.ID), 10),
			Key:      setting.Key,
			Value:    setting.Value,
			Type:     setting.Type,
			IsPublic: setting.IsPublic,
		})
	}

	return paginatedResponse(ctx, items, query, total)
}

func (controller *CoreResourceController) AuditLogs(ctx contractshttp.Context) contractshttp.Response {
	query := listQueryFromRequest(ctx)
	logs := make([]models.AuditLog, 0)
	databaseQuery := facades.Orm().WithContext(ctx).Query().Model(&models.AuditLog{}).OrderByDesc("id")
	if query.Search != "" {
		databaseQuery = databaseQuery.WhereAny([]string{"action", "resource_type", "request_id"}, "like", "%"+query.Search+"%")
	}

	var total int64
	if err := databaseQuery.Paginate(query.Page, query.PageSize, &logs, &total); err != nil {
		return resourceLookupFailure(ctx, "audit logs")
	}

	items := make([]AuditLogListItem, 0, len(logs))
	for _, log := range logs {
		items = append(items, AuditLogListItem{
			ID:           strconv.FormatUint(uint64(log.ID), 10),
			UserID:       uintPointerToString(log.UserID),
			Action:       log.Action,
			ResourceType: log.ResourceType,
			ResourceID:   log.ResourceID,
			RequestID:    log.RequestID,
			IPAddress:    log.IPAddress,
			UserAgent:    log.UserAgent,
			BeforeData:   log.BeforeData,
			AfterData:    log.AfterData,
		})
	}

	return paginatedResponse(ctx, items, query, total)
}

func paginatedResponse[T any](ctx contractshttp.Context, items []T, query ListQuery, total int64) contractshttp.Response {
	response := contracts.Success(items)
	response.Meta = &contracts.APIMeta{Page: query.Page, PageSize: query.PageSize, Total: int(total)}
	return ctx.Response().Success().Json(response)
}

func resourceLookupFailure(ctx contractshttp.Context, resource string) contractshttp.Response {
	return ctx.Response().Json(contractshttp.StatusInternalServerError, contracts.Failure(
		"core.resource_lookup_failed",
		"unable to load "+resource,
	))
}

func uintPointerToString(value *uint) *string {
	if value == nil {
		return nil
	}
	result := strconv.FormatUint(uint64(*value), 10)
	return &result
}

func paginateItems[T any](items []T, query ListQuery) ([]T, int64) {
	total := int64(len(items))
	start := (query.Page - 1) * query.PageSize
	if start >= len(items) {
		return []T{}, total
	}
	end := start + query.PageSize
	if end > len(items) {
		end = len(items)
	}
	return items[start:end], total
}
