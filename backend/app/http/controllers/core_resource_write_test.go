package controllers

import "testing"

func TestValidateUserWriteRequestRequiresCredentialsOnCreate(t *testing.T) {
	errors := validateUserWriteRequest(UserWriteRequest{}, true)

	if len(errors["name"]) == 0 || len(errors["email"]) == 0 || len(errors["password"]) == 0 {
		t.Fatalf("expected required user fields, got %+v", errors)
	}
}

func TestValidateUserWriteRequestAllowsPasswordOmissionOnUpdate(t *testing.T) {
	errors := validateUserWriteRequest(UserWriteRequest{
		Name:   "Admin",
		Email:  "admin@example.com",
		Status: "active",
	}, false)

	if len(errors) != 0 {
		t.Fatalf("expected valid update request, got %+v", errors)
	}
}

func TestParseResourceIDRejectsNonPositiveIDs(t *testing.T) {
	for _, input := range []string{"", "0", "-1", "abc"} {
		if _, ok := parseResourceID(input); ok {
			t.Fatalf("parseResourceID(%q) should fail", input)
		}
	}

	if id, ok := parseResourceID("12"); !ok || id != 12 {
		t.Fatalf("parseResourceID(12) = %d, %t", id, ok)
	}
}
