// Package authn contains transport-independent authentication helpers.
package authn

import "strings"

// AccessTokenCookieName is the HttpOnly cookie used by Core JWT authentication.
const AccessTokenCookieName = "go_reactrouter_access_token"

// ExtractToken returns a bearer token from the Authorization header, falling
// back to the Core HttpOnly cookie when no Authorization header is supplied.
// A malformed non-empty header is rejected instead of silently using a second
// credential source.
func ExtractToken(authorization, cookie string) (string, bool) {
	authorization = strings.TrimSpace(authorization)
	if authorization == "" {
		cookie = strings.TrimSpace(cookie)
		return cookie, cookie != ""
	}

	parts := strings.Fields(authorization)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || parts[1] == "" {
		return "", false
	}

	return parts[1], true
}
