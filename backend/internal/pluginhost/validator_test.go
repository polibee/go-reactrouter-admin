package pluginhost

import (
	"archive/zip"
	"bytes"
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"sort"
	"testing"
)

func TestValidatePackageAcceptsSignedPackageAndExtractsWithoutExecutableBits(t *testing.T) {
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	archivePath := writePluginArchive(t, privateKey, map[string]any{}, map[string][]byte{
		"backend/plugin":    []byte("backend"),
		"frontend/entry.js": []byte("export default {}"),
		"permissions.json":  []byte("[]"),
		"menus.json":        []byte("[]"),
		"openapi.json":      []byte("{}"),
	})

	validated, err := ValidatePackage(archivePath, Platform{
		CoreVersion: "1.4.0",
		OS:          "linux",
		Arch:        "amd64",
		TrustStore:  map[string]ed25519.PublicKey{"test-key": publicKey},
	})
	if err != nil {
		t.Fatalf("ValidatePackage() error = %v", err)
	}
	t.Cleanup(func() { _ = os.RemoveAll(validated.Root) })
	if validated.Manifest.ID != "acme.billing" {
		t.Fatalf("manifest id = %q", validated.Manifest.ID)
	}
	if validated.Hash == "" {
		t.Fatal("package hash is empty")
	}
	entryInfo, err := os.Stat(filepath.Join(validated.Root, "backend/plugin"))
	if err != nil {
		t.Fatal(err)
	}
	if entryInfo.Mode().Perm()&0o111 != 0 {
		t.Fatalf("extracted entry has executable permissions: %v", entryInfo.Mode().Perm())
	}
}

func TestValidatePackageRejectsMissingManifest(t *testing.T) {
	archivePath := writeRawArchive(t, map[string][]byte{"README.md": []byte("missing")})
	assertValidationCode(t, archivePath, Platform{}, CodeManifestMissing)
}

func TestValidatePackageRejectsInvalidManifestJSON(t *testing.T) {
	archivePath := writeRawArchive(t, map[string][]byte{"plugin.json": []byte("{")})
	assertValidationCode(t, archivePath, Platform{}, CodeManifestInvalid)
}

func TestValidatePackageRejectsPathTraversalBeforeExtraction(t *testing.T) {
	archivePath := writeRawArchive(t, map[string][]byte{"../escape.txt": []byte("escape")})
	assertValidationCode(t, archivePath, Platform{}, CodePathTraversal)
}

func TestValidatePackageRejectsUnsupportedPlatform(t *testing.T) {
	archivePath := writePluginArchive(t, nil, map[string]any{
		"platforms": []string{"windows/amd64"},
	}, pluginFiles())
	assertValidationCode(t, archivePath, Platform{OS: "linux", Arch: "amd64", AllowUnsigned: true}, CodeUnsupportedPlatform)
}

func TestValidatePackageRejectsInvalidSignature(t *testing.T) {
	_, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	archivePath := writePluginArchive(t, privateKey, map[string]any{}, pluginFiles())
	assertValidationCode(t, archivePath, Platform{
		CoreVersion: "1.4.0",
		OS:          "linux",
		Arch:        "amd64",
		TrustStore:  map[string]ed25519.PublicKey{"test-key": bytes.Repeat([]byte{1}, ed25519.PublicKeySize)},
	}, CodeSignatureInvalid)
}

func TestValidatePackageRejectsIncompatibleCoreVersion(t *testing.T) {
	archivePath := writePluginArchive(t, nil, map[string]any{"coreRequires": ">=2.0.0"}, pluginFiles())
	assertValidationCode(t, archivePath, Platform{CoreVersion: "1.4.0", AllowUnsigned: true}, CodeCoreIncompatible)
}

func TestValidatePackageRejectsMissingDependency(t *testing.T) {
	archivePath := writePluginArchive(t, nil, map[string]any{
		"dependencies": []map[string]string{{"id": "acme.identity", "version": ">=1.0.0"}},
	}, pluginFiles())
	assertValidationCode(t, archivePath, Platform{CoreVersion: "1.4.0", AllowUnsigned: true}, CodeDependencyMissing)
}

func TestValidatePackageRejectsOversizedArchive(t *testing.T) {
	archivePath := writePluginArchive(t, nil, map[string]any{}, map[string][]byte{
		"payload.bin": bytes.Repeat([]byte("x"), 128),
	})
	assertValidationCode(t, archivePath, Platform{AllowUnsigned: true, MaxFileBytes: 32}, CodeFileTooLarge)
}

func assertValidationCode(t *testing.T, archivePath string, platform Platform, want string) {
	t.Helper()
	_, err := ValidatePackage(archivePath, platform)
	if err == nil {
		t.Fatalf("ValidatePackage() error = nil, want %s", want)
	}
	if got := ErrorCode(err); got != want {
		t.Fatalf("ErrorCode() = %q, want %q (error: %v)", got, want, err)
	}
}

func pluginFiles() map[string][]byte {
	return map[string][]byte{
		"backend/plugin":    []byte("backend"),
		"frontend/entry.js": []byte("export default {}"),
		"permissions.json":  []byte("[]"),
		"menus.json":        []byte("[]"),
		"openapi.json":      []byte("{}"),
	}
}

func writePluginArchive(t *testing.T, privateKey ed25519.PrivateKey, overrides map[string]any, files map[string][]byte) string {
	t.Helper()
	manifest := map[string]any{
		"id": "acme.billing", "name": "billing", "displayName": "Billing", "version": "1.2.3",
		"apiVersion": "1", "coreRequires": ">=1.0.0", "backend": map[string]string{
			"entrypoint": "backend/plugin", "healthPath": "/health", "apiPrefix": "/api/plugins/acme.billing",
		}, "frontend": map[string]string{"entrypoint": "frontend/entry.js"},
		"permissions": "permissions.json", "menus": "menus.json", "openapi": "openapi.json",
	}
	for key, value := range overrides {
		manifest[key] = value
	}
	if privateKey != nil {
		manifest["signature"] = "test-key:" + base64.RawStdEncoding.EncodeToString(signManifestAndFiles(t, privateKey, manifest, files))
	}
	manifestBytes, err := json.Marshal(manifest)
	if err != nil {
		t.Fatal(err)
	}
	files["plugin.json"] = manifestBytes
	return writeRawArchive(t, files)
}

func signManifestAndFiles(t *testing.T, privateKey ed25519.PrivateKey, manifest map[string]any, files map[string][]byte) []byte {
	t.Helper()
	unsigned := make(map[string]any, len(manifest)+1)
	for key, value := range manifest {
		unsigned[key] = value
	}
	unsigned["signature"] = ""
	manifestBytes, err := json.Marshal(unsigned)
	if err != nil {
		t.Fatal(err)
	}
	entries := make(map[string][]byte, len(files)+1)
	for name, contents := range files {
		entries[name] = contents
	}
	entries["plugin.json"] = manifestBytes
	digest := packageDigest(entries)
	return ed25519.Sign(privateKey, digest[:])
}

func writeRawArchive(t *testing.T, files map[string][]byte) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "plugin.zip")
	file, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	writer := zip.NewWriter(file)
	names := make([]string, 0, len(files))
	for name := range files {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		entry, err := writer.Create(name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := entry.Write(files[name]); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	if err := file.Close(); err != nil {
		t.Fatal(err)
	}
	return path
}

func packageDigest(entries map[string][]byte) [32]byte {
	names := make([]string, 0, len(entries))
	for name := range entries {
		names = append(names, name)
	}
	sort.Strings(names)
	var payload bytes.Buffer
	for _, name := range names {
		_, _ = io.WriteString(&payload, name)
		_ = payload.WriteByte(0)
		_, _ = payload.Write(entries[name])
		_ = payload.WriteByte(0)
	}
	return sha256.Sum256(payload.Bytes())
}
