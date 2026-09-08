# Goravel + ReactRouterAdmin

This repository is the integration project for a reusable Goravel administration platform.

## Architecture

- `backend/` — Goravel application and modular-monolith backend.
- `frontend/` — ReactRouterAdmin foundation using React Router Framework Mode.
- `backend/modules/` and `frontend/app/modules/` — main business modules compiled with the application.
- `plugins/` — SDKs and optional runtime-installable plugins.
- `contracts/` — versioned API, manifest, and runtime contracts.
- `tools/` — package, signing, and OpenAPI tooling.

The main business is modular but does not need to be an installable plugin. Runtime plugins are for optional or third-party features.

## Development

Frontend:

```text
cd frontend
pnpm install
pnpm dev
```

Backend uses Goravel v1.18.0 and requires Go >= 1.25. Run it from `backend/`:

```text
go mod tidy
go run .
```

The backend health endpoints are `GET /` and `GET /health`. Main business modules are added under `backend/modules/` and `frontend/app/modules/`; runtime-installable plugins use `plugins/` and `frontend/app/core/extensions/`.

## Documentation

- `docs/architecture/baseline.md`
- `contracts/api-conventions.md`
- `contracts/plugin-manifest.schema.json`
- `docs/superpowers/` — architecture design and staged implementation plan
