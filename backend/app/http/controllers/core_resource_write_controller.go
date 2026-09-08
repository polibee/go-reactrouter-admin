package controllers

import (
	"errors"
	"strings"
	"time"

	contractsorm "github.com/goravel/framework/contracts/database/orm"
	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/internal/audit"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

func (controller *CoreResourceController) CreateUser(ctx contractshttp.Context) contractshttp.Response {
	var request UserWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	if fieldErrors := validateUserWriteRequest(request, true); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}

	hashedPassword, err := facades.Hash().Make(request.Password)
	if err != nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "core.password_hash_failed", "unable to secure the password")
	}
	active := true
	if request.IsActive != nil {
		active = *request.IsActive
	}
	status := request.Status
	if status == "" {
		status = "active"
	}
	user := models.User{Name: request.Name, Email: request.Email, Password: hashedPassword, Status: status, IsActive: active}

	err = transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Create(&user); err != nil {
			return err
		}
		if err := replaceRelationIDs(tx, "user_roles", "user_id", "role_id", user.ID, request.RoleIDs); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "created", ResourceType: "user", ResourceID: idString(user.ID), After: user})
	})
	if err != nil {
		return mutationFailure(ctx, "user", err)
	}

	return ctx.Response().Json(contractshttp.StatusCreated, contracts.Success(userListItem(user)))
}

func (controller *CoreResourceController) UpdateUser(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "user")
	}
	var request UserWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	if fieldErrors := validateUserWriteRequest(request, false); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}

	var user models.User
	var before models.User
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.User{}).Where("id", id).First(&user); err != nil {
			return err
		}
		if user.ID == 0 {
			return errNotFound
		}
		before = user
		user.Name, user.Email = request.Name, request.Email
		if request.Status != "" {
			user.Status = request.Status
		}
		if request.IsActive != nil {
			user.IsActive = *request.IsActive
		}
		if request.Password != "" {
			hashedPassword, hashErr := facades.Hash().Make(request.Password)
			if hashErr != nil {
				return hashErr
			}
			user.Password = hashedPassword
		}
		if err := tx.Save(&user); err != nil {
			return err
		}
		if err := replaceRelationIDs(tx, "user_roles", "user_id", "role_id", user.ID, request.RoleIDs); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "updated", ResourceType: "user", ResourceID: idString(user.ID), Before: before, After: user})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "user")
	}
	if err != nil {
		return mutationFailure(ctx, "user", err)
	}

	return ctx.Response().Success().Json(contracts.Success(userListItem(user)))
}

func (controller *CoreResourceController) DeleteUser(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "user")
	}

	var user models.User
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.User{}).Where("id", id).First(&user); err != nil {
			return err
		}
		if user.ID == 0 {
			return errNotFound
		}
		if _, err := tx.Delete(&user); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "deleted", ResourceType: "user", ResourceID: idString(user.ID), Before: user})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "user")
	}
	if err != nil {
		return mutationFailure(ctx, "user", err)
	}
	return ctx.Response().NoContent()
}

func (controller *CoreResourceController) CreateRole(ctx contractshttp.Context) contractshttp.Response {
	var request RoleWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validateRoleWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}
	system := false
	if request.IsSystem != nil {
		system = *request.IsSystem
	}
	role := models.Role{Name: strings.TrimSpace(request.Name), DisplayName: strings.TrimSpace(request.DisplayName), Description: request.Description, IsSystem: system}

	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Create(&role); err != nil {
			return err
		}
		if err := replaceRelationIDs(tx, "role_permissions", "role_id", "permission_id", role.ID, request.PermissionIDs); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "created", ResourceType: "role", ResourceID: idString(role.ID), After: role})
	})
	if err != nil {
		return mutationFailure(ctx, "role", err)
	}
	return ctx.Response().Json(contractshttp.StatusCreated, contracts.Success(roleListItem(role)))
}

func (controller *CoreResourceController) UpdateRole(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "role")
	}
	var request RoleWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validateRoleWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}

	var role models.Role
	var before models.Role
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.Role{}).Where("id", id).First(&role); err != nil {
			return err
		}
		if role.ID == 0 {
			return errNotFound
		}
		before = role
		role.Name, role.DisplayName, role.Description = strings.TrimSpace(request.Name), strings.TrimSpace(request.DisplayName), request.Description
		if request.IsSystem != nil {
			role.IsSystem = *request.IsSystem
		}
		if err := tx.Save(&role); err != nil {
			return err
		}
		if err := replaceRelationIDs(tx, "role_permissions", "role_id", "permission_id", role.ID, request.PermissionIDs); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "updated", ResourceType: "role", ResourceID: idString(role.ID), Before: before, After: role})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "role")
	}
	if err != nil {
		return mutationFailure(ctx, "role", err)
	}
	return ctx.Response().Success().Json(contracts.Success(roleListItem(role)))
}

func (controller *CoreResourceController) DeleteRole(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "role")
	}
	var role models.Role
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.Role{}).Where("id", id).First(&role); err != nil {
			return err
		}
		if role.ID == 0 {
			return errNotFound
		}
		if role.IsSystem {
			return errSystemResource
		}
		if _, err := tx.Delete(&role); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "deleted", ResourceType: "role", ResourceID: idString(role.ID), Before: role})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "role")
	}
	if errors.Is(err, errSystemResource) {
		return failureResponse(ctx, contractshttp.StatusConflict, "core.system_resource", "system roles cannot be deleted")
	}
	if err != nil {
		return mutationFailure(ctx, "role", err)
	}
	return ctx.Response().NoContent()
}

func (controller *CoreResourceController) CreatePermission(ctx contractshttp.Context) contractshttp.Response {
	var request PermissionWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validatePermissionWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}
	permission := models.Permission{Code: strings.TrimSpace(request.Code), DisplayName: strings.TrimSpace(request.DisplayName), Description: request.Description, ModuleID: request.ModuleID}
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Create(&permission); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "created", ResourceType: "permission", ResourceID: idString(permission.ID), After: permission})
	})
	if err != nil {
		return mutationFailure(ctx, "permission", err)
	}
	return ctx.Response().Json(contractshttp.StatusCreated, contracts.Success(permissionListItem(permission)))
}

func (controller *CoreResourceController) UpdatePermission(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "permission")
	}
	var request PermissionWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validatePermissionWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}
	var permission models.Permission
	var before models.Permission
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.Permission{}).Where("id", id).First(&permission); err != nil {
			return err
		}
		if permission.ID == 0 {
			return errNotFound
		}
		before = permission
		permission.Code, permission.DisplayName, permission.Description, permission.ModuleID = strings.TrimSpace(request.Code), strings.TrimSpace(request.DisplayName), request.Description, request.ModuleID
		if err := tx.Save(&permission); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "updated", ResourceType: "permission", ResourceID: idString(permission.ID), Before: before, After: permission})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "permission")
	}
	if err != nil {
		return mutationFailure(ctx, "permission", err)
	}
	return ctx.Response().Success().Json(contracts.Success(permissionListItem(permission)))
}

func (controller *CoreResourceController) DeletePermission(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "permission")
	}
	var permission models.Permission
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.Permission{}).Where("id", id).First(&permission); err != nil {
			return err
		}
		if permission.ID == 0 {
			return errNotFound
		}
		if _, err := tx.Delete(&permission); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "deleted", ResourceType: "permission", ResourceID: idString(permission.ID), Before: permission})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "permission")
	}
	if err != nil {
		return mutationFailure(ctx, "permission", err)
	}
	return ctx.Response().NoContent()
}

func (controller *CoreResourceController) CreateMenu(ctx contractshttp.Context) contractshttp.Response {
	var request MenuWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validateMenuWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}
	menu := menuFromRequest(request)
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Create(&menu); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "created", ResourceType: "menu", ResourceID: idString(menu.ID), After: menu})
	})
	if err != nil {
		return mutationFailure(ctx, "menu", err)
	}
	return ctx.Response().Json(contractshttp.StatusCreated, contracts.Success(menuListItem(menu)))
}

func (controller *CoreResourceController) UpdateMenu(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "menu")
	}
	var request MenuWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validateMenuWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}
	var menu models.Menu
	var before models.Menu
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.Menu{}).Where("id", id).First(&menu); err != nil {
			return err
		}
		if menu.ID == 0 {
			return errNotFound
		}
		before = menu
		applyMenuRequest(&menu, request)
		if err := tx.Save(&menu); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "updated", ResourceType: "menu", ResourceID: idString(menu.ID), Before: before, After: menu})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "menu")
	}
	if err != nil {
		return mutationFailure(ctx, "menu", err)
	}
	return ctx.Response().Success().Json(contracts.Success(menuListItem(menu)))
}

func (controller *CoreResourceController) DeleteMenu(ctx contractshttp.Context) contractshttp.Response {
	return controller.deleteSimpleResource(ctx, "menu", &models.Menu{})
}

func (controller *CoreResourceController) CreateSetting(ctx contractshttp.Context) contractshttp.Response {
	var request SettingWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validateSettingWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}
	setting := settingFromRequest(request)
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Create(&setting); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "created", ResourceType: "setting", ResourceID: idString(setting.ID), After: setting})
	})
	if err != nil {
		return mutationFailure(ctx, "setting", err)
	}
	return ctx.Response().Json(contractshttp.StatusCreated, contracts.Success(settingListItem(setting)))
}

func (controller *CoreResourceController) UpdateSetting(ctx contractshttp.Context) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, "setting")
	}
	var request SettingWriteRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "validation.failed", "request body is invalid")
	}
	if fieldErrors := validateSettingWriteRequest(request); len(fieldErrors) > 0 {
		return validationFailure(ctx, fieldErrors)
	}
	var setting models.Setting
	var before models.Setting
	err := transaction(ctx, func(tx contractsorm.Query) error {
		if err := tx.Model(&models.Setting{}).Where("id", id).First(&setting); err != nil {
			return err
		}
		if setting.ID == 0 {
			return errNotFound
		}
		before = setting
		setting.Key, setting.Value, setting.Type = strings.TrimSpace(request.Key), request.Value, request.Type
		if request.IsPublic != nil {
			setting.IsPublic = *request.IsPublic
		}
		if err := tx.Save(&setting); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "updated", ResourceType: "setting", ResourceID: idString(setting.ID), Before: before, After: setting})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, "setting")
	}
	if err != nil {
		return mutationFailure(ctx, "setting", err)
	}
	return ctx.Response().Success().Json(contracts.Success(settingListItem(setting)))
}

func (controller *CoreResourceController) DeleteSetting(ctx contractshttp.Context) contractshttp.Response {
	return controller.deleteSimpleResource(ctx, "setting", &models.Setting{})
}

func (controller *CoreResourceController) deleteSimpleResource(ctx contractshttp.Context, resource string, model any) contractshttp.Response {
	id, ok := parseResourceID(ctx.Request().Route("id"))
	if !ok {
		return notFoundFailure(ctx, resource)
	}
	var before any
	err := transaction(ctx, func(tx contractsorm.Query) error {
		query := tx.Model(model).Where("id", id)
		if err := query.First(model); err != nil {
			return err
		}
		if modelID(model) == 0 {
			return errNotFound
		}
		before = model
		if _, err := tx.Delete(model); err != nil {
			return err
		}
		return audit.Write(ctx, tx, audit.Event{Action: "deleted", ResourceType: resource, ResourceID: idString(id), Before: before})
	})
	if errors.Is(err, errNotFound) {
		return notFoundFailure(ctx, resource)
	}
	if err != nil {
		return mutationFailure(ctx, resource, err)
	}
	return ctx.Response().NoContent()
}

func transaction(ctx contractshttp.Context, callback func(contractsorm.Query) error) error {
	return facades.Orm().WithContext(ctx).Transaction(callback)
}

func replaceRelationIDs(query contractsorm.Query, table, ownerColumn, relatedColumn string, ownerID uint, relatedIDs []uint) error {
	if _, err := query.Table(table).Where(ownerColumn, ownerID).Delete(); err != nil {
		return err
	}
	now := time.Now().UTC()
	seen := map[uint]struct{}{}
	for _, relatedID := range relatedIDs {
		if relatedID == 0 {
			continue
		}
		if _, exists := seen[relatedID]; exists {
			continue
		}
		seen[relatedID] = struct{}{}
		if err := query.Table(table).Create(map[string]any{ownerColumn: ownerID, relatedColumn: relatedID, "created_at": now, "updated_at": now}); err != nil {
			return err
		}
	}
	return nil
}

var (
	errNotFound       = errors.New("core resource not found")
	errSystemResource = errors.New("core system resource")
)

func mutationFailure(ctx contractshttp.Context, resource string, err error) contractshttp.Response {
	return failureResponse(ctx, contractshttp.StatusInternalServerError, "core.resource_write_failed", "unable to write "+resource)
}

func notFoundFailure(ctx contractshttp.Context, resource string) contractshttp.Response {
	return failureResponse(ctx, contractshttp.StatusNotFound, "core.resource_not_found", resource+" not found")
}

func validationFailure(ctx contractshttp.Context, fieldErrors map[string][]string) contractshttp.Response {
	return ctx.Response().Json(contractshttp.StatusUnprocessableEntity, contracts.APIErrorResponse{Error: contracts.APIError{Code: "validation.failed", Message: "request validation failed", Fields: fieldErrors}})
}
