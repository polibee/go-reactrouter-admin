# Goravel + ReactRouterAdmin 可运行时插件平台架构设计

版本：v1.0 设计稿  
日期：2026-09-08  
适用项目：`go-reactrouter`、`reactrouteradmin`  

## 1. 目标

本项目用于构建一个类似 Laravel Filament 的通用后台基础平台，使后续 Goravel 项目能够直接复用：

- 管理后台布局、认证、角色和权限
- 通用资源 CRUD、表格、表单和批量操作
- 菜单、导航和权限联动
- 文件/媒体管理
- OpenAPI、Swagger 和 TypeScript API Client
- 插件安装、启用、停用、升级和卸载
- 插件前端页面、资源和后端 API 的统一接入

用户最终可以在后台插件中心完成：

```text
上传或选择插件
    ↓
校验版本、签名和依赖
    ↓
安装文件和数据库迁移
    ↓
注册权限、菜单和 OpenAPI
    ↓
启动插件后端进程
    ↓
加载插件前端资源
    ↓
启用插件
```

## 2. 非目标

v1 不实现以下能力：

- Go `.so` 动态注入主 Goravel 进程
- 任意第三方代码的无签名执行
- 插件市场、支付、授权计费系统
- 多主机插件集群调度
- 插件之间随意直接 import 业务实现
- 将 OpenAPI 自动推断为完整的后台页面设计
- 将 CMS、Forum、Trading、AI 等业务功能放入 Core

v1 的插件可以在运行时安装，但插件后端以独立进程运行，而不是注入已运行的主程序。

## 3. 核心决策

### 3.1 混合插件架构

```text
Application
├── Core Runtime
│   ├── Goravel Core
│   ├── Admin API
│   ├── Plugin Manager
│   ├── Plugin Gateway
│   └── ReactRouterAdmin Host
│
├── Built-in Modules
│   └── 与主程序一起发布的核心资源
│
└── Installable Plugins
    ├── 独立后端进程
    ├── 前端 ESM Bundle
    ├── Manifest
    ├── Migrations
    ├── Permissions
    ├── Menus
    └── OpenAPI Spec
```

Core 模块可以编译进主程序，保证认证、权限、插件管理等基础能力稳定。业务插件使用统一 SDK 打包成独立插件包，安装后由 Plugin Manager 管理。

### 3.2 后端使用进程边界

插件后端通过稳定的 HTTP 协议与主程序通信：

```text
Browser
  ↓
ReactRouterAdmin
  ↓
Goravel Core / Plugin Gateway
  ↓
Plugin Process
```

主程序负责：

- 身份认证
- 插件状态
- 权限和菜单
- API 转发
- 进程启动和停止
- 健康检查
- 日志和审计

插件负责：

- 业务 API
- 业务服务和模型
- 业务数据库迁移
- 业务任务和事件处理
- 前端资源和页面

插件后端不允许绕过主程序直接向浏览器暴露端口。所有外部访问必须经过 Core Gateway。

### 3.3 前端使用插件运行时

ReactRouterAdmin 保留当前 React Router Framework Mode 和 Resource Engine，不改造成 `createBrowserRouter` 应用。

插件前端通过稳定的 `PluginFrontendSDK` 注册：

- Resource
- Custom Page
- Navigation metadata
- Permission metadata
- Locale resources
- API Client

前端加载流程：

```text
登录
  ↓
获取已启用插件清单
  ↓
加载可信插件 entry.js
  ↓
执行插件 register(app)
  ↓
注册资源和页面
  ↓
根据后端菜单和权限生成 Sidebar
```

新安装插件后前端刷新一次即可获得新页面。v1 不要求在当前页面无刷新地热插拔 React 组件。

## 4. 目录设计

最终项目建议采用单仓库结构：

```text
go-reactrouter/
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── internal/
│   │   ├── pluginhost/
│   │   ├── gateway/
│   │   └── openapi/
│   └── tests/
│
├── admin/
│   ├── app/
│   │   ├── core/
│   │   ├── resource-engine/
│   │   ├── components/
│   │   ├── core-resources/
│   │   └── plugin-runtime/
│   └── generated/
│
├── plugins/
│   └── example-plugin/
│       ├── plugin.json
│       ├── backend/
│       └── frontend/
│
├── contracts/
│   ├── plugin-manifest.schema.json
│   ├── plugin-runtime.openapi.json
│   └── api-conventions.md
│
└── tools/
    ├── plugin-packager/
    ├── plugin-validator/
    └── openapi-codegen/
```

当前 `reactrouteradmin` 是前端基础仓库，`go-reactrouter` 是目标整合项目。整合时应保留 ReactRouterAdmin 的核心实现，不把 `docs/reactrouteradmin` 继续当作生产源码目录。

## 5. 插件包契约

### 5.1 Manifest

每个插件必须包含 `plugin.json`：

```json
{
  "id": "acme.inventory",
  "name": "inventory",
  "displayName": "Inventory",
  "version": "1.0.0",
  "apiVersion": "1",
  "coreRequires": ">=1.0.0 <2.0.0",
  "dependencies": [],
  "backend": {
    "entrypoint": "backend/inventory-plugin",
    "healthPath": "/health",
    "apiPrefix": "/api/v1/plugins/acme.inventory"
  },
  "frontend": {
    "entrypoint": "frontend/entry.js"
  },
  "permissions": "permissions.json",
  "menus": "menus.json",
  "openapi": "openapi.json",
  "signature": "signature.sig"
}
```

Manifest 是安装和启动的依据，不允许前端自行猜测插件能力。

### 5.2 插件生命周期

```text
discovered
    ↓
verifying
    ↓
installed
    ↓
enabling ───────→ enabled
    ↓                 ↓
failed          disabling
                      ↓
                  disabled
```

卸载流程为：

```text
enabled/disabled
    ↓
uninstalling
    ↓
uninstalled
```

生命周期语义：

- `installed`：文件和数据库迁移已完成，但业务尚未对用户开放
- `enabled`：后端进程、API、菜单和前端页面均可用
- `disabled`：保留文件和数据，但停止进程、API、菜单和任务
- `failed`：安装、迁移、启动或健康检查失败，需要保留错误原因
- `uninstalled`：插件程序和前端资源已移除，默认保留业务数据

### 5.3 版本和依赖

安装前必须验证：

- 插件 ID 唯一
- 版本符合 SemVer
- 核心版本满足 `coreRequires`
- 当前平台存在对应后端入口
- 所有依赖插件已安装且版本兼容
- 插件 API 版本受支持
- 签名验证通过

升级时采用：

```text
上传新版本
    ↓
校验和兼容性检查
    ↓
停止旧进程
    ↓
执行迁移
    ↓
启动新进程
    ↓
健康检查
    ↓
成功后切换版本
```

健康检查失败时必须恢复旧版本进程和旧版本路由，不允许出现“文件已覆盖但插件不可用”的半升级状态。

## 6. 后端 Plugin SDK

后端 SDK 负责抽象插件与宿主之间的稳定契约：

```go
type PluginDescriptor struct {
    ID           string
    Version      string
    APIVersion   string
    CoreRequires string
}

type PluginServer interface {
    Descriptor() PluginDescriptor
    RegisterRoutes(router Router) error
    Health(ctx context.Context) error
    Shutdown(ctx context.Context) error
}
```

插件 SDK 不直接依赖主程序内部实现，只依赖公开契约：

- 当前用户信息
- 权限检查
- 文件存储
- 设置读取
- 事件发布
- 日志
- API 路由
- 数据库连接或插件专用 schema

插件与插件之间禁止直接访问对方的数据库模型。跨插件能力必须使用：

- Core Service Contract
- Event Bus
- HTTP API
- 明确的接口包

## 7. Plugin Manager 和进程运行器

### 7.1 Plugin Manager

Plugin Manager 负责：

- 读取插件包
- 校验 Manifest
- 校验签名和文件完整性
- 检查依赖
- 安装和升级
- 执行迁移
- 注册权限和菜单
- 管理启停状态
- 调用 Process Runner
- 维护审计日志

### 7.2 Process Runner

Process Runner 负责：

- 创建插件运行目录
- 分配本地监听地址
- 注入必要环境变量
- 启动子进程
- 读取标准输出和错误日志
- 健康检查
- 超时停止
- 崩溃重启策略
- 进程退出后的状态更新

插件端口只能监听本机地址。主程序通过反向代理或内部 HTTP Client 转发请求。

### 7.3 运行时数据

Core 至少需要以下数据表：

```text
plugins
├── id
├── name
├── installed_version
├── state
├── manifest_json
├── install_path
├── enabled_at
├── installed_at
├── updated_at
└── last_error

plugin_versions
├── id
├── plugin_id
├── version
├── package_hash
├── package_path
├── openapi_path
├── installed_at
└── status

plugin_processes
├── id
├── plugin_id
├── pid
├── address
├── state
├── started_at
├── stopped_at
└── last_health_check_at
```

权限和菜单仍然使用 Core 的统一表，但必须增加 `owner_plugin_id`，以便停用或卸载插件时清理对应声明。

## 8. 权限、菜单和资源

插件声明权限：

```text
inventory.view
inventory.item.create
inventory.item.update
inventory.item.delete
```

后端必须在每个 API 操作中校验权限。前端 `Can` 组件只负责用户体验，不能承担安全责任。

菜单显示需要同时满足：

```text
插件已启用
    AND
用户拥有权限
    AND
前端入口可用
```

后端菜单 API 是菜单可见性的权威来源，前端插件只声明菜单元数据和页面实现。

资源定义保留 ReactRouterAdmin 当前模式：

```typescript
defineResource({
  name: 'inventory-items',
  data: inventoryProvider,
  columns: [...],
  fields: [...],
  actions: [...],
  permissions: {
    view: 'inventory.view',
    create: 'inventory.item.create',
    update: 'inventory.item.update',
    delete: 'inventory.item.delete',
  },
})
```

OpenAPI 负责类型和请求客户端，Resource 定义负责页面体验，不强行让 OpenAPI 自动生成所有页面。

## 9. OpenAPI 方案

### 9.1 单一契约链

```text
Goravel Controller / Request / Response DTO
                ↓
          Plugin OpenAPI
                ↓
         Swagger UI / Docs
                ↓
       Generated TypeScript Client
                ↓
       ResourceDataProvider Adapter
```

每个插件构建时生成自己的 `openapi.json`。Core 汇总 Core API 和已安装插件的 OpenAPI 文档：

```text
/docs
/docs/core
/docs/plugins/acme.inventory
/openapi.json
/openapi/plugins/acme.inventory.json
```

### 9.2 API 统一约定

成功响应：

```json
{
  "data": {},
  "message": "",
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  },
  "requestId": "..."
}
```

错误响应：

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The request is invalid.",
    "fields": {}
  },
  "requestId": "..."
}
```

所有资源 API 必须统一支持：

- 分页
- 搜索
- 排序
- 字段筛选
- 统一验证错误
- 统一权限错误
- 统一资源不存在错误

### 9.3 防止手写 API 链接

业务前端不得直接拼接 API URL。每个插件前端使用生成的 client：

```typescript
const inventoryProvider: ResourceDataProvider<InventoryItem> = {
  list: (query) => inventoryClient.items.list(query),
  find: (id) => inventoryClient.items.find(id),
  create: (values) => inventoryClient.items.create(values),
  update: (id, values) => inventoryClient.items.update(id, values),
  delete: (id) => inventoryClient.items.delete(id),
}
```

这样 API 路径、请求类型、响应类型和错误结构都由契约生成流程统一维护。

## 10. 安全设计

运行时安装插件意味着插件代码拥有较高权限，必须建立信任模型。

v1 安全要求：

- 默认只允许签名插件
- 插件包必须计算 SHA-256
- Manifest 和签名必须覆盖所有可执行文件和前端入口
- 安装前检查核心版本和平台
- 插件进程使用独立工作目录
- 插件不能直接暴露公网端口
- 插件 API 必须经过 Core Gateway
- 插件日志进入 Core 审计和运行日志
- 插件卸载默认不删除业务数据
- 安装、启用、停用、升级、卸载都写入审计日志
- 不可信前端插件使用 iframe 隔离，不允许直接注册宿主 React 组件

可信插件和不可信插件应分成两种安装模式：

```text
Trusted Plugin
└── 可注册 Resource、Page 和 React 组件

Sandboxed Plugin
└── 通过 iframe 或受限 UI 协议接入
```

## 11. 当前 ReactRouterAdmin 的适配

现有能力继续保留：

```text
app/core/admin              → 宿主上下文
app/core/api                → HTTP transport 和生成客户端适配层
app/core/auth               → 认证状态和会话
app/core/permissions        → 前端权限显示控制
app/core/navigation         → 后端菜单和插件导航
app/core/registry            → Resource 和插件注册
app/core/extensions          → PluginFrontendSDK 基础
app/resource-engine          → 通用资源页面
app/components/admin        → 通用管理组件
app/providers               → 应用 Provider 链
```

需要移出 Core 或重新分类的内容：

- `tasks`：删除或作为独立示例插件，不进入基础平台
- `site`：拆为 CMS/站点插件
- 示例 Dashboard analytics：替换为无业务数据的系统首页
- `chats`、`apps`、`help-center`：拆为具体业务插件或删除
- `users`、`roles`、`permissions`：保留为 Core 资源
- `media`：如果所有项目都需要文件管理，则保留为 Core；否则作为官方基础插件

## 12. 版本一验收标准

完成 v1 后，必须能验证：

1. 用户可以登录并访问管理后台。
2. 用户、角色、权限可以通过真实 Goravel API 管理。
3. 前端资源使用 OpenAPI 生成的客户端，不直接写 API URL。
4. 插件包可以通过后台上传或配置的插件源安装。
5. 安装时会检查签名、版本、依赖和平台。
6. 插件迁移可执行且失败时安装回滚。
7. 插件后端由 Process Runner 启动并完成健康检查。
8. 插件菜单仅在启用且用户有权限时显示。
9. 停用插件后 API、菜单、任务和前端页面均不可用。
10. 升级失败时能够恢复旧版本。
11. 卸载默认保留业务数据，并有清理权限和菜单的记录。
12. Swagger UI 能看到 Core API 和已安装插件 API。
13. 一个真实业务插件可以同时提供后端 API、Resource、Custom Page、权限、菜单、迁移和 OpenAPI。
