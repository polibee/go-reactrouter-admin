# Development Progress

更新时间：2026-09-08

## 当前结论

项目已经进入 Stage 2 Core 基础实现阶段。当前完成的是可运行的 Goravel + ReactRouterAdmin 工程边界、主业务模块注册边界、插件与 API 共享契约，以及 Core 身份/授权的数据和领域基础；Core 登录 API、后台资源 CRUD、插件安装器和独立插件进程仍未完成。

## 已完成

- Stage 0：Goravel `v1.18.0` 后端、ReactRouterAdmin 前端、项目目录和 WSL 开发命令已建立。
- 后端 `GET /health` 返回统一格式 `{ "data": { "status": "ok" } }`。
- 主业务模块使用 `backend/modules` 和 `frontend/app/modules`，编译进主应用，不通过运行时插件安装。
- 插件 manifest、生命周期状态、统一成功/错误响应契约已定义并有 Go 测试。
- 插件前端运行时类型、可信同源 ESM loader、主业务模块注册器已有 TypeScript 测试。
- 插件运行时 OpenAPI 契约已加入 `contracts/plugin-runtime.openapi.json`。
- Stage 2 已建立 `users`、`roles`、`permissions`、关系表、`menus`、`settings` 和 `audit_logs` 迁移，并加入对应 Goravel 模型。
- Stage 2 已加入独立于 ORM 的角色/权限授权内核，支持精确权限、命名空间通配符和全局 `*`。
- Stage 2 已加入可注入用户解析器的 `RequirePermission` 中间件契约，统一区分 401 和 403 响应。
- 前端已移除默认 mock 管理员，认证状态改为请求 `/api/v1/auth/me`，登录页不再接受硬编码演示账号。

## 未完成

- Stage 2：Core 登录/登出/me API、用户/角色/权限/菜单/设置/审计 CRUD、数据库测试和真实用户权限加载仍待完成。
- Stage 3：插件包校验、签名、依赖和持久化模型。
- Stage 4：插件独立进程、健康检查、网关和生命周期控制。
- Stage 5：OpenAPI 生成器、Swagger 聚合和 TypeScript client 生成流水线。
- Stage 6–9：前端插件页面宿主、安装/启停/升级/卸载 UI、安全加固和发布流程。

## 验证状态

- `backend`: `GOCACHE=/tmp/go-reactrouter-build go test ./...` 通过。
- `frontend`: `pnpm test:unit` 通过，5 个测试通过。
- `frontend`: 本轮 `pnpm test:unit` 通过，7 个测试通过；本轮定向 Biome lint 通过。
- `frontend`: `pnpm validate` 通过；现有资源引擎仍有 4 条 lint warning，没有新增错误。
- `frontend`: 本轮 `pnpm typecheck` 未能在 `/mnt/d` 完成，React Router 类型生成再次卡在 Windows 挂载目录文件 I/O；不能把该命令标记为通过。
- OpenAPI JSON 可被 Node 原生 JSON parser 解析。
- ReactRouterAdmin 在 `/mnt/d` Windows 挂载目录启动开发服务时，首次 SSR 请求出现长时间阻塞；进程处于文件 I/O 等待状态。这是 WSL 跨文件系统开发目录的环境限制，需迁移到 WSL 原生目录或使用构建产物部署后再做浏览器 E2E。
