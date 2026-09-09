package pluginhost

import (
	"archive/zip"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/Masterminds/semver/v3"

	"github.com/polibee/go-reactrouter/backend/internal/contracts"
)

const (
	CodeArchiveInvalid         = "plugin.archive_invalid"
	CodeArchiveTooLarge        = "plugin.archive_too_large"
	CodeFileTooLarge           = "plugin.file_too_large"
	CodeTooManyFiles           = "plugin.too_many_files"
	CodePathTraversal          = "plugin.path_traversal"
	CodeSymlinkForbidden       = "plugin.symlink_forbidden"
	CodeManifestMissing        = "plugin.manifest_missing"
	CodeManifestInvalid        = "plugin.manifest_invalid"
	CodeUnsupportedPlatform    = "plugin.unsupported_platform"
	CodeCoreIncompatible       = "plugin.core_incompatible"
	CodeDependencyMissing      = "plugin.dependency_missing"
	CodeDependencyIncompatible = "plugin.dependency_incompatible"
	CodeSignatureRequired      = "plugin.signature_required"
	CodeSignatureInvalid       = "plugin.signature_invalid"
	CodeSignatureUnknownKey    = "plugin.signature_unknown_key"
	CodePackageReadFailed      = "plugin.package_read_failed"
	CodeReferencedFileMissing  = "plugin.referenced_file_missing"
)

type ValidationError struct {
	Code string
	Err  error
}

func (e *ValidationError) Error() string {
	if e.Err == nil {
		return e.Code
	}
	return fmt.Sprintf("%s: %v", e.Code, e.Err)
}

func (e *ValidationError) Unwrap() error { return e.Err }

func ErrorCode(err error) string {
	var validationError *ValidationError
	if errors.As(err, &validationError) {
		return validationError.Code
	}
	return CodePackageReadFailed
}

type Platform struct {
	CoreVersion          string
	OS                   string
	Arch                 string
	InstalledPlugins     map[string]string
	TrustStore           map[string]ed25519.PublicKey
	AllowUnsigned        bool
	MaxArchiveBytes      int64
	MaxFileBytes         uint64
	MaxFiles             int
	MaxUncompressedBytes uint64
}

type ValidatedPlugin struct {
	Manifest       contracts.PluginManifest
	Hash           string
	Root           string
	SignatureKeyID string
}

func ValidatePackage(packagePath string, platform Platform) (ValidatedPlugin, error) {
	archiveInfo, err := os.Lstat(packagePath)
	if err != nil {
		return ValidatedPlugin{}, &ValidationError{Code: CodePackageReadFailed, Err: err}
	}
	if archiveInfo.Mode()&os.ModeSymlink != 0 {
		return ValidatedPlugin{}, &ValidationError{Code: CodeSymlinkForbidden, Err: errors.New("package path cannot be a symlink")}
	}
	if !archiveInfo.Mode().IsRegular() {
		return ValidatedPlugin{}, &ValidationError{Code: CodePackageReadFailed, Err: errors.New("package is not a regular file")}
	}
	if platform.MaxArchiveBytes <= 0 {
		platform.MaxArchiveBytes = 64 << 20
	}
	if archiveInfo.Size() > platform.MaxArchiveBytes {
		return ValidatedPlugin{}, &ValidationError{Code: CodeArchiveTooLarge, Err: fmt.Errorf("size %d exceeds %d", archiveInfo.Size(), platform.MaxArchiveBytes)}
	}

	archiveBytes, err := os.ReadFile(packagePath)
	if err != nil {
		return ValidatedPlugin{}, &ValidationError{Code: CodePackageReadFailed, Err: err}
	}
	archiveHash := sha256.Sum256(archiveBytes)
	entries, err := readArchive(packagePath, platform)
	if err != nil {
		return ValidatedPlugin{}, err
	}
	manifestBytes, ok := entries["plugin.json"]
	if !ok {
		return ValidatedPlugin{}, &ValidationError{Code: CodeManifestMissing, Err: errors.New("plugin.json must be at archive root")}
	}

	var manifest contracts.PluginManifest
	decoder := json.NewDecoder(strings.NewReader(string(manifestBytes)))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&manifest); err != nil {
		return ValidatedPlugin{}, &ValidationError{Code: CodeManifestInvalid, Err: err}
	}
	if err := contracts.ValidateManifest(manifest); err != nil {
		return ValidatedPlugin{}, &ValidationError{Code: CodeManifestInvalid, Err: err}
	}
	if err := validatePlatform(manifest, platform); err != nil {
		return ValidatedPlugin{}, err
	}
	if err := validateCoreAndDependencies(manifest, platform); err != nil {
		return ValidatedPlugin{}, err
	}
	if err := validateReferencedFiles(manifest, entries); err != nil {
		return ValidatedPlugin{}, err
	}
	keyID, err := verifySignature(manifest, entries, platform)
	if err != nil {
		return ValidatedPlugin{}, err
	}

	root, err := os.MkdirTemp("", "go-reactrouter-plugin-")
	if err != nil {
		return ValidatedPlugin{}, &ValidationError{Code: CodePackageReadFailed, Err: err}
	}
	if err := extractEntries(root, entries); err != nil {
		_ = os.RemoveAll(root)
		return ValidatedPlugin{}, err
	}

	return ValidatedPlugin{
		Manifest:       manifest,
		Hash:           fmt.Sprintf("sha256:%x", archiveHash[:]),
		Root:           root,
		SignatureKeyID: keyID,
	}, nil
}

func readArchive(packagePath string, platform Platform) (map[string][]byte, error) {
	archive, err := zip.OpenReader(packagePath)
	if err != nil {
		return nil, &ValidationError{Code: CodeArchiveInvalid, Err: err}
	}
	defer archive.Close()

	maxFiles := platform.MaxFiles
	if maxFiles <= 0 {
		maxFiles = 512
	}
	maxFileBytes := platform.MaxFileBytes
	if maxFileBytes == 0 {
		maxFileBytes = 32 << 20
	}
	maxUncompressed := platform.MaxUncompressedBytes
	if maxUncompressed == 0 {
		maxUncompressed = 128 << 20
	}
	if len(archive.File) > maxFiles {
		return nil, &ValidationError{Code: CodeTooManyFiles, Err: fmt.Errorf("file count %d exceeds %d", len(archive.File), maxFiles)}
	}

	entries := make(map[string][]byte, len(archive.File))
	var total uint64
	for _, file := range archive.File {
		name, err := safeArchivePath(file.Name)
		if err != nil {
			return nil, err
		}
		if strings.HasSuffix(file.Name, "/") {
			continue
		}
		if _, exists := entries[name]; exists {
			return nil, &ValidationError{Code: CodeArchiveInvalid, Err: fmt.Errorf("duplicate file %q", name)}
		}
		if file.FileInfo().Mode()&os.ModeSymlink != 0 {
			return nil, &ValidationError{Code: CodeSymlinkForbidden, Err: fmt.Errorf("symlink %q", name)}
		}
		if file.UncompressedSize64 > maxFileBytes {
			return nil, &ValidationError{Code: CodeFileTooLarge, Err: fmt.Errorf("%q exceeds %d bytes", name, maxFileBytes)}
		}
		total += file.UncompressedSize64
		if total > maxUncompressed {
			return nil, &ValidationError{Code: CodeArchiveTooLarge, Err: fmt.Errorf("uncompressed size exceeds %d", maxUncompressed)}
		}
		reader, err := file.Open()
		if err != nil {
			return nil, &ValidationError{Code: CodeArchiveInvalid, Err: err}
		}
		data, readErr := io.ReadAll(io.LimitReader(reader, int64(maxFileBytes)+1))
		closeErr := reader.Close()
		if readErr != nil {
			return nil, &ValidationError{Code: CodeArchiveInvalid, Err: readErr}
		}
		if closeErr != nil {
			return nil, &ValidationError{Code: CodeArchiveInvalid, Err: closeErr}
		}
		if uint64(len(data)) > maxFileBytes {
			return nil, &ValidationError{Code: CodeFileTooLarge, Err: fmt.Errorf("%q exceeds %d bytes", name, maxFileBytes)}
		}
		entries[name] = data
	}
	return entries, nil
}

func safeArchivePath(name string) (string, error) {
	if name == "" || strings.Contains(name, "\\") || strings.Contains(name, ":") || strings.HasPrefix(name, "/") {
		return "", &ValidationError{Code: CodePathTraversal, Err: fmt.Errorf("unsafe archive path %q", name)}
	}
	clean := path.Clean(name)
	if clean == "." || clean == ".." || strings.HasPrefix(clean, "../") {
		return "", &ValidationError{Code: CodePathTraversal, Err: fmt.Errorf("unsafe archive path %q", name)}
	}
	return clean, nil
}

func validatePlatform(manifest contracts.PluginManifest, platform Platform) error {
	if len(manifest.Platforms) == 0 || platform.OS == "" || platform.Arch == "" {
		return nil
	}
	target := platform.OS + "/" + platform.Arch
	for _, supported := range manifest.Platforms {
		if supported == target {
			return nil
		}
	}
	return &ValidationError{Code: CodeUnsupportedPlatform, Err: fmt.Errorf("%s is not supported", target)}
}

func validateCoreAndDependencies(manifest contracts.PluginManifest, platform Platform) error {
	if platform.CoreVersion != "" {
		constraint, err := semver.NewConstraint(manifest.CoreRequires)
		if err != nil {
			return &ValidationError{Code: CodeCoreIncompatible, Err: err}
		}
		version, err := semver.NewVersion(platform.CoreVersion)
		if err != nil || !constraint.Check(version) {
			return &ValidationError{Code: CodeCoreIncompatible, Err: fmt.Errorf("core version %q does not satisfy %q", platform.CoreVersion, manifest.CoreRequires)}
		}
	}
	for _, dependency := range manifest.Dependencies {
		installedVersion, ok := platform.InstalledPlugins[dependency.ID]
		if !ok {
			return &ValidationError{Code: CodeDependencyMissing, Err: fmt.Errorf("dependency %q is not installed", dependency.ID)}
		}
		constraint, err := semver.NewConstraint(dependency.Version)
		version, versionErr := semver.NewVersion(installedVersion)
		if err != nil || versionErr != nil || !constraint.Check(version) {
			return &ValidationError{Code: CodeDependencyIncompatible, Err: fmt.Errorf("dependency %q version %q does not satisfy %q", dependency.ID, installedVersion, dependency.Version)}
		}
	}
	return nil
}

func validateReferencedFiles(manifest contracts.PluginManifest, entries map[string][]byte) error {
	paths := []string{manifest.Backend.Entrypoint, manifest.Frontend.EntryPoint(), manifest.Permissions, manifest.Menus, manifest.OpenAPI}
	for _, reference := range paths {
		clean, err := safeArchivePath(reference)
		if err != nil {
			return err
		}
		if _, exists := entries[clean]; !exists {
			return &ValidationError{Code: CodeReferencedFileMissing, Err: fmt.Errorf("referenced file %q is missing", clean)}
		}
	}
	return nil
}

func extractEntries(root string, entries map[string][]byte) error {
	for name, data := range entries {
		clean, err := safeArchivePath(name)
		if err != nil {
			return err
		}
		target := filepath.Join(root, filepath.FromSlash(clean))
		if !strings.HasPrefix(target, filepath.Clean(root)+string(os.PathSeparator)) {
			return &ValidationError{Code: CodePathTraversal, Err: fmt.Errorf("extraction escaped root for %q", name)}
		}
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			return &ValidationError{Code: CodePackageReadFailed, Err: err}
		}
		if err := os.WriteFile(target, data, 0o644); err != nil {
			return &ValidationError{Code: CodePackageReadFailed, Err: err}
		}
	}
	return nil
}

func verifySignature(manifest contracts.PluginManifest, entries map[string][]byte, platform Platform) (string, error) {
	if platform.AllowUnsigned && strings.TrimSpace(manifest.Signature) == "" {
		return "", nil
	}
	parts := strings.SplitN(manifest.Signature, ":", 2)
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", &ValidationError{Code: CodeSignatureRequired, Err: errors.New("signature must be key-id:base64")}
	}
	publicKey, ok := platform.TrustStore[parts[0]]
	if !ok {
		return "", &ValidationError{Code: CodeSignatureUnknownKey, Err: fmt.Errorf("key %q is not trusted", parts[0])}
	}
	signature, err := base64.RawStdEncoding.DecodeString(parts[1])
	if err != nil || len(signature) != ed25519.SignatureSize {
		return "", &ValidationError{Code: CodeSignatureInvalid, Err: errors.New("signature is not valid base64 ed25519 data")}
	}
	digest, err := canonicalPackageDigest(entries)
	if err != nil {
		return "", err
	}
	if !ed25519.Verify(publicKey, digest[:], signature) {
		return "", &ValidationError{Code: CodeSignatureInvalid, Err: errors.New("signature does not match package contents")}
	}
	return parts[0], nil
}
