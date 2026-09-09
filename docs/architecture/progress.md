# Development Progress

更新时间：2026-09-09

## 当前结论

项目已经完成 Stage 2 Core 资源写入和 MySQL/PostgreSQL 真实验证，并完成 Core 资源到生成客户端的第一轮切换；当前进入 Stage 3 插件包校验和状态持久化。主业务仍采用编译进主应用的模块化方式；插件独立进程和网关仍未开始。

## 已完成

- Stage 0：Goravel `v1.18.0` 后端、ReactRouterAdmin 前端、项目目录和 WSL 开发命令已建立。
- 后端 `GET /health` 返回统一格式 `{ "data": { "status": "ok" } }`。
- 主业务模块使用 `backend/modules` 和 `admin/app/modules`，编译进主应用，不通过运行时插件安装。
- 插件 manifest、生命周期状态、统一成功/错误响应契约已定义并有 Go 测试。
- 插件前端运行时类型、可信同源 ESM loader、主业务模块注册器已有 TypeScript 测试。
- 插件运行时 OpenAPI 契约已加入 `contracts/plugin-runtime.openapi.json`。
- Stage 2 已建立 `users`、`roles`、`permissions`、关系表、`menus`、`settings` 和 `audit_logs` 迁移，并加入对应 Goravel 模型。
- Stage 2 已加入独立于 ORM 的角色/权限授权内核，支持精确权限、命名空间通配符和全局 `*`。
- Stage 2 已加入可注入用户解析器的 `RequirePermission` 中间件契约，统一区分 401 和 403 响应。
- 前端已移除默认 mock 管理员，认证状态改为请求 `/api/v1/auth/me`，登录页不再接受硬编码演示账号。
- Core JWT 认证 API 已加入：`POST /api/v1/auth/login`、`GET /api/v1/auth/me`、`POST /api/v1/auth/logout`；JWT 使用 HttpOnly Cookie，也接受 Bearer Header。
- Core Auth OpenAPI 合同已加入 `contracts/core-auth.openapi.json`，并补充了开发环境的带凭据 CORS 配置。
- 主应用目录已统一为 `admin/`；插件 manifest 的 `frontend` 字段仍保留为协议字段，不与主应用目录混淆。
- Stage 2 第一批资源 API 已加入：按权限保护的用户、角色、权限、菜单、设置、审计日志分页/搜索只读接口，并有 `contracts/core-admin.openapi.json` 合同。
- Core 数据库配置已同时接入 PostgreSQL 和 MySQL/MariaDB 驱动，`DB_CONNECTION` 可切换，端口可自动使用 5432/3306。
- Core 用户、角色、权限、菜单、设置已加入创建、修改、删除 API，并按资源权限分别保护。
- Core 写操作使用数据库事务；资源变更与 `audit_logs` 审计记录在同一事务内提交或回滚。
- 菜单 API 已在服务端过滤不可见或当前用户无权限的菜单。
- `backend/tests/integration/core_resources_test.go` 已覆盖真实 HTTP 登录、五类资源 CRUD、审计记录和迁移刷新；默认跳过，需 `DB_INTEGRATION=1` 且使用专用数据库。
- Core Admin OpenAPI 合同已补充写入请求、路径参数、创建/修改/删除操作。
- 宝塔环境已验证 PostgreSQL 18 和原生 MySQL 8.4 可启动；MySQL 兼容性已修复 `menus.key/settings.key` 保留字查询。
- Core 集成测试已分别在 PostgreSQL 和 MySQL 专用数据库通过，覆盖登录、五类资源增改删、审计写入和菜单权限过滤。
- OpenAPI 合同已加入操作权限元数据；`tools/openapi-codegen` 已实现合同校验、客户端生成、聚合文档生成和 stale 检查。
- 后端已通过 `/openapi.json` 和 `/docs` 提供聚合合同；前端 `admin/generated/core-api` 已生成统一 Core client。
- Resource Engine 已加入通用远程 Provider；用户资源已从前端 mock 切换为生成客户端，并补齐用户详情读取接口。
- 角色、权限、菜单、设置资源已加入生成客户端 Provider 适配层；角色列表返回权限代码，便于角色编辑复用统一合同。
- 用户、角色、权限、菜单、设置已补齐生成客户端所需的详情读取 API，并纳入权限保护和 OpenAPI 合同。
- Core 资源集成测试已覆盖五类资源的详情读取；PostgreSQL 和 MySQL 专用数据库验证均通过。
- Stage 3 已加入安全插件 ZIP 校验器：归档大小、文件数量、解压大小、路径穿越、符号链接、manifest、平台、Core/依赖版本和 Ed25519 签名均在执行前校验。
- Stage 3 已加入 `plugins`、`plugin_versions`、`plugin_processes` 表和 Goravel 模型；只有校验成功后才记录插件版本。
- Stage 3 已加入受权限保护的插件列表和校验 API，并同步到 OpenAPI/生成客户端；独立 `tools/plugin-validator` CLI 输出稳定机器可读错误码。

## 未完成

- Stage 2：Core 资源的生成客户端接入已完成；菜单当前仍是“可见且有权限的导航数据”接口，后续如需管理不可见菜单，应单独增加管理目录接口，不能复用导航过滤接口。
- Stage 3：插件验证记录的后台管理页面、上传安装工作流和完整真实数据库插件生命周期测试仍待完成。
- Stage 4：插件独立进程、健康检查、网关和生命周期控制。
- Stage 5：插件 OpenAPI 客户端生成、启用插件合同聚合、CI 工作流和完整 TypeScript 编译验证仍待完成。
- Stage 6–9：前端插件页面宿主、安装/启停/升级/卸载 UI、安全加固和发布流程。

## 验证状态

- `backend`: `GOCACHE=/tmp/go-reactrouter-build go test ./...` 通过。
- `admin`: 本轮 `pnpm test:unit` 通过，13 个测试通过。
- `admin`: Biome lint 无新增错误，保留原资源引擎的 4 条 warning。
- `admin`: 已在 WSL 原生临时目录完成 `pnpm typecheck` 和 `pnpm build`；`/mnt/d` Windows 挂载目录仍不适合执行这两项耗时文件 I/O 操作。
- 开发服务：`pnpm dev --host 0.0.0.0` 最终监听 `5173`，但 `/` 请求在 `/mnt/d` 下超过 20 秒无响应；开发前端应复制到 WSL 原生目录后运行。
- `node tools/openapi-codegen/contract.test.mjs` 通过，并二次执行 stale 检查。
- `pnpm run check:api` 通过，生成客户端与 OpenAPI 合同保持同步。
- `GOCACHE=/tmp/go-reactrouter-build go test ./...` 通过；PostgreSQL 和 MySQL `DB_INTEGRATION=1` 集成测试均通过。
- `backend/internal/pluginhost` 校验器测试覆盖签名包、manifest 缺失、路径穿越、平台不兼容、签名错误、Core 不兼容、依赖缺失和文件大小限制。
- `tools/plugin-validator` 独立 CLI 测试通过；错误输出包含稳定 `code` 字段。
- 默认 Go 测试包含集成测试包，但因未设置 `DB_INTEGRATION=1` 会安全跳过真实数据库操作。
- ReactRouterAdmin 在 `/mnt/d` Windows 挂载目录启动开发服务时，首次 SSR 请求出现长时间阻塞；进程处于文件 I/O 等待状态。这是 WSL 跨文件系统开发目录的环境限制，需迁移到 WSL 原生目录或使用构建产物部署后再做浏览器 E2E。
