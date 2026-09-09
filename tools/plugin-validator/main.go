package main

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"errors"
	"flag"
	"io"
	"os"
	"runtime"
	"strings"

	"github.com/polibee/go-reactrouter/backend/pluginhost"
)

type trustKey struct {
	ID  string
	Key ed25519.PublicKey
}

type trustKeysFlag []trustKey

func (keys *trustKeysFlag) String() string { return "" }

func (keys *trustKeysFlag) Set(value string) error {
	key, err := parseTrustKey(value)
	if err != nil {
		return err
	}
	*keys = append(*keys, key)
	return nil
}

func parseTrustKey(value string) (trustKey, error) {
	parts := strings.SplitN(strings.TrimSpace(value), "=", 2)
	if len(parts) != 2 || parts[0] == "" {
		return trustKey{}, errors.New("trust key must use key-id=base64-public-key")
	}
	key, err := base64.RawStdEncoding.DecodeString(parts[1])
	if err != nil || len(key) != ed25519.PublicKeySize {
		return trustKey{}, errors.New("trust key must be a base64 Ed25519 public key")
	}
	return trustKey{ID: parts[0], Key: ed25519.PublicKey(key)}, nil
}

type validationOutput struct {
	OK             bool   `json:"ok"`
	Code           string `json:"code,omitempty"`
	Message        string `json:"message,omitempty"`
	Manifest       any    `json:"manifest,omitempty"`
	Hash           string `json:"hash,omitempty"`
	Root           string `json:"root,omitempty"`
	SignatureKeyID string `json:"signature_key_id,omitempty"`
}

func main() { os.Exit(run(os.Args[1:], os.Stdout, os.Stderr)) }

func run(args []string, stdout, stderr io.Writer) int {
	flags := flag.NewFlagSet("plugin-validator", flag.ContinueOnError)
	flags.SetOutput(stderr)
	packagePath := flags.String("package", "", "path to a plugin zip archive")
	coreVersion := flags.String("core-version", "1.0.0", "Core version used for compatibility checks")
	osName := flags.String("os", runtime.GOOS, "target operating system")
	arch := flags.String("arch", runtime.GOARCH, "target architecture")
	allowUnsigned := flags.Bool("allow-unsigned", false, "allow unsigned packages for local development only")
	keepRoot := flags.Bool("keep-root", false, "keep the extracted validation root")
	var trustKeys trustKeysFlag
	flags.Var(&trustKeys, "trust-key", "trusted key in key-id=base64-public-key form; may be repeated")
	if err := flags.Parse(args); err != nil {
		return 2
	}
	if strings.TrimSpace(*packagePath) == "" {
		writeOutput(stdout, validationOutput{Code: pluginhost.CodePackageReadFailed, Message: "-package is required"})
		return 2
	}
	trustStore := make(map[string]ed25519.PublicKey, len(trustKeys))
	for _, key := range trustKeys {
		trustStore[key.ID] = key.Key
	}
	validated, err := pluginhost.ValidatePackage(*packagePath, pluginhost.Platform{
		CoreVersion:   *coreVersion,
		OS:            *osName,
		Arch:          *arch,
		TrustStore:    trustStore,
		AllowUnsigned: *allowUnsigned,
	})
	if err != nil {
		writeOutput(stdout, validationOutput{Code: pluginhost.ErrorCode(err), Message: err.Error()})
		return 1
	}
	if !*keepRoot {
		defer os.RemoveAll(validated.Root)
	}
	writeOutput(stdout, validationOutput{
		OK:             true,
		Manifest:       validated.Manifest,
		Hash:           validated.Hash,
		Root:           validated.Root,
		SignatureKeyID: validated.SignatureKeyID,
	})
	return 0
}

func writeOutput(writer io.Writer, output validationOutput) {
	if output.OK {
		_ = json.NewEncoder(writer).Encode(output)
		return
	}
	output.OK = false
	_ = json.NewEncoder(writer).Encode(output)
}
