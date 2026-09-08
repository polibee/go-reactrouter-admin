# Goravel + ReactRouterAdmin Plugin Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Goravel + ReactRouterAdmin platform where users can install, enable, disable, upgrade, and uninstall signed plugins at runtime without rebuilding the main application.

**Architecture:** Keep ReactRouterAdmin's React Router Framework Mode, Resource Engine, permission guards, navigation registry, and API transport. Add a Goravel Core Plugin Manager and Gateway, run installable plugin backends as supervised child processes, and load trusted plugin frontends through a versioned ESM runtime contract.

**Tech Stack:** Goravel, Go, React 19, React Router Framework Mode, Vite, TypeScript, TanStack Query, existing ReactRouterAdmin Resource Engine, OpenAPI, generated TypeScript clients, SQLite/PostgreSQL-compatible migrations, signed plugin archives, supervised local plugin processes.

**Spec:** `outputs/goravel-reactrouter-plugin-platform-design.md`

## Global Constraints

- Keep React Router Framework Mode; do not replace it with `createBrowserRouter`.
- Keep `ResourceDataProvider<T>` as the frontend data seam; the Resource Engine must not import Goravel implementation details.
- Runtime-installable Go plugins run as separate supervised processes; they are not injected into the main Goravel binary.
- Core owns authentication, authorization, plugin state, gateway routing, audit logs, and menu visibility.
- Every plugin must declare a manifest, version, API version, dependencies, permissions, menus, frontend entrypoint, and OpenAPI document.
- Frontend business code must use generated API clients or provider adapters; it must not hand-write API URLs.
- Plugin install, enable, disable, upgrade, and uninstall must be auditable and idempotent.
- Uninstall preserves plugin business data by default.
- No CMS, Forum, Trading, AI, task demo, analytics demo, or sample business feature may be placed in Core.
- All new behavior requires focused automated tests and an end-to-end install/disable/upgrade verification path.

## Worktree and Repository Boundary

The source frontend is currently in `/mnt/d/codex/reactrouteradmin` on branch `refactor/v2-admin-foundation`. The target integration directory is `/mnt/d/codex/go-reactrouter`. Before implementation, create a dedicated integration branch or worktree and preserve the existing modified working tree in `reactrouteradmin`; do not reset or discard those changes.

The target layout is:

```text
go-reactrouter/
├── backend/
├── frontend/
├── plugins/
├── contracts/
└── tools/
```

The implementation should be executed as several independently reviewable sub-projects rather than one large commit series.

## Stage 0: Baseline and Integration Boundary

**Outcome:** A reproducible project boundary exists, and the current ReactRouterAdmin foundation is verified before backend work begins.

**Files:**

- Create: `go-reactrouter/README.md`
- Create: `go-reactrouter/docs/architecture/baseline.md`
- Create: `go-reactrouter/frontend/` from the selected ReactRouterAdmin source snapshot
- Create: `go-reactrouter/backend/` Goravel application skeleton
- Modify: `go-reactrouter/.gitignore`
- Test: `frontend/pnpm validate` and backend framework smoke test

**Interfaces:**

- Consumes: ReactRouterAdmin v2 Resource Engine, `ResourceDataProvider<T>`, `app/core/api`, `app/core/permissions`, `app/core/navigation`.
- Produces: A single project root with separate backend/frontend build commands and a documented source commit.

- [x] Record the exact ReactRouterAdmin source commit and branch in `docs/architecture/baseline.md`.
- [x] Record the exact Goravel version and supported Go version in the same file.
- [x] Copy or workspace-link the frontend source without importing demo business behavior into the backend.
- [ ] Start the frontend development server and verify the authentication shell, users resource, roles resource, permissions resource, and resource-engine routes.
- [x] Create the backend health endpoint `GET /health` returning `{ "data": { "status": "ok" } }`.
- [x] Run the frontend validation command and the backend unit test command.
- [x] Commit the baseline as `feat: establish goravel reactrouter plugin platform foundation`.

**Acceptance:** A new developer can clone the integration project, start frontend and backend independently, and identify which code belongs to Core, Resource Engine, and future plugins.

## Stage 1: Shared Contracts and API Conventions

**Outcome:** Core and plugins have stable manifest, API response, error, pagination, and health contracts before implementation spreads across repositories.

**Files:**

- Create: `contracts/plugin-manifest.schema.json`
- Create: `contracts/plugin-state.schema.json`
- Create: `contracts/api-conventions.md`
- Create: `contracts/plugin-runtime.openapi.json`
- Create: `backend/internal/contracts/api.go`
- Create: `backend/internal/contracts/plugin.go`
- Create: `frontend/app/core/api/contracts.ts`
- Create: `frontend/app/plugin-runtime/types.ts`
- Test: `backend/internal/contracts/*_test.go`
- Test: `frontend/app/plugin-runtime/types.test.ts`

**Interfaces:**

- `ApiResponse[T] { data: T; message?: string; meta?: ApiMeta; requestId: string }`
- `ApiErrorBody { error: { code: string; message: string; fields?: Record<string, string[]> }; requestId: string }`
- `PluginDescriptor { id: string; version: string; apiVersion: string; coreRequires: string }`
- `PluginState = discovered | verifying | installed | enabling | enabled | disabling | disabled | uninstalling | failed | uninstalled`
- `PluginFrontendModule { register(app: PluginFrontendApp): void }`
- `PluginFrontendApp.registerResource(resource): void`
- `PluginFrontendApp.registerPage(page): void`
- `PluginFrontendApp.registerNavigation(item): void`

- [x] Write schema tests for a valid manifest, missing ID, invalid version, invalid state, missing backend entrypoint, and unsupported API version.
- [x] Define the common response and error JSON examples in `contracts/api-conventions.md`.
- [x] Define the plugin runtime OpenAPI endpoints for manifest inspection, health, shutdown, and gateway metadata.
- [x] Make the Go contract package reject malformed manifests without starting a process.
- [x] Make the TypeScript runtime types represent both trusted ESM plugins and sandboxed iframe plugins.
- [x] Run Go contract tests and TypeScript typecheck.
- [x] Commit as `feat: establish goravel reactrouter plugin platform foundation`.

**Acceptance:** Backend, frontend, packaging tools, and plugins can compile against the same manifest and API contract without importing each other's internal code.

## Stage 2: Goravel Core Runtime and System Resources

**Outcome:** The platform has real Core authentication, users, roles, permissions, settings, audit logs, and menus backed by Goravel APIs.

**Files:**

- Create: `backend/app/Models/User.go`
- Create: `backend/app/Models/Role.go`
- Create: `backend/app/Models/Permission.go`
- Create: `backend/app/Models/Menu.go`
- Create: `backend/app/Models/AuditLog.go`
- Create: `backend/app/Models/Setting.go`
- Create: `backend/database/migrations/*_create_core_tables.go`
- Create: `backend/app/Http/Controllers/AuthController.go`
- Create: `backend/app/Http/Controllers/UserController.go`
- Create: `backend/app/Http/Controllers/RoleController.go`
- Create: `backend/app/Http/Controllers/PermissionController.go`
- Create: `backend/app/Http/Controllers/MenuController.go`
- Create: `backend/app/Http/Controllers/SettingController.go`
- Create: `backend/app/Http/Middleware/RequirePermission.go`
- Create: `backend/routes/api.go`
- Modify: `frontend/app/core/auth/auth.service.ts`
- Modify: `frontend/app/core/api/request.ts`
- Modify: `frontend/app/core/navigation/navigation-registry.ts`
- Modify: `frontend/app/core/permissions/permission.service.ts`
- Test: backend model, policy, controller, and migration tests
- Test: frontend auth, permission, menu, and API error tests

**Interfaces:**

- `GET /api/v1/auth/me`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/permissions`
- `GET /api/v1/admin/menus`
- `GET /api/v1/admin/settings`
- `GET /api/v1/admin/audit-logs`
- `RequirePermission(code string)` middleware

- [ ] Write failing tests for unauthenticated requests, missing permissions, role assignment, menu filtering, setting updates, and audit record creation.
- [ ] Implement migrations with foreign keys and indexes for permission code, menu owner, plugin owner, and audit actor.
- [x] Implement JWT authentication with an HttpOnly cookie/Bearer fallback and make the frontend `AuthService` consume real endpoints.
- [ ] Implement permission enforcement at the controller/middleware layer; frontend `Can` remains display-only.
- [ ] Implement menu filtering so the server returns only enabled and authorized menu items.
- [ ] Implement audit logs for login, permission change, setting change, and administrative mutations.
- [ ] Replace mock users and roles providers with generated-client adapters after the OpenAPI pipeline is available; until then use typed transport wrappers with the same contract.
- [ ] Run backend migrations on a clean test database and execute all Core API tests.
- [ ] Commit as `feat: add goravel core admin runtime`.

**Acceptance:** The frontend can log in, fetch the current user, render server-filtered navigation, manage users and roles, and receive consistent 401/403/422 responses from Goravel.

**Progress note (2026-09-08):** The Core persistence foundation, framework-independent authorization rules, permission middleware seam, and frontend API-backed auth adapter are implemented and tested. The HTTP controllers, token/session completion, role/permission loading, server-filtered menu API, and database-backed Core API tests remain part of this stage.

## Stage 3: Plugin Manager Data Model and Package Validation

**Outcome:** The Core can inspect and validate a plugin archive without executing it.

**Files:**

- Create: `backend/app/Models/Plugin.go`
- Create: `backend/app/Models/PluginVersion.go`
- Create: `backend/app/Models/PluginProcess.go`
- Create: `backend/database/migrations/*_create_plugin_tables.go`
- Create: `backend/internal/pluginhost/manifest.go`
- Create: `backend/internal/pluginhost/validator.go`
- Create: `backend/internal/pluginhost/package_reader.go`
- Create: `backend/internal/pluginhost/signature.go`
- Create: `backend/app/Http/Controllers/PluginController.go`
- Create: `backend/routes/plugin_api.go`
- Create: `tools/plugin-validator/main.go`
- Create: `tools/plugin-validator/testdata/valid-plugin/`
- Test: `backend/internal/pluginhost/*_test.go`
- Test: `tools/plugin-validator/*_test.go`

**Interfaces:**

- `ValidatePackage(path string, platform Platform) (ValidatedPlugin, error)`
- `ValidatedPlugin { Manifest PluginManifest; Hash string; Root string }`
- `PluginRepository.InstallRecord(...)`
- `GET /api/v1/admin/plugins`
- `POST /api/v1/admin/plugins/validate`

- [ ] Write validator tests for valid package, missing manifest, invalid JSON, path traversal, unsupported platform, hash mismatch, invalid signature, incompatible core version, and missing dependency.
- [ ] Implement archive extraction into a temporary directory with normalized paths and no executable permission before validation passes.
- [ ] Implement Manifest schema validation and semantic-version checks.
- [ ] Implement package hash calculation and signature verification against the configured trust store.
- [ ] Persist a plugin version record only after validation passes.
- [ ] Expose a read-only plugin list endpoint with state, version, dependencies, last error, and health status.
- [ ] Add CLI output that reports every validation failure with a stable machine-readable code.
- [ ] Run security-focused package tests and malformed archive tests.
- [ ] Commit as `feat: validate runtime plugin packages`.

**Acceptance:** A malformed or unsigned plugin cannot be installed or executed, and an administrator can inspect validated package metadata through the backend API.

## Stage 4: Plugin Process Runner and Gateway

**Outcome:** A validated plugin backend can be started, health-checked, routed through Core, stopped, and marked failed without taking down Goravel.

**Files:**

- Create: `backend/internal/pluginhost/process_runner.go`
- Create: `backend/internal/pluginhost/process_state.go`
- Create: `backend/internal/pluginhost/health_checker.go`
- Create: `backend/internal/gateway/plugin_proxy.go`
- Create: `backend/internal/gateway/plugin_auth.go`
- Create: `backend/app/Services/PluginRuntimeService.go`
- Modify: `backend/app/Models/PluginProcess.go`
- Modify: `backend/routes/plugin_api.go`
- Create: `plugins/sdk-go/runtime/server.go`
- Create: `plugins/sdk-go/runtime/health.go`
- Create: `plugins/sdk-go/runtime/auth.go`
- Create: `plugins/sdk-go/example-plugin/`
- Test: process runner integration tests
- Test: gateway authorization and routing tests
- Test: `plugins/sdk-go/example-plugin/*_test.go`

**Interfaces:**

- `Start(ctx context.Context, plugin ValidatedPlugin) (ProcessHandle, error)`
- `Stop(ctx context.Context, pluginID string) error`
- `Health(ctx context.Context, pluginID string) error`
- `Proxy(ctx context.Context, pluginID string, request GatewayRequest) GatewayResponse`
- `PluginRuntimeServer` with `/health`, `/metadata`, and `/shutdown`

- [ ] Write an integration test that starts the example plugin, waits for health, calls a plugin endpoint through Gateway, and stops the process.
- [ ] Allocate a local-only address and pass plugin ID, API prefix, Core URL, and process token through environment variables.
- [ ] Reject plugin requests when the database state is not `enabled`.
- [ ] Add request identity and authenticated user claims to the internal gateway protocol.
- [ ] Capture stdout and stderr with plugin ID and process ID in structured logs.
- [ ] Implement graceful shutdown followed by forced termination after the configured timeout.
- [ ] Mark the plugin `failed` after repeated health failures and stop routing traffic.
- [ ] Ensure a crashed plugin process does not terminate the Goravel process.
- [ ] Run process lifecycle tests on the supported development platform.
- [ ] Commit as `feat: run plugins behind supervised gateway`.

**Acceptance:** The example plugin remains isolated from the Core process, yet its API is reachable through the Core API prefix and is blocked immediately after disable.

## Stage 5: OpenAPI Generation and TypeScript Client Pipeline

**Outcome:** Core and plugins generate Swagger/OpenAPI documents and TypeScript clients from the same API definitions.

**Files:**

- Create: `backend/openapi/core.openapi.json`
- Create: `backend/internal/openapi/aggregate.go`
- Create: `backend/internal/openapi/serve.go`
- Create: `tools/openapi-codegen/config.yaml`
- Create: `tools/openapi-codegen/generate.go`
- Create: `frontend/generated/core-api/`
- Create: `plugins/sdk-go/example-plugin/openapi.json`
- Create: `plugins/sdk-ts/client-runtime.ts`
- Modify: `frontend/app/core/api/request.ts`
- Modify: `frontend/app/resource-engine/resource/resource.types.ts`
- Test: OpenAPI schema validation and generated-client compile tests

**Interfaces:**

- `GET /openapi.json`
- `GET /openapi/plugins/:pluginId.json`
- `GET /docs`
- Generated service functions consumed by `ResourceDataProvider<T>` adapters

- [ ] Write a contract test that checks every documented operation has an `operationId`, response envelope, error schema, and permission metadata.
- [ ] Define pagination, sort, filter, validation error, and authorization error components once in the Core OpenAPI components section.
- [ ] Generate Core TypeScript types and client functions into `frontend/generated/core-api`.
- [ ] Generate the example plugin client into its frontend package.
- [ ] Make `app/core/api` inject authentication, request ID, abort signal, and normalized `ApiError` behavior around generated clients.
- [ ] Add a resource-provider adapter test for list, find, create, update, delete, pagination, and 422 errors.
- [ ] Aggregate Core and enabled-plugin documents for Swagger UI without modifying plugin source files.
- [ ] Add CI validation that fails when the generated client is stale compared with the OpenAPI source.
- [ ] Commit as `feat: generate openapi contracts and clients`.

**Acceptance:** A frontend resource can use a generated service without writing a URL string, and the same operations appear in Swagger UI and the generated TypeScript client.

## Stage 6: ReactRouterAdmin Plugin Runtime

**Outcome:** ReactRouterAdmin can load trusted plugin manifests and frontend ESM bundles while retaining the existing Resource Engine and Framework Mode router.

**Files:**

- Create: `frontend/app/plugin-runtime/plugin-registry.ts`
- Create: `frontend/app/plugin-runtime/plugin-loader.ts`
- Create: `frontend/app/plugin-runtime/plugin-context.tsx`
- Create: `frontend/app/plugin-runtime/plugin-routes.tsx`
- Create: `frontend/app/plugin-runtime/plugin-errors.tsx`
- Modify: `frontend/app/core/extensions/extension.types.ts`
- Modify: `frontend/app/core/navigation/navigation-registry.ts`
- Modify: `frontend/app/core/registry/resource.registry.ts`
- Modify: `frontend/app/core/admin/admin-provider.tsx`
- Modify: `frontend/app/routes/_authenticated/admin/$.tsx`
- Create: `plugins/sdk-ts/plugin.ts`
- Create: `plugins/sdk-ts/resource-adapter.ts`
- Create: `plugins/sdk-ts/navigation.ts`
- Create: `plugins/sdk-ts/example-plugin/entry.ts`
- Test: plugin registry, loader, permission filtering, resource registration, and lazy page tests

**Interfaces:**

- `PluginRegistry.register(descriptor: RuntimePluginDescriptor): void`
- `PluginRegistry.disable(pluginId: string): void`
- `PluginRegistry.getEnabled(): RuntimePluginDescriptor[]`
- `PluginLoader.load(entryUrl: string): Promise<PluginFrontendModule>`
- `PluginFrontendApp.registerResource(resource: AnyAdminResource): void`
- `PluginFrontendApp.registerPage(page: PluginPageDefinition): void`

- [ ] Write a registry test for idempotent registration, duplicate IDs, disabled plugins, and failed module loading.
- [ ] Load the enabled plugin list from Core before registering frontend modules.
- [ ] Check package version and API version before executing a trusted entry module.
- [ ] Register plugin resources into the existing `resourceRegistry` and plugin pages into the route host used by the authenticated admin splat route.
- [ ] Keep handwritten Core routes higher priority than plugin host routes.
- [ ] Combine backend menu visibility with registered frontend routes before rendering the sidebar.
- [ ] Render a stable plugin-unavailable page when the backend is enabled but the frontend bundle fails to load.
- [ ] Add a full-page reload after a successful install or enable operation.
- [ ] Run `pnpm validate`, generated-client typecheck, and browser tests for plugin route access.
- [ ] Commit as `feat: add runtime frontend plugin host`.

**Acceptance:** The example plugin contributes a Resource and a Custom Page without changing `app/routes.ts`, and an unauthorized user cannot see or open either page.

## Stage 7: Install, Enable, Disable, Upgrade, and Uninstall Workflows

**Outcome:** Administrators can manage the full plugin lifecycle from the admin UI, with idempotency, rollback, and audit records.

**Files:**

- Modify: `backend/app/Services/PluginRuntimeService.go`
- Modify: `backend/app/Http/Controllers/PluginController.go`
- Modify: `backend/routes/plugin_api.go`
- Create: `backend/app/Jobs/InstallPlugin.go`
- Create: `backend/app/Jobs/UpgradePlugin.go`
- Create: `backend/app/Jobs/UninstallPlugin.go`
- Create: `frontend/app/core-resources/plugins/resource.tsx`
- Create: `frontend/app/core-resources/plugins/api.ts`
- Create: `frontend/app/core-resources/plugins/components/plugin-install-dialog.tsx`
- Create: `frontend/app/core-resources/plugins/components/plugin-state-badge.tsx`
- Create: `frontend/app/core-resources/plugins/components/plugin-actions.tsx`
- Modify: `frontend/app/core-resources/index.ts`
- Test: lifecycle service tests, rollback tests, and browser workflow tests

**Interfaces:**

- `POST /api/v1/admin/plugins/install`
- `POST /api/v1/admin/plugins/:id/enable`
- `POST /api/v1/admin/plugins/:id/disable`
- `POST /api/v1/admin/plugins/:id/upgrade`
- `POST /api/v1/admin/plugins/:id/uninstall`
- `GET /api/v1/admin/plugins/:id/logs`
- `GET /api/v1/admin/plugins/:id/versions`

- [ ] Write failing lifecycle tests for install success, repeated install, missing dependency, migration failure, enable failure, disable idempotency, upgrade rollback, and uninstall data retention.
- [ ] Implement install as a state machine with durable state transitions and a unique operation ID.
- [ ] Execute migrations before enabling routes and permissions.
- [ ] Register permissions and menus in a transaction or compensating cleanup step.
- [ ] Require a confirmation flag for uninstall and a separate confirmation for data deletion.
- [ ] Keep old plugin files and version metadata until the new version passes health checks.
- [ ] Implement the plugin admin resource using the existing Resource Engine rather than a bespoke table.
- [ ] Add install progress and last-error display without polling more frequently than the configured interval.
- [ ] Add browser tests covering upload/install, enable, navigation visibility, API access, disable, refresh, and uninstall.
- [ ] Commit as `feat: expose plugin lifecycle in admin`.

**Acceptance:** A user can install the example plugin from the admin UI, use its page, disable it, observe its menu and API disappear, re-enable it, upgrade it, and uninstall it while its business data remains by default.

## Stage 8: Core Resource Cleanup and First Real Plugin

**Outcome:** The foundation contains only reusable administrative capabilities, and one real non-demo plugin proves the SDK contract.

**Files:**

- Modify: `frontend/app/core-resources/users/*`
- Modify: `frontend/app/core-resources/roles/*`
- Modify: `frontend/app/core-resources/permissions/*`
- Move or remove: current task demo routes and data
- Move or remove: site/CMS-specific resources
- Move or remove: sample analytics dashboard data
- Create: `plugins/example-business/` or the first selected production plugin
- Create: `docs/plugins/authoring-guide.md`
- Create: `docs/plugins/security-model.md`
- Test: clean Core route matrix and first real plugin E2E tests

- [ ] Classify every existing ReactRouterAdmin feature as Core, official plugin, production plugin, or removal candidate.
- [ ] Keep only users, roles, permissions, settings, media if globally required, audit logs, and plugin management in Core.
- [ ] Replace the sample dashboard with a system overview containing health, version, active user, and plugin status data only.
- [ ] Convert the first real business domain into a plugin with backend process, migrations, OpenAPI, permissions, menus, Resource, and Custom Page.
- [ ] Document the exact plugin authoring workflow from SDK scaffold to signed package.
- [ ] Run the clean installation test without localStorage data and without demo records.
- [ ] Commit as `refactor: keep core reusable and add first production plugin`.

**Acceptance:** A new project can start with a clean administrative backend and add the first business domain by installing a plugin package, with no sample feature deletion required afterward.

## Stage 9: Security, Packaging, Operations, and Release Gate

**Outcome:** The platform is safe enough for controlled use and has a repeatable plugin release process.

**Files:**

- Create: `tools/plugin-packager/README.md`
- Create: `tools/plugin-packager/main.go`
- Create: `tools/plugin-sign/`
- Create: `docs/operations/plugin-installation.md`
- Create: `docs/operations/plugin-upgrade-rollback.md`
- Create: `docs/operations/plugin-backup.md`
- Modify: CI workflows for backend, frontend, package validation, OpenAPI drift, and E2E tests
- Test: signature, traversal, privilege, crash isolation, and rollback test suites

- [ ] Build a package command that creates `plugin.json`, backend artifacts, frontend assets, migrations, permissions, menus, OpenAPI, hash, and signature.
- [ ] Build a verification command that rejects changed files after signing.
- [ ] Add archive traversal tests for absolute paths, `..` paths, symlinks, oversized files, and unexpected executables.
- [ ] Add process isolation tests for environment leakage, unauthorized external port binding, and gateway bypass.
- [ ] Add an upgrade rollback test that kills the new process during health check.
- [ ] Add backup/restore documentation that distinguishes plugin files from plugin business data.
- [ ] Run the full backend test suite, frontend validation, OpenAPI generation check, package validation, and browser E2E suite.
- [ ] Create a release checklist requiring signed package, compatible core range, migration review, OpenAPI review, and rollback verification.
- [ ] Commit as `chore: harden plugin packaging and release checks`.

**Acceptance:** A signed plugin package can be built, verified, installed, upgraded, rolled back, disabled, and uninstalled through documented operations with no failing security or contract checks.

## Verification Matrix

Every implementation stage must keep these checks green:

```text
Backend unit tests
Backend migration tests
Backend API contract tests
Plugin manifest and package tests
Plugin process lifecycle tests
OpenAPI schema validation
Generated TypeScript client typecheck
pnpm validate
React Router route matrix
Browser E2E lifecycle tests
```

The final release gate requires a clean database and a clean browser profile. Tests must prove both an administrator with all permissions and a restricted role with only one plugin permission.

## Suggested Commit Boundaries

```text
chore: establish goravel reactrouter integration boundary
feat: define plugin and api contracts
feat: add goravel core admin runtime
feat: validate runtime plugin packages
feat: run plugins behind supervised gateway
feat: generate openapi contracts and clients
feat: add runtime frontend plugin host
feat: expose plugin lifecycle in admin
refactor: keep core reusable and add first production plugin
chore: harden plugin packaging and release checks
```

## Execution Order

Implement stages in order. Stage 2 and Stage 5 may be developed in separate branches, but Stage 6 must not start until the shared contracts and generated-client seam are stable. Stage 7 must not start until Stage 4 and Stage 6 both pass their isolated lifecycle tests. Stage 8 is the cleanup gate before production plugin authoring; Stage 9 is the release gate.

This master plan should be split into separate execution plans before coding begins:

1. Core API and authorization plan: Stages 0–2.
2. Plugin host and package lifecycle plan: Stages 3–4.
3. OpenAPI and frontend runtime plan: Stages 5–6.
4. Admin lifecycle UI and production hardening plan: Stages 7–9.
