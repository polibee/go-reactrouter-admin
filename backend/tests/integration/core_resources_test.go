package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"testing"

	"github.com/stretchr/testify/suite"

	contractshttp "github.com/goravel/framework/contracts/testing/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/internal/authn"
	"github.com/polibee/go-reactrouter/backend/tests"
)

// CoreResourcesTestSuite is intentionally opt-in. It must run against a
// dedicated database because RefreshDatabase drops and recreates application
// tables before exercising the HTTP contract on the selected driver.
type CoreResourcesTestSuite struct {
	suite.Suite
	tests.TestCase
}

func TestCoreResourcesTestSuite(t *testing.T) {
	suite.Run(t, new(CoreResourcesTestSuite))
}

func (s *CoreResourcesTestSuite) SetupSuite() {
	if os.Getenv("DB_INTEGRATION") != "1" {
		s.T().Skip("set DB_INTEGRATION=1 to run the real MySQL/PostgreSQL integration suite")
	}

	s.RefreshDatabase()
	s.seedAdministrator()
}

func (s *CoreResourcesTestSuite) seedAdministrator() {
	permissionCodes := []string{
		"users.view", "users.create", "users.update", "users.delete",
		"roles.view", "roles.create", "roles.update", "roles.delete",
		"permissions.view", "permissions.create", "permissions.update", "permissions.delete",
		"menus.view", "menus.create", "menus.update", "menus.delete",
		"settings.view", "settings.create", "settings.update", "settings.delete",
		"plugins.view", "plugins.validate", "plugins.manage",
		"audit.view",
	}
	permissions := make([]models.Permission, 0, len(permissionCodes))
	for _, code := range permissionCodes {
		permission := models.Permission{Code: code, DisplayName: code}
		s.Require().NoError(facades.Orm().Query().Create(&permission))
		permissions = append(permissions, permission)
	}

	role := models.Role{Name: "integration-admin", DisplayName: "Integration administrator", IsSystem: true}
	s.Require().NoError(facades.Orm().Query().Create(&role))
	for _, permission := range permissions {
		s.Require().NoError(facades.Orm().Query().Table("role_permissions").Create(map[string]any{
			"role_id":       role.ID,
			"permission_id": permission.ID,
		}))
	}

	password, err := facades.Hash().Make("integration-password")
	s.Require().NoError(err)
	user := models.User{Name: "Integration Administrator", Email: "integration@example.test", Password: password, Status: "active", IsActive: true}
	s.Require().NoError(facades.Orm().Query().Create(&user))
	s.Require().NoError(facades.Orm().Query().Table("user_roles").Create(map[string]any{
		"user_id": user.ID,
		"role_id": role.ID,
	}))
}

func (s *CoreResourcesTestSuite) login() contractshttp.Request {
	response, err := s.Http(s.T()).Post("/api/v1/auth/login", bytes.NewReader(jsonBytes(map[string]any{
		"email":    "integration@example.test",
		"password": "integration-password",
	})))
	s.Require().NoError(err)
	response.AssertOk()
	cookie := response.Cookie(authn.AccessTokenCookieName)
	s.Require().NotNil(cookie)
	return s.Http(s.T()).WithCookie(cookie)
}

func (s *CoreResourcesTestSuite) TestCoreResourceLifecycleAndAudit() {
	request := s.login()

	currentVersion := "1.0.0"
	plugin := models.Plugin{PluginID: "integration.plugin", Name: "integration", DisplayName: "Integration plugin", State: "installed", CurrentVersion: &currentVersion, HealthStatus: "unknown"}
	s.Require().NoError(facades.Orm().Query().Create(&plugin))
	s.Require().NoError(facades.Orm().Query().Create(&models.PluginVersion{
		PluginID: plugin.ID, Version: currentVersion, PackageHash: "sha256:integration", InstallRoot: "/tmp/integration-plugin",
		ManifestJSON: "{}", Dependencies: "[]", State: "installed", HealthStatus: "unknown",
	}))
	pluginList, err := request.Get("/api/v1/admin/plugins")
	s.Require().NoError(err)
	pluginList.AssertOk()
	pluginVersions, err := request.Get("/api/v1/admin/plugins/integration.plugin/versions")
	s.Require().NoError(err)
	pluginVersions.AssertOk()
	pluginLogs, err := request.Get("/api/v1/admin/plugins/integration.plugin/logs")
	s.Require().NoError(err)
	pluginLogs.AssertOk()
	missingConfirmation, err := request.Post("/api/v1/admin/plugins/integration.plugin/uninstall", bytes.NewReader(jsonBytes(map[string]any{
		"confirm": false,
	})))
	s.Require().NoError(err)
	missingConfirmation.AssertUnprocessableEntity()

	permissionResponse, err := request.Post("/api/v1/admin/permissions", bytes.NewReader(jsonBytes(map[string]any{
		"code":         "integration.read",
		"display_name": "Integration read",
	})))
	s.Require().NoError(err)
	permissionResponse.AssertCreated()
	permissionID := responseID(s.T(), permissionResponse)
	permissionDetail, err := request.Get("/api/v1/admin/permissions/" + permissionID)
	s.Require().NoError(err)
	s.Require().True(permissionDetail.IsSuccessful(), "permission detail should return 2xx")

	updatedPermission, err := request.Put("/api/v1/admin/permissions/"+permissionID, bytes.NewReader(jsonBytes(map[string]any{
		"code":         "integration.read.updated",
		"display_name": "Integration read updated",
	})))
	s.Require().NoError(err)
	updatedPermission.AssertOk()

	roleResponse, err := request.Post("/api/v1/admin/roles", bytes.NewReader(jsonBytes(map[string]any{
		"name":           "integration-editor",
		"display_name":   "Integration editor",
		"permission_ids": []uint{mustUint(permissionID)},
	})))
	s.Require().NoError(err)
	roleResponse.AssertCreated()
	roleID := responseID(s.T(), roleResponse)
	roleDetail, err := request.Get("/api/v1/admin/roles/" + roleID)
	s.Require().NoError(err)
	s.Require().True(roleDetail.IsSuccessful(), "role detail should return 2xx")

	updatedRole, err := request.Put("/api/v1/admin/roles/"+roleID, bytes.NewReader(jsonBytes(map[string]any{
		"name":         "integration-editor-updated",
		"display_name": "Integration editor updated",
	})))
	s.Require().NoError(err)
	updatedRole.AssertOk()

	userResponse, err := request.Post("/api/v1/admin/users", bytes.NewReader(jsonBytes(map[string]any{
		"name":     "Managed User",
		"email":    "managed-user@example.test",
		"password": "managed-password",
		"role_ids": []uint{mustUint(roleID)},
	})))
	s.Require().NoError(err)
	userResponse.AssertCreated()
	userID := responseID(s.T(), userResponse)
	userDetail, err := request.Get("/api/v1/admin/users/" + userID)
	s.Require().NoError(err)
	s.Require().True(userDetail.IsSuccessful(), "user detail should return 2xx")

	updatedUser, err := request.Put("/api/v1/admin/users/"+userID, bytes.NewReader(jsonBytes(map[string]any{
		"name":     "Managed User Updated",
		"email":    "managed-user@example.test",
		"status":   "disabled",
		"role_ids": []uint{mustUint(roleID)},
	})))
	s.Require().NoError(err)
	updatedUser.AssertOk()

	menuResponse, err := request.Post("/api/v1/admin/menus", bytes.NewReader(jsonBytes(map[string]any{
		"key":   "integration.menu",
		"label": "Integration menu",
		"path":  "/integration",
	})))
	s.Require().NoError(err)
	menuResponse.AssertCreated()
	menuID := responseID(s.T(), menuResponse)
	menuDetail, err := request.Get("/api/v1/admin/menus/" + menuID)
	s.Require().NoError(err)
	s.Require().True(menuDetail.IsSuccessful(), "menu detail should return 2xx")

	updatedMenu, err := request.Put("/api/v1/admin/menus/"+menuID, bytes.NewReader(jsonBytes(map[string]any{
		"key":        "integration.menu.updated",
		"label":      "Integration menu updated",
		"is_visible": false,
	})))
	s.Require().NoError(err)
	updatedMenu.AssertOk()
	menuList, err := request.Get("/api/v1/admin/menus?search=integration.menu.updated")
	s.Require().NoError(err)
	menuList.AssertOk()
	var menuListBody struct {
		Data []map[string]any `json:"data"`
	}
	s.Require().NoError(menuList.Bind(&menuListBody))
	s.Empty(menuListBody.Data, "invisible menus must not be returned by the server")

	settingResponse, err := request.Post("/api/v1/admin/settings", bytes.NewReader(jsonBytes(map[string]any{
		"key":   "integration.setting",
		"value": "one",
	})))
	s.Require().NoError(err)
	settingResponse.AssertCreated()
	settingID := responseID(s.T(), settingResponse)
	settingDetail, err := request.Get("/api/v1/admin/settings/" + settingID)
	s.Require().NoError(err)
	s.Require().True(settingDetail.IsSuccessful(), "setting detail should return 2xx")

	updatedSetting, err := request.Put("/api/v1/admin/settings/"+settingID, bytes.NewReader(jsonBytes(map[string]any{
		"key":   "integration.setting.updated",
		"value": "two",
	})))
	s.Require().NoError(err)
	updatedSetting.AssertOk()

	for _, resource := range []struct {
		name string
		id   string
	}{
		{name: "user", id: userID},
		{name: "role", id: roleID},
		{name: "permission", id: permissionID},
		{name: "menu", id: menuID},
		{name: "setting", id: settingID},
	} {
		path := "/api/v1/admin/" + resource.name + "s/" + resource.id
		if resource.name == "permission" {
			path = "/api/v1/admin/permissions/" + resource.id
		}
		deleteResponse, deleteErr := request.Delete(path, nil)
		s.Require().NoError(deleteErr)
		deleteResponse.AssertNoContent()

		count, countErr := facades.Orm().Query().Model(&models.AuditLog{}).
			Where("resource_type", resource.name).
			Where("resource_id", resource.id).
			Count()
		s.Require().NoError(countErr)
		s.GreaterOrEqual(count, int64(3), "%s should have create, update, and delete audit entries", resource.name)
	}
}

func jsonBytes(value any) []byte {
	encoded, err := json.Marshal(value)
	if err != nil {
		panic(err)
	}
	return encoded
}

func responseID(t *testing.T, response contractshttp.Response) string {
	var body struct {
		Data map[string]any `json:"data"`
	}
	if err := response.Bind(&body); err != nil {
		t.Fatal(err)
	}
	value, ok := body.Data["id"].(string)
	if !ok || value == "" {
		t.Fatalf("response does not contain a string data.id: %#v", body.Data)
	}
	return value
}

func mustUint(value string) uint {
	parsed, err := strconv.ParseUint(value, 10, 32)
	if err != nil {
		panic(fmt.Sprintf("invalid resource id %q: %v", value, err))
	}
	return uint(parsed)
}
