package middleware

import (
	"strconv"

	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/internal/authz"
)

// DatabaseUserResolver turns the authenticated Goravel user into the small
// authorization view consumed by RequirePermission. It deliberately loads
// only roles and permissions, keeping policy checks independent of ORM types.
type DatabaseUserResolver struct{}

func NewDatabaseUserResolver() UserResolver {
	return &DatabaseUserResolver{}
}

func (resolver *DatabaseUserResolver) Resolve(ctx contractshttp.Context) (*authz.User, error) {
	var user models.User
	if err := facades.Auth(ctx).User(&user); err != nil {
		return nil, err
	}
	if err := facades.Orm().WithContext(ctx).Query().Load(&user, "Roles.Permissions"); err != nil {
		return nil, err
	}

	return authorizationUserFromModel(user), nil
}

func authorizationUserFromModel(user models.User) *authz.User {
	authorized := &authz.User{ID: strconv.FormatUint(uint64(user.ID), 10)}
	for _, modelRole := range user.Roles {
		permissions := make([]string, 0, len(modelRole.Permissions))
		for _, permission := range modelRole.Permissions {
			permissions = append(permissions, permission.Code)
		}

		authorized.Roles = append(authorized.Roles, authz.Role{
			ID:          strconv.FormatUint(uint64(modelRole.ID), 10),
			Name:        modelRole.Name,
			Permissions: authz.NewPermissionSet(permissions...),
		})
	}

	return authorized
}
