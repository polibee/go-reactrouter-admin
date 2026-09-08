package controllers

import (
	"errors"

	"gorm.io/gorm"

	contractshttp "github.com/goravel/framework/contracts/http"

	"github.com/polibee/go-reactrouter/backend/app/facades"
	"github.com/polibee/go-reactrouter/backend/app/models"
	"github.com/polibee/go-reactrouter/backend/internal/authn"
	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

// AuthController exposes the Core authentication boundary. JWTs are stored in
// an HttpOnly cookie so browser code does not need to handle bearer secrets.
type AuthController struct{}

func NewAuthController() *AuthController { return &AuthController{} }

// Login validates credentials, issues a JWT cookie, and returns the current
// authorization view.
func (controller *AuthController) Login(ctx contractshttp.Context) contractshttp.Response {
	var request LoginRequest
	if err := ctx.Request().Bind(&request); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnprocessableEntity, "auth.invalid_request", "request body is invalid")
	}

	request = normalizeLoginRequest(request)
	if fieldErrors := validateLoginRequest(request); len(fieldErrors) > 0 {
		return ctx.Response().Json(contractshttp.StatusUnprocessableEntity, contracts.APIErrorResponse{
			Error: contracts.APIError{
				Code:    "validation.failed",
				Message: "request validation failed",
				Fields:  fieldErrors,
			},
		})
	}

	var user models.User
	query := facades.Orm().WithContext(ctx).Query().Where("email", request.Email).Where("is_active", true)
	if err := query.First(&user); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return failureResponse(ctx, contractshttp.StatusUnauthorized, "auth.invalid_credentials", "email or password is invalid")
		}
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "auth.user_lookup_failed", "unable to load the user")
	}

	if !facades.Hash().Check(request.Password, user.Password) {
		return failureResponse(ctx, contractshttp.StatusUnauthorized, "auth.invalid_credentials", "email or password is invalid")
	}

	if err := loadAuthorizationRelations(ctx, &user); err != nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "auth.authorization_load_failed", "unable to load user permissions")
	}

	token, err := facades.Auth(ctx).Login(&user)
	if err != nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "auth.token_issue_failed", "unable to issue an authentication token")
	}

	response := ctx.Response()
	response.Cookie(contractshttp.Cookie{
		Name:     authn.AccessTokenCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: "Lax",
	})
	return response.Success().Json(contracts.Success(buildAuthUser(user)))
}

// Me returns the authenticated user and server-derived permissions.
func (controller *AuthController) Me(ctx contractshttp.Context) contractshttp.Response {
	var user models.User
	if err := facades.Auth(ctx).User(&user); err != nil {
		return failureResponse(ctx, contractshttp.StatusUnauthorized, "auth.unauthenticated", "authentication is required")
	}
	if err := loadAuthorizationRelations(ctx, &user); err != nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "auth.authorization_load_failed", "unable to load user permissions")
	}

	return ctx.Response().Success().Json(contracts.Success(buildAuthUser(user)))
}

// Logout invalidates the current JWT and clears the browser cookie.
func (controller *AuthController) Logout(ctx contractshttp.Context) contractshttp.Response {
	if err := facades.Auth(ctx).Logout(); err != nil {
		return failureResponse(ctx, contractshttp.StatusInternalServerError, "auth.logout_failed", "unable to log out")
	}

	response := ctx.Response()
	response.WithoutCookie(authn.AccessTokenCookieName)
	return response.NoContent()
}

func loadAuthorizationRelations(ctx contractshttp.Context, user *models.User) error {
	return facades.Orm().WithContext(ctx).Query().Load(user, "Roles.Permissions")
}

func failureResponse(ctx contractshttp.Context, status int, code, message string) contractshttp.Response {
	return ctx.Response().Json(status, contracts.Failure(code, message))
}
