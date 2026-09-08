package authn

import "testing"

func TestExtractTokenAcceptsBearerHeader(t *testing.T) {
	token, ok := ExtractToken("Bearer jwt-token", "cookie-token")
	if !ok || token != "jwt-token" {
		t.Fatalf("ExtractToken() = %q, %v; want jwt-token, true", token, ok)
	}
}

func TestExtractTokenFallsBackToHttpOnlyCookie(t *testing.T) {
	token, ok := ExtractToken("", "cookie-token")
	if !ok || token != "cookie-token" {
		t.Fatalf("ExtractToken() = %q, %v; want cookie-token, true", token, ok)
	}
}

func TestExtractTokenRejectsMalformedBearerHeaderAndEmptyValues(t *testing.T) {
	for _, header := range []string{"", "Basic abc", "Bearer", "Bearer   ", "Bearer one two"} {
		if token, ok := ExtractToken(header, ""); ok || token != "" {
			t.Errorf("ExtractToken(%q, empty cookie) = %q, %v; want empty, false", header, token, ok)
		}
	}
}
