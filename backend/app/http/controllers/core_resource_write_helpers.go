package controllers

import (
	"strconv"

	"github.com/polibee/go-reactrouter/backend/app/models"
)

func idString(id uint) string {
	return strconv.FormatUint(uint64(id), 10)
}

func userListItem(user models.User) UserListItem {
	return UserListItem{ID: idString(user.ID), Name: user.Name, Email: user.Email, Status: user.Status, IsActive: user.IsActive, LastLoginAt: user.LastLoginAt}
}

func roleListItem(role models.Role) RoleListItem {
	return RoleListItem{ID: idString(role.ID), Name: role.Name, DisplayName: role.DisplayName, Description: role.Description, IsSystem: role.IsSystem}
}

func permissionListItem(permission models.Permission) PermissionListItem {
	return PermissionListItem{ID: idString(permission.ID), Code: permission.Code, DisplayName: permission.DisplayName, Description: permission.Description, ModuleID: permission.ModuleID}
}

func menuListItem(menu models.Menu) MenuListItem {
	return MenuListItem{ID: idString(menu.ID), Key: menu.Key, Label: menu.Label, Path: menu.Path, Icon: menu.Icon, Permission: menu.Permission, ParentID: uintPointerToString(menu.ParentID), Sort: menu.Sort, IsVisible: menu.IsVisible, Meta: menu.Meta}
}

func settingListItem(setting models.Setting) SettingListItem {
	return SettingListItem{ID: idString(setting.ID), Key: setting.Key, Value: setting.Value, Type: setting.Type, IsPublic: setting.IsPublic}
}

func menuFromRequest(request MenuWriteRequest) models.Menu {
	menu := models.Menu{}
	applyMenuRequest(&menu, request)
	return menu
}

func applyMenuRequest(menu *models.Menu, request MenuWriteRequest) {
	menu.Key, menu.Label = request.Key, request.Label
	menu.Path, menu.Icon, menu.Permission, menu.ParentID, menu.Meta = request.Path, request.Icon, request.Permission, request.ParentID, request.Meta
	if request.Sort != nil {
		menu.Sort = *request.Sort
	}
	if request.IsVisible != nil {
		menu.IsVisible = *request.IsVisible
	} else if menu.ID == 0 {
		menu.IsVisible = true
	}
}

func settingFromRequest(request SettingWriteRequest) models.Setting {
	typeName := request.Type
	if typeName == "" {
		typeName = "string"
	}
	public := false
	if request.IsPublic != nil {
		public = *request.IsPublic
	}
	return models.Setting{Key: request.Key, Value: request.Value, Type: typeName, IsPublic: public}
}

func modelID(model any) uint {
	switch value := model.(type) {
	case *models.Menu:
		return value.ID
	case *models.Setting:
		return value.ID
	default:
		return 0
	}
}
