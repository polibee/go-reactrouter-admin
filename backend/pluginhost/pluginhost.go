// Package pluginhost exposes the stable package-validation boundary used by
// the CLI and future install services. The implementation remains internal so
// process-hosting details cannot leak into external plugin code.
package pluginhost

import internal "github.com/polibee/go-reactrouter/backend/internal/pluginhost"

type Platform = internal.Platform
type ValidatedPlugin = internal.ValidatedPlugin
type ValidationError = internal.ValidationError

const (
	CodeArchiveInvalid         = internal.CodeArchiveInvalid
	CodeArchiveTooLarge        = internal.CodeArchiveTooLarge
	CodeFileTooLarge           = internal.CodeFileTooLarge
	CodeTooManyFiles           = internal.CodeTooManyFiles
	CodePathTraversal          = internal.CodePathTraversal
	CodeSymlinkForbidden       = internal.CodeSymlinkForbidden
	CodeManifestMissing        = internal.CodeManifestMissing
	CodeManifestInvalid        = internal.CodeManifestInvalid
	CodeUnsupportedPlatform    = internal.CodeUnsupportedPlatform
	CodeCoreIncompatible       = internal.CodeCoreIncompatible
	CodeDependencyMissing      = internal.CodeDependencyMissing
	CodeDependencyIncompatible = internal.CodeDependencyIncompatible
	CodeSignatureRequired      = internal.CodeSignatureRequired
	CodeSignatureInvalid       = internal.CodeSignatureInvalid
	CodeSignatureUnknownKey    = internal.CodeSignatureUnknownKey
	CodePackageReadFailed      = internal.CodePackageReadFailed
	CodeReferencedFileMissing  = internal.CodeReferencedFileMissing
)

var ValidatePackage = internal.ValidatePackage
var ErrorCode = internal.ErrorCode
