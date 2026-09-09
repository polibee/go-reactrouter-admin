# plugin-validator

`plugin-validator` inspects a plugin ZIP without executing its backend or
frontend. It rejects unsafe archive paths, symlinks, oversized entries,
invalid manifests, incompatible Core/dependency versions, and unsigned or
untrusted packages.

The manifest signature uses `key-id:base64-ed25519-signature`. The signature
covers the canonical manifest with `signature` blanked plus every other archive
file in sorted path order. The command emits one JSON object with a stable
`code` on failure.

Example:

```bash
go run . \
  -package ./billing-1.2.3.zip \
  -core-version 1.0.0 \
  -trust-key release-2026=BASE64_ED25519_PUBLIC_KEY
```

`-allow-unsigned` is intended only for local development. The backend API uses
the same validator through `POST /api/v1/admin/plugins/validate` and persists a
version record only after validation succeeds.
