# 智能农机系统合并计划

阶段 0 审计日期：2026-06-27

## 1. 当前仓库事实

- 技术栈：前端 Vue 3、Vite、Pinia、Vue Router、Element Plus、ECharts、Three.js、Axios；后端 Spring Boot 3.2、Spring MVC、Spring Security OAuth2 Resource Server/JWT、Spring Data JPA、Flyway、WebSocket STOMP/SockJS、Eclipse Paho MQTT、Actuator/Prometheus。
- 前端目录：`frontend/src/main.js` 入口，`frontend/src/router/index.js` 使用 hash 路由，页面位于 `frontend/src/views`，状态位于 `frontend/src/store/index.js`，HTTP 客户端位于 `frontend/src/services/http.js`。
- 后端目录：`backend/src/main/java/com/smartharvester`，控制器位于 `controller`，实体位于 `entity`，服务位于 `service`，配置位于 `config`。
- 构建与测试命令：
  - 前端开发：`npm run dev`
  - 前端测试：`npm test`，实际脚本为 `node --test src/**/*.test.js`
  - 前端构建：`npm run build` 或 `npm run build:linux`
  - 后端测试/构建：Maven 项目，预期 `mvn test`、`mvn package`；本机此前使用本地 Maven 运行过，阶段 0 未执行构建测试。
- API 基础路径与响应包装：后端真实路径无 `/api`；开发前端通过 Vite proxy 将 `/api` 重写为空。正常响应直接返回对象/数组/Map/void；错误响应为 `{code,message,timestamp}`。
- 认证方式：`POST /auth/token` 获取 JWT，前端用 `Authorization: Bearer <token>`。角色包括 `ADMIN/DISPATCHER/DRIVER/VIEWER`。
- 权限模型：读接口需认证；POST/PUT 多数需 `ADMIN/DISPATCHER`；DELETE 需 `ADMIN`；MQTT 控制、回执和审计有细分角色限制。
- 现有实时通信：后端提供 `/ws` STOMP/SockJS endpoint，broker `/topic`，app prefix `/app`；后端 MQTT 自动重连并订阅 `harvester/+/status`、`harvester/+/sensor`、`harvester/+/control/ack` 等主题。前端当前未发现完整 WebSocket/MQTT 客户端封装，Dashboard 状态主要是静态展示。
- 现有功能与参考功能的重叠：设备、任务、传感器数据、传感器模拟器、EMQX 控制审计、AI 识别、北斗、控制计算、报表/大屏均已有雏形；参考前端可作为视觉和交互增量，不应整目录覆盖。

## 2. 差距清单

| 能力 | 已存在 | 需复用 | 需新增 | 风险 | 验收方式 |
|---|---:|---:|---:|---|---|
| 仓库基础审计 | 是 | 是 | 补持续记录 | `git` 命令不可用，无法确认版本状态 | `codex/preflight-report.md` 与本计划记录完整 |
| 统一 API 客户端 | 部分 | 是 | 将页面直接 axios 迁移到服务层 | 认证头/错误处理不一致 | 前端测试、手动登录后接口调用成功 |
| API 契约矩阵 | 部分 | 是 | 持续维护字段/权限/适配决定 | 前端按 Mock 猜字段 | `docs/API_CONTRACT_MATRIX.md` 与控制器一致 |
| 认证与权限 | 是 | 是 | 路由守卫、无权限 UI | 越权、401 reload 粗糙 | 401/403 场景验证 |
| Dashboard 视觉 | 是 | 是 | 真实数据适配与 loading/error/offline | 静态指标误导生产状态 | 首页数据来源可追踪，断线状态明确 |
| 设备管理 | 是 | 是 | DTO/表单校验/状态适配 | 状态 Body 裸字符串、硬删除 | CRUD 测试与 UI 二次确认 |
| 任务管理 | 是 | 是 | 进度面积/百分比适配 | 进度语义误用 | `completedArea` 范围校验验证 |
| 传感器数据 | 是 | 是 | 查询参数/时间格式适配 | 时间范围时区不明 | 时间范围查询手动验证 |
| 传感器模拟器 | 是 | 是 | 操作状态和 MQTT 错误 UI | 把“已发送”误认为“设备已处理” | MQTT 未连接/已连接两类验证 |
| EMQX/MQTT 控制 | 是 | 是 | Idempotency-Key、命令状态轮询 | 重复下发、把发布成功当执行成功 | 命令审计 `PUBLISHED/ACKNOWLEDGED/FAILED` 可见 |
| WebSocket | 后端有 | 是 | 前端 STOMP/SockJS 客户端封装 | 重连重复订阅、未清理监听 | 断线重连与卸载清理验证 |
| AI 识别 | 是 | 是 | 文件限制、坐标 DTO、错误 UI | 文件过大/结果坐标误读 | multipart 上传和结果渲染验证 |
| 北斗导航 | 是 | 是 | 请求 schema 和坐标系统一 | Map 入参无类型约束 | 路径规划/实时位置合同测试 |
| 构建部署 | 是 | 是 | 文档收敛与生产变量核验 | 密钥、默认密码、CORS | Docker/本地构建命令通过 |

## 3. 分阶段方案

### 阶段 0：仓库审计与接口契约确认

- 目标：不修改业务代码，只确认当前事实、接口契约、构建测试方式和高风险点。
- 修改文件：`codex/preflight-report.md`、`codex/merge-plan.md`、`docs/API_CONTRACT_MATRIX.md`。
- 数据迁移：无。
- 兼容策略：仅记录事实，不改接口。
- 测试命令：未运行构建测试；执行了只读/文档审计命令。
- 回滚方式：删除本阶段新增 Markdown 文件或还原对应 Markdown。

### 阶段 1：基础设施、API 适配层、认证和权限

- 目标：统一前端 API 访问入口，补齐认证头、错误拆包、401/403、权限判定和路由守卫。
- 修改文件：预计 `frontend/src/services/*`、`frontend/src/store/index.js`、`frontend/src/router/index.js`、必要测试。
- 数据迁移：无。
- 兼容策略：保留 `/api` 代理和真实后端无 `/api` 的现状；页面不直接判断多种响应结构。
- 测试命令：`npm test`、`npm run build`。
- 回滚方式：恢复服务层和路由守卫改动。

### 阶段 2：布局、主题、导航和 Dashboard

- 目标：把参考前端视觉按现有 Vue3/Element Plus 栈增量合并，保留现有路由和页面。
- 修改文件：预计 `DashboardView.vue`、公共组件、样式文件。
- 数据迁移：无。
- 兼容策略：静态展示必须标明 demo/离线，真实接口失败要进入错误或降级状态。
- 测试命令：`npm test`、`npm run build`，浏览器截图验证 1366x768 和 1920x1080。
- 回滚方式：恢复 Dashboard 和样式文件。

### 阶段 3：设备与任务管理

- 目标：围绕真实后端字段完善设备/任务 CRUD、状态更新和表单校验。
- 修改文件：预计 `MachineManagement.vue`、`TaskManagement.vue`、API 适配层和测试。
- 数据迁移：无。
- 兼容策略：设备状态更新发送裸字符串；任务进度用 `completedArea` 面积，UI 可显示百分比但提交面积。
- 测试命令：`npm test`、后端 `mvn test`（如 Maven 可用）。
- 回滚方式：恢复页面和适配层。

### 阶段 4：实时控制、WebSocket、MQTT 和命令审计

- 目标：实现可清理、可重连、无重复订阅的前端实时客户端，并正确展示控制命令生命周期。
- 修改文件：预计新增/修改 `frontend/src/realtime/*`、`ControlSystem.vue`、状态 store。
- 数据迁移：无。
- 兼容策略：下发命令必须生成 `Idempotency-Key`；UI 区分 `PUBLISHED` 与 `ACKNOWLEDGED`。
- 测试命令：前端测试、手动断线重连、MQTT 未连接场景验证。
- 回滚方式：关闭实时入口，恢复轮询/静态状态。

### 阶段 5：AI、传感器、模拟器和报表

- 目标：按真实接口完善 AI 上传、传感器时间范围、模拟器状态和报表数据聚合。
- 修改文件：预计 `AIVision.vue`、`SensorData.vue`、`SensorSimulator.vue`、`ReportsView.vue`。
- 数据迁移：无。
- 兼容策略：开放 Map 入参的北斗/控制计算先在前端适配层固化 DTO，不直接污染页面。
- 测试命令：`npm test`、`npm run build`、关键接口手动验证。
- 回滚方式：恢复对应页面。

### 阶段 6：性能、安全、测试、部署和文档

- 目标：补齐懒加载、长连接清理、权限边界、环境变量说明、验收文档。
- 修改文件：部署文档、测试、必要配置。
- 数据迁移：仅在明确批准后考虑 Flyway 迁移；默认无。
- 兼容策略：不新增生产依赖，除非证明现有栈无法满足并记录原因。
- 测试命令：前端测试/构建、后端测试、Docker 配置审计。
- 回滚方式：按文档和配置文件回滚。

## 4. 决策记录

| 日期 | 决策 | 依据 | 影响 |
|---|---|---|---|
| 2026-06-27 | 本轮只做阶段 0，不修改业务代码、不安装依赖、不覆盖旧项目 | 用户明确要求 | 仅新增/更新 Markdown 审计文档 |
| 2026-06-27 | 当前仓库真实后端契约优先于参考前端 Mock | `AGENTS.md` 信息优先级 | 后续合并必须走适配层，不按参考前端猜字段 |
| 2026-06-27 | 保留现有 Vue3/Vite/Pinia/Element Plus 技术栈 | 当前前端已是同类栈且可运行 | 参考前端按模块移植，不整目录覆盖 |
| 2026-06-27 | 前端继续通过 `/api` 代理，后端保持无 `/api` 控制器路径 | `vite.config.js` 与后端控制器事实 | 文档中明确基础路径差异，减少接口误判 |
| 2026-06-27 | 阶段 1 只新增/改造基础层，不迁移 UI 页面 | 用户要求禁止后续 UI 页面迁移 | 页面组件保持不动，Pinia store 改为调用统一 API 层 |
| 2026-06-27 | Mock 必须显式启用且生产构建禁止 Mock | `codex/tasks/01-foundation-and-api.md` 要求生产不静默降级 | `runtime.js` 新增 `VITE_API_MODE`、`mockEnabled` 和生产拦截 |
| 2026-06-27 | 现有构建脚本需兼容 `.ignored` 依赖布局 | 当前根层 `node_modules/vite/vue` 链接缺失，构建脚本找不到 Vite | `build-win.ps1` 构建前临时创建 junction，构建后清理，不安装新依赖 |
| 2026-06-27 | 阶段 2 只迁移调度总览布局与可复用组件 | 用户要求不得覆盖旧路由、旧权限和旧业务逻辑 | 路由和登录权限保持原状，Dashboard 使用新增 store/model 提供数据 |

## 5. 执行记录

- [x] 阶段 0：审计
- [x] 阶段 1：基础设施
- [x] 阶段 2：核心页面
- [x] 阶段 3：设备与任务管理
- [ ] 阶段 4：实时能力
- [ ] 阶段 4：扩展模块
- [ ] 阶段 5：验收

## 6. 最终验证

实际执行过的命令与结果：

- `tar -tf C:\Users\25741\Downloads\智能农机系统-Codex合并工具包.zip`：成功，确认工具包包含 `AGENTS.md`、`PLANS.md`、`codex/prompts/MASTER_MERGE_PROMPT.md`、`docs/API_CONTRACT_MATRIX.md`、`reference-frontend` 等。
- `tar -xOf ... AGENTS.md / PLANS.md / codex/prompts/MASTER_MERGE_PROMPT.md / docs/API_CONTRACT_MATRIX.md`：成功，完成阶段 0 规则读取。
- `git status --short`：失败，当前环境未识别 `git` 命令，因此无法确认 Git 状态；后续在具备 Git 的环境需补跑。
- `tar -xOf ... scripts/preflight.py | python -`：成功，写出 `codex/preflight-report.md`。
- `rg -n ... frontend/src`：成功，定位前端路由、Pinia、axios、WebSocket/MQTT 静态展示和直接 axios 调用。
- `rg -n ... backend/src/main`：成功，定位后端控制器、安全配置、WebSocket、MQTT、JWT、权限规则。
- `Get-Content` 读取 `frontend/package.json`、`vite.config.js`、`backend/pom.xml`、`application*.yml`、控制器、实体、服务和部署文件：成功。

未执行命令与原因：

- 未执行 `npm test`、`npm run build`、`mvn test`：本轮目标是阶段 0 审计与计划，用户要求不修改业务代码、不安装新依赖；构建测试方式已审计，实际验证留到后续实施阶段。
- 未执行参考前端复制或安装：用户明确禁止覆盖旧项目和安装依赖。

已知限制：

- 当前环境 `git` 不可用，不能判断工作区是否有未提交变更。
- `rg --files` 输出包含 `node_modules`、`dist`、`target` 和运行日志，说明仓库目录内有生成产物；本轮不清理。
- `backend/src/main/resources` 中存在若干 Java 源码样式文件和临时脚本痕迹；本轮只记录，不移动或删除。
- WebSocket 前端真实连接封装未发现；Dashboard 的 WebSocket/MQTT 状态不应视为真实连接状态。

推荐的非破坏式合并路径：

1. 先统一 API 适配层和权限/错误处理，解决直接 axios 与控制命令幂等头问题。
2. 再合并视觉布局和 Dashboard，所有静态指标逐步替换为真实 API 或明确 demo 来源。
3. 然后按设备、任务、传感器、控制、AI/北斗/报表的顺序增量移植参考能力。
4. 每阶段只修改相关模块，运行已有测试和构建，更新本文件的执行记录。

需要人工决定的问题：

- 是否允许后续安装 STOMP/SockJS 前端客户端依赖，或仅使用现有 `socket.io-client`/原生 WebSocket 方案。
- 设备/任务状态更新是否继续接受裸字符串，还是后续新增 DTO 兼容 `{status}`。
- 任务进度 UI 是否以百分比显示但提交 `completedArea`，以及面积单位是否固定。
- `/beidou` 与 `/control-system` 的开放 `Map`/query 数组参数是否需要稳定 DTO。
- 生产环境是否保留 demo capability 模式，前端如何提示 demo 与真实能力差异。

## 7. 本轮读取的规则与参考文件

- 目标仓库根目录目前未发现 `AGENTS.md`、`PLANS.md`、`codex/prompts/MASTER_MERGE_PROMPT.md`、`requirements/智能农机系统功能清单.md`；这些文件来自 `C:\Users\25741\Downloads\智能农机系统-Codex合并工具包.zip`，本轮只读取，不复制到目标仓库。
- 已读取工具包 `AGENTS.md`：确认当前仓库真实业务、真实后端契约和部署约束优先于 `reference-frontend`。
- 已读取工具包 `PLANS.md`：确认 `codex/merge-plan.md` 结构和阶段记录要求。
- 已读取工具包 `codex/prompts/MASTER_MERGE_PROMPT.md`：确认本轮仅执行阶段 0，只允许更新审计和计划 Markdown。
- 已读取工具包 `codex/tasks/00-audit-and-plan.md`：确认本轮不得修改业务代码。
- 已读取工具包 `requirements/智能农机系统功能清单.md`：确认目标功能覆盖调度总览、设备、任务、实时控制、AI、传感器、模拟器、报表、登录权限及对应后端接口。
- 已读取当前仓库 `docs/API_CONTRACT_MATRIX.md`：本轮继续按真实后端控制器核验和填写。

## 8. 原有代码、功能清单与 reference-frontend 对比

| 领域 | 当前仓库事实 | 功能清单要求 | reference-frontend 能力 | 阶段 0 结论 |
|---|---|---|---|---|
| 技术栈 | Vue 3、Vite 4、JavaScript、Pinia 2、Element Plus 2.4、Axios 1.5、ECharts、Three.js、`socket.io-client` | 企业级前端、多页面业务 | Vue 3、Vite 6、TypeScript、Pinia 3、Element Plus 2.9、Axios 1.8、ECharts、`mqtt` | 不升级/覆盖技术栈；参考 TS 类型和结构，落到现有 JS/Vite4 工程 |
| 路由 | `createWebHashHistory`，路由在 `frontend/src/router/index.js`，无全局守卫 | 所有页面可访问，登录权限入口 | 有 `MainLayout`、`/login`、`beforeEach` 守卫 | 保留现有路由文件，后续增量加守卫，不整包替换 |
| 登录 | `App.vue` 用 `authStore.token` 控制登录页/应用页 | Token 和角色存储 | 独立 LoginView 和路由守卫 | 迁移思路是保留现有 auth store，补路由级守卫和角色菜单 |
| API 客户端 | `services/http.js` 已注入 Bearer，但多个页面直接 `axios` | 页面不直接依赖 Mock DTO | `api/http.ts` 返回 `response.data`，有 `X-Request-Id` | 复用现有 `apiClient`，后续迁移页面直连 axios |
| WebSocket | 后端 `/ws` STOMP/SockJS，前端只有 URL 配置和静态状态 | 连接状态、心跳、断线恢复 | 原生 WebSocket wrapper，非 STOMP | 不能直接照搬；需匹配后端 STOMP/SockJS 或人工决定依赖 |
| MQTT | 后端 Paho MQTT/EMQX 控制审计，前端通过 HTTP 控制 | 命令 ID、幂等、回执状态 | 前端直连 MQTT over WebSocket 并 publish | 不直接采用前端 MQTT 直连；优先保留后端 `/emqx` 控制审计链路 |
| Dashboard | 已改为高保真静态大屏 | 调度总览全量指标 | 组件化 Kpi/Gis/Chart/Alarm/Event | 后续应从静态数据迁移到真实 API/状态 store |
| 设备/任务 | 已接真实后端，部分直接 store | CRUD、状态、进度 | 参考页面与 stores | 保留当前页面，补 DTO/校验/错误状态 |
| AI/传感器/报表 | 已有页面，多处直接 axios | AI 检测、传感器查询、报表 | 参考页面更模块化 | 迁移 API 层和 UI 状态，不覆盖页面 |

## 9. 冲突、迁移与保留文件清单

### 必须保留

| 文件/目录 | 原因 |
|---|---|
| `backend/src/main/java/com/smartharvester/**` | 当前真实后端契约、认证、权限、MQTT/WebSocket 和数据模型来源 |
| `backend/src/main/resources/application*.yml` | 当前端口、数据库、JWT、CORS、MQTT、能力开关和生产配置来源 |
| `backend/src/main/resources/db/migration/*` | Flyway 管理的数据库结构与演示数据，不得在前端合并阶段改动 |
| `frontend/package.json`、`frontend/package-lock.json` | 当前目标工程依赖和脚本来源，不用参考工程覆盖 |
| `frontend/vite.config.js` | 当前 `/api` 代理重写策略来源 |
| `frontend/src/router/index.js` | 现有页面路径已可用，后续只增量改守卫 |
| `frontend/src/store/index.js` | 当前认证、设备、任务、传感器状态入口 |
| `frontend/src/services/http.js`、`frontend/src/services/error.js` | 当前 API 客户端基础，后续复用扩展 |
| `docker-compose.prod.yml`、`DEPLOYMENT.md` | 当前生产部署约束 |

### 需要迁移或适配

| 当前文件 | 迁移动作 | 参考来源 |
|---|---|---|
| `frontend/src/views/DashboardView.vue` | 从静态大屏逐步接真实 store/API，保留视觉，不把 WebSocket/MQTT 写死为已连接 | `reference-frontend/src/views/DashboardView.vue`、组件目录 |
| `frontend/src/views/ControlSystem.vue` | 改用统一 `apiClient`；继续保留 `Idempotency-Key`；区分 `PUBLISHED` 与 `ACKNOWLEDGED` | `reference-frontend/src/views/ControlSystem.vue` |
| `frontend/src/views/SensorData.vue`、`SensorSimulator.vue`、`ReportsView.vue`、`AIVision.vue` | 迁移直接 axios 到服务层，补加载/错误/权限/取消或竞态保护 | `reference-frontend/src/api/*`、views |
| `frontend/src/App.vue`、`frontend/src/router/index.js` | 将整体 token 判断升级为路由守卫，保留现有登录逻辑或拆出 LoginView | `reference-frontend/src/router/index.ts`、`LoginView.vue` |
| `frontend/src/components/common/*` | 可吸收参考 `KpiCard/PanelFrame/StatusTag/BaseChart` 的职责边界，但需符合现有 CSS | `reference-frontend/src/components/*` |
| `frontend/src/config/runtime.js` | 明确 `VITE_WS_URL` 与后端 STOMP/SockJS 兼容策略 | `reference-frontend/src/realtime/websocket.ts` 仅作思路 |

### 会发生冲突或不能直接覆盖

| 文件/能力 | 冲突点 | 处理决定 |
|---|---|---|
| `reference-frontend/package.json` | Vite/Pinia/Vue/Element Plus 版本更高，新增 TypeScript、Sass、`mqtt`、`vue-tsc` | 不覆盖、不安装依赖；后续如需依赖单独论证 |
| `reference-frontend/src/router/index.ts` | 使用 TS、`@` alias、`MainLayout`、独立 login 路由，当前工程为 JS 且登录在 `App.vue` | 只借鉴守卫逻辑 |
| `reference-frontend/src/api/http.ts` | token key 为 `smart-agri-token`，当前为 `smart-harvester-token`；响应拆包方式不同 | 不直接复制，合并到现有 `http.js` |
| `reference-frontend/src/realtime/mqtt.ts` | 前端直连 MQTT topic `machines/{id}/control`，当前真实后端要求经 `/emqx` 审计和幂等 | 不采用前端直连控制 |
| `reference-frontend/src/realtime/websocket.ts` | 原生 WebSocket，而后端是 STOMP/SockJS endpoint `/ws` | 需重新设计客户端连接 |
| `frontend/src/views/*` | 当前多处中文编码显示异常，但可能是既有文件编码/控制台显示问题 | 阶段 0 不修复；后续单独做编码与文案整理 |
| `backend/src/main/resources/MQTT*.java`、`tempfile_*.bash`、`机器人踢足球/.venv` | 资源目录内存在疑似遗留源码/临时文件/虚拟环境 | 阶段 0 只记录；清理属于高风险，需要单独确认 |

## 10. 阶段 0 命令记录补充

| 命令 | 结果 |
|---|---|
| `Get-ChildItem -LiteralPath . -Force` | 成功，确认根目录包含 `backend`、`frontend`、`docs`、`codex`、`observability`、部署脚本和 Docker 文件。 |
| `where.exe git` | 失败，当前环境找不到 `git`，因此无法执行 Git 状态检查。 |
| `tar -tf 智能农机系统-Codex合并工具包.zip` | 成功，确认规则、任务、API 矩阵、功能清单和 reference-frontend 均在工具包内。 |
| `tar -xOf ... AGENTS.md / PLANS.md / MASTER_MERGE_PROMPT.md / 00-audit-and-plan.md` | 成功，已读取阶段 0 规则。 |
| `python -c zipfile...requirements...` | 成功，读取 `requirements/智能农机系统功能清单.md`；文件名在 zip 中显示为编码兼容名，但内容 UTF-8 正常。 |
| `Get-ChildItem frontend/src -Recurse -File` | 成功，列出当前前端源文件、页面、组件、store、services、utils、styles。 |
| `Get-ChildItem backend/src/main/java/com/smartharvester -Recurse -File` | 成功，列出后端应用入口、config、controller、entity、repository、security、service。 |
| `rg -n "axios|apiClient|WebSocket|MQTT|SecurityFilterChain|@RequestMapping|..."` | 成功，定位前端 API 调用和后端接口/认证/实时通信配置。 |

本阶段未运行 `npm install`、`npm test`、`npm run build`、`mvn test`，原因是用户明确要求只执行阶段 0、不要安装依赖、不要修改业务代码；构建和测试命令已记录到计划，留到后续实施阶段执行。

## 11. 阶段 1 执行记录

阶段范围：只完成 `codex/tasks/01-foundation-and-api.md`，包括现有构建系统适配、统一 API 请求层、Token/认证适配、真实后端 DTO、错误响应和环境变量处理；未开始 UI 页面迁移，未使用 Mock 掩盖真实接口问题，未安装新依赖。

### 变更文件

| 文件 | 变更 |
|---|---|
| `frontend/src/config/runtime.js` | 新增 `VITE_API_MODE`、`apiMode`、`mockEnabled`；生产构建禁止 `VITE_API_MODE=mock`。 |
| `frontend/src/services/http.js` | 保留现有 axios client，新增 `X-Request-Id`、统一响应拆包 helper、请求取消 helper、Token 注入和 401 清理逻辑。 |
| `frontend/src/services/error.js` | 新增 `normalizeApiError`，保留 `describeApiError`；统一提取 `status/code/message/timestamp/requestId`。 |
| `frontend/src/services/auth.js` | 新增 Token、用户名、角色存储适配和角色判断，兼容浏览器/测试环境。 |
| `frontend/src/services/permissions.js` | 新增路由权限和操作权限映射，基于后端 `ROLE_*` 模型。 |
| `frontend/src/services/request.js` | 新增无 axios 依赖的 requestId、响应拆包和取消控制工具，便于测试和复用。 |
| `frontend/src/services/api-contracts.js` | 新增真实后端 DTO、枚举、文本 body、任务进度参数和幂等键工具。 |
| `frontend/src/services/api.js` | 新增 API 适配层：auth、capabilities、machines、tasks、sensor-data、emqx；复用 DTO contract，不引入 Mock envelope。 |
| `frontend/src/store/index.js` | Pinia store 改为调用统一 API 层；页面 action 名称保持不变。 |
| `frontend/scripts/build-win.ps1` | 适配当前 `.ignored` 依赖布局：构建前临时 junction 到根层 `node_modules`，构建后清理；不下载、不安装依赖。 |
| `frontend/src/config/runtime.test.js` | 新增 runtime/mock 模式测试。 |
| `frontend/src/services/auth.test.js` | 新增认证存储和角色判断测试。 |
| `frontend/src/services/api.test.js` | 新增 DTO、请求形态、幂等键、权限映射测试。 |
| `frontend/src/services/error.test.js` | 扩展错误规范化和 requestId 测试。 |

### 冲突、迁移与保留

| 类型 | 文件/问题 | 处理 |
|---|---|---|
| 保留 | `frontend/src/views/**` | 阶段 1 未迁移 UI 页面。 |
| 保留 | `frontend/package.json`、`frontend/vite.config.js` | 未覆盖现有依赖与代理配置。 |
| 迁移 | `frontend/src/store/index.js` | 已迁移到统一 API 层，但页面直连 axios 留到后续阶段。 |
| 冲突 | `node_modules` 根层缺少 `vite/vue/...` 链接，依赖实际在 `.ignored` | 已在 `build-win.ps1` 做临时链接适配；未执行 `npm install`。 |
| 待迁移 | `ControlSystem.vue`、`SensorData.vue`、`SensorSimulator.vue`、`ReportsView.vue`、`AIVision.vue` 中直接 axios | 阶段 1 只记录，不迁移页面。 |

### 本阶段实际命令与结果

| 命令 | 结果 |
|---|---|
| `tar -xOf ... codex/tasks/01-foundation-and-api.md` | 成功，读取阶段 1 要求。 |
| `Get-Content frontend/package.json / vite.config.js / services/*.js / store/index.js / docs/API_CONTRACT_MATRIX.md` | 成功，确认真实技术栈、脚本、API 客户端和 store 现状。 |
| `node --test src/**/*.test.js`（红灯） | 失败符合预期：缺少 `api.js`、`auth.js`、`normalizeApiError`、runtime mock 字段。 |
| `node --test src/**/*.test.js`（绿灯） | 成功，14 个测试通过；测试不依赖临时 `node_modules` junction。 |
| `node --check src/services/api.js ... src/store/index.js` | 成功，改动文件语法检查通过；项目无 `type-check` 脚本，当前为 JS/Vite 工程。 |
| `pnpm run` | 超时，当前环境中 pnpm 脚本枚举卡住；未安装依赖。 |
| `powershell -File ./scripts/build-win.ps1`（适配前） | 失败，找不到 `Z:\node_modules\vite\bin\vite.js`，根因是当前依赖在 `node_modules/.ignored`。 |
| `pnpm exec vite build` | 超时，未继续等待；未安装依赖。 |
| `node .\node_modules\.pnpm\vite@4.5.14\node_modules\vite\bin\vite.js build` | 失败，Rollup 无法解析根层 `vue`，进一步确认根层依赖链接缺失。 |
| `powershell -File ./scripts/build-win.ps1`（适配后） | 成功，Vite 4.5.14 构建通过，1676 个模块转换，输出 `frontend/dist`；仅有 Element Plus chunk 大于 500 kB 警告。 |
| `git status --short`（bundled git） | 失败，当前目录不是 Git 仓库。 |

### 验证结论

- 已完成阶段 1 基础层，不包含后续 UI 页面迁移。
- 未安装新依赖，未覆盖旧项目，未引入 Mock 兜底。
- 测试通过：`node --test src/**/*.test.js`，14/14。
- 构建通过：`scripts/build-win.ps1`，退出码 0；存在既有 chunk 体积警告，留到性能阶段处理。

## 12. 阶段 2 执行记录

阶段范围：只执行 `codex/tasks/02-layout-dashboard.md`。本阶段完成调度总览、KPI、GIS、图表、告警和事件区域；未覆盖旧路由、旧权限、旧登录逻辑，未开始下一阶段。

### 变更文件

| 文件 | 变更 |
|---|---|
| `frontend/src/utils/dashboardModel.js` | 新增 `buildDashboardSnapshot`，由真实 machine/task/capability DTO 组装 KPI、TOP5、任务环图、告警、事件、地块和趋势数据。 |
| `frontend/src/utils/dashboardModel.test.js` | 新增 Dashboard 快照模型测试，覆盖 KPI、任务进度、TOP5、告警、事件和地块。 |
| `frontend/src/store/index.js` | 新增 `useDashboardStore`，通过阶段 1 统一 API 层加载 machines/tasks/capabilities，并输出 Dashboard snapshot。 |
| `frontend/src/components/dashboard/DashboardPanel.vue` | 新增统一面板容器组件。 |
| `frontend/src/components/dashboard/KpiCard.vue` | 新增 KPI 卡组件。 |
| `frontend/src/components/dashboard/GisMap.vue` | 新增 GIS/地块/轨迹/设备位置组件。 |
| `frontend/src/components/dashboard/TrendChart.vue` | 新增 ECharts 折线图组件，挂载 resize 监听，卸载时 remove listener 并 dispose chart。 |
| `frontend/src/components/dashboard/DashboardTable.vue` | 新增告警/事件通用表格组件，支持空状态和插槽。 |
| `frontend/src/views/DashboardView.vue` | 由单文件硬编码大屏改为组件化 Dashboard，保留原路由跳转和登录退出逻辑，增加加载/错误/空状态。 |

### 保留与未迁移

| 类型 | 文件/能力 | 处理 |
|---|---|---|
| 保留 | `frontend/src/router/index.js` | 未修改旧路由。 |
| 保留 | `frontend/src/App.vue` | 未修改旧登录/权限入口。 |
| 保留 | 设备、任务、控制、AI、传感器、报表页面 | 阶段 2 未迁移这些页面。 |
| 未引入 | reference-frontend 的 TypeScript、Sass、路由守卫、MQTT/WebSocket 客户端 | 只借鉴视觉和组件边界，不覆盖目标工程技术栈。 |

### 本阶段实际命令与结果

| 命令 | 结果 |
|---|---|
| `tar -xOf ... codex/tasks/02-layout-dashboard.md` | 成功，读取阶段 2 要求。 |
| `tar -xOf ... reference-frontend/src/views/DashboardView.vue / components/*.vue` | 成功，读取参考 Dashboard、KPI、Panel、GIS 组件。 |
| `node --test src/utils/dashboardModel.test.js`（红灯） | 失败符合预期：`buildDashboardSnapshot` 尚未导出。 |
| `node --test src/utils/dashboardModel.test.js`（绿灯） | 成功，Dashboard 模型测试通过。 |
| `node --test src/**/*.test.js` | 成功，15 个测试通过。 |
| `node --check src/utils/dashboardModel.js; node --check src/store/index.js` | 成功，JS 语法检查通过。 |
| `powershell -File ./scripts/build-win.ps1` | 成功，Vite 构建通过；仅有 Element Plus/ECharts chunk 体积警告。 |
| Browser viewport 1366×768 / 1920×1080 | 已尝试；登录页可见，自动化点击本地登录表单时浏览器控制连接超时，未能完成截图式验收；未因此修改认证逻辑。 |

### 验证结论

- 自动化测试通过：15/15。
- 构建通过：Vite 构建退出码 0。
- Dashboard 数据不再在组件内写死生产样例，改由 `useDashboardStore` 和 `dashboardModel` 生成。
- ECharts 图表组件已实现 resize/dispose 生命周期。
- 浏览器自动化登录受工具连接超时影响，保留为未完成的人工视觉复核项；本轮没有开始下一阶段。
## Stage 04 Runtime Control Execution Record

Scope: executed `codex/tasks/04-realtime-control.md` only. No UI migration for later AI, sensor, simulator, report, or final hardening stages was started.

Changed files:

| File | Change |
|---|---|
| `frontend/src/views/ControlSystem.vue` | Migrated realtime control page to the unified EMQX API layer; added real machine-status command gating, duplicate-send loading guard, parameter range validation, command ID display, audit polling, failure reason display, and cleanup on unmount. |
| `frontend/src/services/api.js` | Added EMQX audit list and by-command API methods while preserving backend `Idempotency-Key` command submission. |
| `frontend/src/utils/controlModel.js` | Added command lifecycle mapping, backend command/status constraints, parameter validation, bounded reconnect-delay calculation, and duplicate subscription registry. |
| `frontend/src/utils/controlModel.test.js` | Added tests for command state machine, validation, reconnect delay, and duplicate subscription cleanup. |

Verification commands and results:

| Command | Result |
|---|---|
| `node --test src/utils/controlModel.test.js` | Passed, 5/5 tests. |
| `node --check src/utils/controlModel.js; node --check src/services/api.js` | Passed. |
| `node --test src/**/*.test.js` | Passed, 25/25 tests. |
| `powershell -File ./scripts/build-win.ps1` | Passed, Vite build succeeded; existing Element Plus/ECharts large-chunk warning remains. |

Notes:

- Browser-side production MQTT credentials were not introduced; control remains routed through backend `/emqx/machines/{machineId}/control`.
- STOMP/SockJS runtime dependency was not installed. This stage adds reconnect/backoff and subscription dedupe logic as dependency-free frontend model code, with integration left constrained by the current dependency policy.
## Stage 05 AI Sensors Reports Execution Record

Scope: executed `codex/tasks/05-ai-sensors-reports.md` only. No final hardening changes were started in this stage.

Changed files:

| File | Change |
|---|---|
| `frontend/src/services/api.js` | Added AI vision, sensor data, and sensor simulator API adapters; expanded sensor data query/delete methods. |
| `frontend/src/services/permissions.js` | Added `sensor:delete` mapped to ADMIN, matching backend DELETE rules. |
| `frontend/src/utils/analyticsModel.js` | Added AI image validation, detection box normalization, sensor filter/sort/pagination, simulator validation, sensor summary, report rows, and CSV encoding helpers. |
| `frontend/src/utils/analyticsModel.test.js` | Added boundary tests for AI upload, boxes, sensor paging, simulator input, CSV escaping, and sensor summary. |
| `frontend/src/views/AIVision.vue` | Migrated from direct axios to `aiVisionApi`; added MIME/size validation, preview cleanup, backend pixel-box overlay, and error state. |
| `frontend/src/views/SensorData.vue` | Migrated to `sensorDataApi`; added device/type/time filters, frontend paging/sorting adapter, unit display, and ADMIN-only delete affordance. |
| `frontend/src/views/SensorSimulator.vue` | Migrated to `sensorSimulatorApi`; added idempotent button states, backend-constraint validation, status sync, and record refresh. |
| `frontend/src/views/ReportsView.vue` | Migrated sensor reads to API layer; reports now use true machine/task APIs and explicitly labeled replaceable frontend sensor aggregation. |

Verification commands and results:

| Command | Result |
|---|---|
| `node --test src/utils/analyticsModel.test.js` | Passed, 6/6 tests. |
| `node --check src/utils/analyticsModel.js; node --check src/services/api.js; node --check src/services/permissions.js` | Passed. |
| `node --test src/**/*.test.js` | Passed, 31/31 tests. |
| `powershell -File ./scripts/build-win.ps1` | Passed, Vite build succeeded; existing Element Plus/ECharts large-chunk warning remains. |

Notes:

- Backend currently lacks report statistics and sensor pagination/sorting endpoints. The UI uses explicit frontend adapter functions for those gaps rather than presenting them as real backend statistics.
- Sensor deletion follows the actual backend authorization model: DELETE requires ADMIN.
## Stage 06 Final Hardening Execution Record

Scope: executed `codex/tasks/06-final-hardening-review.md`.

Changed files:

| File | Change |
|---|---|
| `docs/MERGE_ACCEPTANCE.md` | Added final acceptance checklist, verification evidence, residual risks, and rollback guidance. |
| `.env.production.example` | Added `VITE_API_MODE`, `VITE_BACKEND_TARGET`, and `VITE_WS_URL` production variables. |
| `README.md` | Added Codex merge status, verified commands, and production notes. |
| `DEPLOYMENT.md` | Added production hardening notes for API mode, WebSocket URL, MQTT credentials, and backend test prerequisite. |
| `docs/API_CONTRACT_MATRIX.md` | Added final note clarifying historical axios risk text and current frontend adapter gaps. |
| `frontend/src/views/IntegratedView.vue` and `frontend/src/components/left/WeatherPanel.vue` | Removed debug `console.log` statements. |

Verification results for this stage:

- `node --test src/**/*.test.js`: passed, 31/31 tests.
- `powershell -File ./scripts/build-win.ps1`: passed; existing Element Plus/ECharts large-chunk warnings remain.
- `rg -n "console\\.log|debugger" frontend/src backend/src/main/java`: no matches; ripgrep exit code 1 indicates no matches.
- Backend Maven tests: not run because `mvn` and Maven wrapper are unavailable in this environment; Java 17 is installed.
