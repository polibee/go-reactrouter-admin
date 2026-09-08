# Integration Baseline

## Current source

- Target project: `D:\codex\go-reactrouter`
- Frontend source: ReactRouterAdmin `refactor/v2-admin-foundation`
- Frontend source commit: `08720c1d6668df11169cbb69638077e900432d25`
- Frontend baseline copy: `frontend/`
- Original documentation/source copy retained at: `docs/reactrouteradmin/`
- Backend target: `backend/`
- Backend framework: Goravel `v1.18.0`
- Backend Go baseline: Go `1.25.0` or newer

## Architecture decision

The application uses a modular monolith for its main business domain. Main business modules live under `backend/modules` and `frontend/app/modules`; they are compiled and deployed with the application.

Runtime-installable plugins are reserved for optional or third-party features. Their backend runs as a supervised process and their frontend is loaded through the plugin runtime contract.

## Existing frontend capabilities retained

- React Router Framework Mode
- `app/core/api`
- `app/core/auth`
- `app/core/permissions`
- `app/core/navigation`
- `app/core/registry`
- `app/core/extensions`
- `app/resource-engine`
- `app/components/admin`

## Stage 0 status

- Project Git repository initialized.
- Frontend baseline copied into `frontend/`.
- Shared contract directories created.
- Goravel runtime bootstrap merged into `backend/`.
- `GET /` and `GET /health` are platform health endpoints; the scaffold's example user route and welcome page are not included.
- Backend and frontend validation commands pass in WSL.
