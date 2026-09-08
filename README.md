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

### Database drivers

Core migrations and ORM configuration support PostgreSQL and MySQL/MariaDB.
Select the driver in `backend/.env` with `DB_CONNECTION=postgres` or
`DB_CONNECTION=mysql`; the default ports are 5432 and 3306 respectively.
Keep separate databases for development and integration tests. Database
installation is expected to be managed by the local Baota panel; Docker is not
required by this project.

The Core write APIs are documented in `contracts/core-admin.openapi.json` and
are exposed under `/api/v1/admin`. Create/update operations write an audit row
in the same database transaction as the resource mutation. To run the real
database suite against a dedicated database, set `DB_INTEGRATION=1` and run:

```text
cd backend
DB_CONNECTION=postgres DB_INTEGRATION=1 go test ./tests/integration -count=1
DB_CONNECTION=mysql DB_INTEGRATION=1 go test ./tests/integration -count=1
```

The normal `go test ./...` command skips this destructive integration suite.

The backend health endpoints are `GET /` and `GET /health`. Main business modules are added under `backend/modules/` and `admin/app/modules/`; runtime-installable plugins use `plugins/` and `admin/app/core/extensions/`.

## Documentation

- `docs/architecture/baseline.md`
- `contracts/api-conventions.md`
- `contracts/plugin-manifest.schema.json`
- `docs/superpowers/` — architecture design and staged implementation plan
