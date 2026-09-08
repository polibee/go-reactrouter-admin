# Goravel + ReactRouterAdmin

This repository is the integration project for a reusable Goravel administration platform.

## Architecture

- `backend/` — Goravel application and modular-monolith backend.
- `admin/` — ReactRouterAdmin foundation using React Router Framework Mode.
- `backend/modules/` and `admin/app/modules/` — main business modules compiled with the application.
- `plugins/` — SDKs and optional runtime-installable plugins.
- `contracts/` — versioned API, manifest, and runtime contracts.
- `tools/` — package, signing, and OpenAPI tooling.

The main business is modular but does not need to be an installable plugin. Runtime plugins are for optional or third-party features.

## Development

Admin panel:

```text
cd admin
pnpm install
pnpm dev
```

When the repository is under a Windows-mounted path such as `/mnt/d`, React
Router's SSR/type-generation file I/O can be too slow and the first browser
request may remain pending. For browser development, copy the working tree to
the WSL-native filesystem and run it there:

```text
rsync -a --exclude node_modules --exclude .react-router /mnt/d/codex/go-reactrouter/ ~/projects/go-reactrouter/
cd ~/projects/go-reactrouter/admin
pnpm install
pnpm dev --host 0.0.0.0
```

Open `http://127.0.0.1:5173`. The Core API defaults to `http://127.0.0.1:3000`;
set `VITE_API_BASE_URL` if the backend uses another origin. For cross-origin
development, set `CORS_ALLOWED_ORIGINS` on the backend when using a custom
admin origin.

Backend uses Goravel v1.18.0 and requires Go >= 1.25. Run it from `backend/`:

```text
go mod tidy
go run .
```

The backend health endpoints are `GET /` and `GET /health`. Main business modules are added under `backend/modules/` and `admin/app/modules/`; runtime-installable plugins use `plugins/` and `admin/app/core/extensions/`.

## Documentation

- `docs/architecture/baseline.md`
- `contracts/api-conventions.md`
- `contracts/plugin-manifest.schema.json`
- `docs/superpowers/` — architecture design and staged implementation plan
