package pluginhost

import (
	"bytes"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"sort"
)

func canonicalPackageDigest(entries map[string][]byte) ([32]byte, error) {
	canonicalEntries := make(map[string][]byte, len(entries))
	for name, data := range entries {
		canonicalEntries[name] = data
	}
	manifest, ok := canonicalEntries["plugin.json"]
	if !ok {
		return [32]byte{}, &ValidationError{Code: CodeManifestMissing, Err: fmt.Errorf("plugin.json is missing")}
	}
	var manifestMap map[string]any
	if err := json.Unmarshal(manifest, &manifestMap); err != nil {
		return [32]byte{}, &ValidationError{Code: CodeManifestInvalid, Err: err}
	}
	manifestMap["signature"] = ""
	canonicalManifest, err := json.Marshal(manifestMap)
	if err != nil {
		return [32]byte{}, &ValidationError{Code: CodeManifestInvalid, Err: err}
	}
	canonicalEntries["plugin.json"] = canonicalManifest

	names := make([]string, 0, len(canonicalEntries))
	for name := range canonicalEntries {
		names = append(names, name)
	}
	sort.Strings(names)
	var payload bytes.Buffer
	for _, name := range names {
		_, _ = payload.WriteString(name)
		_ = payload.WriteByte(0)
		_, _ = payload.Write(canonicalEntries[name])
		_ = payload.WriteByte(0)
	}
	return sha256.Sum256(payload.Bytes()), nil
}
