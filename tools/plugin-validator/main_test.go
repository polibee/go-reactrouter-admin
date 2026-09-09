package main

import "testing"

func TestParseTrustKeyRequiresKeyIDAndEd25519PublicKey(t *testing.T) {
	if _, err := parseTrustKey("missing-separator"); err == nil {
		t.Fatal("parseTrustKey() error = nil for malformed key")
	}
	if _, err := parseTrustKey("test-key:not-base64"); err == nil {
		t.Fatal("parseTrustKey() error = nil for malformed base64")
	}
}
