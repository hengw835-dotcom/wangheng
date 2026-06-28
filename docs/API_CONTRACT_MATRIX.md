# API 契约核验矩阵

本矩阵基于阶段 0 审计结果填写。当前仓库以后端 `backend/src/main/java/com/smartharvester/controller` 的实际实现为准；前端开发态通过 Vite 将 `/api/*` 代理并重写到后端无 `/api` 前缀路径。

## 统一契约结论

- 后端真实基础路径：控制器路径不含 `/api`，例如 `/auth/token`、`/machines`、`/tasks`。开发前端调用 `/api/*`，由 `frontend/vite.config.js` 去掉 `/api` 后代理到 `http://localhost:8086`。
- 正常响应包装：无统一 `{ code, data, message }` 包装，多数接口直接返回对象、数组、`Map` 或 `void`。
- 错误响应包装：`ApiExceptionHandler.ApiError`，形如 `{ code, message, timestamp }`；401/403 由 Security JSON handler 返回，需后续单独核验字段。
- 认证方式：`POST /auth/token` 返回 `accessToken`、`tokenType: Bearer`、`expiresAt`、`roles`；前端通过 `Authorization: Bearer <token>` 调用受保护接口。
- 权限粗粒度规则：读接口需已认证；POST/PUT 默认 `ADMIN` 或 `DISPATCHER`；DELETE 仅 `ADMIN`；`POST /sensor-data` 允许 `ADMIN` 或 `DRIVER`；控制命令/审计有单独角色限制。
- 分页：当前业务列表接口均未分页，直接返回 `List<T>`。

| 模块 | 预期方法与路径 | 前端用途 | 必须核验 | 实际情况 / 适配决定 |
|---|---|---|---|---|
| 登录 | `POST /auth/token` | 获取 Token | 请求字段、Token 位置、过期时间、刷新机制、响应包装 | 已实现。Body 为 `{username,password}`；返回 `{accessToken,tokenType,expiresAt,roles}`；无刷新 Token；前端需保存 `accessToken` 并发送 `Authorization: Bearer`。 |
| 能力 | `GET /capabilities` | 功能开关 | 字段名、缺省行为 | 已实现。返回 `{aiVision,navigation,control}`，值来自 `app.capabilities.*`，默认 `demo`。 |
| 设备 | `GET /machines` | 设备列表 | 分页、字段、状态枚举 | 已实现。直接返回数组；无分页。字段来自 `AgriculturalMachine`：`id,machineId,model,status,location,lastUpdated,parameters`。状态校验枚举：`ONLINE/OFFLINE/WORKING/IDLE/MAINTENANCE/ERROR/PAUSED/STOPPED`。 |
| 设备 | `GET /machines/{id}` | 设备详情 | ID 类型、404 行为 | 已实现。路径变量实际为 `machineId` 字符串。若服务层返回 `null` 时可能不是 404，后续需补强；`update/delete` 使用 `NoSuchElementException` 返回 404。 |
| 设备 | `POST /machines` | 新增设备 | 必填字段、校验错误 | 已实现。Body 为完整 `AgriculturalMachine`；`machineId/model` 必填，`machineId` 正则 `[A-Za-z0-9_-]{1,64}`。成功返回创建后的对象。 |
| 设备 | `PUT /machines/{id}` | 编辑设备 | 全量还是部分更新 | 已实现。实际 `{id}` 为 `machineId`；全量更新 `model,status,location,parameters`；成功返回对象。 |
| 设备 | `PUT /machines/{id}/status` | 更新状态 | Body 结构、合法状态流转 | 已实现但 Body 是裸字符串 `String status`，不是 JSON 对象；服务层未显式校验状态枚举，实体校验可能不覆盖该路径。前端适配层应发送纯文本或后续后端补 DTO。 |
| 设备 | `DELETE /machines/{id}` | 删除设备 | 关联任务限制、软删除 | 已实现。实际 `{id}` 为 `machineId`；硬删除；未看到关联任务限制或软删除。高风险：删除前需 UI 二次确认。 |
| 任务 | `GET /tasks` | 任务列表 | 分页、状态、进度单位 | 已实现。直接返回数组；无分页。字段：`id,taskId,machineId,fieldName,startTime,endTime,status,targetArea,completedArea,estimatedYield`。 |
| 任务 | `GET /tasks/{id}` | 任务详情 | DTO 与时间格式 | 已实现。实际 `{id}` 为 `taskId` 字符串；时间由 Jackson 序列化 `Date`。未找到 null 转 404 保护，需后续核验。 |
| 任务 | `GET /tasks/machine/{machineId}` | 设备任务 | 空结果行为 | 已实现。返回数组，空结果应为空数组。 |
| 任务 | `GET /tasks/status/{status}` | 状态筛选 | 状态枚举 | 已实现。查询直接按字符串状态过滤；创建/更新服务层有效状态为 `PENDING/IN_PROGRESS/COMPLETED`。 |
| 任务 | `POST /tasks` | 创建任务 | 地块、设备关联约束 | 已实现。Body 为 `HarvestTask`；服务端生成 `taskId`、状态 `PENDING`、`startTime`、`completedArea=0`；未看到机器存在性约束。 |
| 任务 | `PUT /tasks/{id}/status` | 更新任务状态 | 状态机、并发冲突 | 已实现。Body 是裸字符串；只允许 `PENDING/IN_PROGRESS/COMPLETED`；完成时设置 `endTime` 并将 `completedArea=targetArea`；未看到并发控制。 |
| 任务 | `PUT /tasks/{id}/progress` | 更新进度 | 百分比范围、幂等性 | 已实现。参数是 query `completedArea`，表示面积而非百分比；范围 `0..targetArea`；前端不可按百分比直接提交。 |
| 任务 | `DELETE /tasks/{id}` | 删除任务 | 运行中任务限制 | 已实现。实际 `{id}` 为 `taskId`；硬删除；未看到运行中限制。 |
| 传感器 | `POST /sensor-data` | 上报数据 | 时间戳、单位、数据类型 | 已实现。Body 为 `SensorData`：`machineId,sensorType,value,unit,timestamp,location`；`machineId/sensorType` 必填。权限允许 `ADMIN/DRIVER`。 |
| 传感器 | `GET /sensor-data/machines` | 可选设备 | 返回结构 | 已实现。返回 `List<String>` 设备 ID。 |
| 传感器 | `GET /sensor-data/machine/{machineId}` | 按设备查询 | 分页、排序 | 已实现。返回数组；未分页；排序取决于 repository，需后续核验。 |
| 传感器 | `GET /sensor-data/machine/{machineId}/type/{type}` | 类型筛选 | 类型枚举、单位 | 已实现。实际 path 变量名 `sensorType`；未看到类型枚举集中定义。 |
| 传感器 | `GET /sensor-data/machine/{machineId}/time-range` | 时间范围 | 参数名、时区、区间边界 | 已实现。query 为 `start`、`end`，类型 `java.util.Date`；前端需使用 Spring 可解析日期格式，时区边界待核验。 |
| 传感器 | `DELETE /sensor-data/{id}` | 删除记录 | 权限、审计 | 已实现。`id` 为数据库 Long；DELETE 仅 `ADMIN`；未看到审计。 |
| 模拟器 | `POST /sensor-simulator/start` | 启动模拟 | 幂等行为 | 已实现。query `machineId`，默认 `SIM-001`；重复调用会设置 running=true，近似幂等。 |
| 模拟器 | `POST /sensor-simulator/stop` | 停止模拟 | 幂等行为 | 已实现。重复调用会设置 running=false，近似幂等。 |
| 模拟器 | `POST /sensor-simulator/publish-once` | 单次发布 | 返回结果 | 已实现。query `machineId` 默认 `SIM-001`；发布一批模拟读数并返回状态。 |
| 模拟器 | `POST /sensor-simulator/publish` | 自定义发布 | Body 校验 | 已实现。Body `{machineId,sensorType,value,unit,location}`；校验 machineId/sensorType 正则 `[A-Za-z0-9_-]+`。 |
| 模拟器 | `GET /sensor-simulator/status` | 获取状态 | 状态字段 | 已实现。返回 `{running,machineId,topic,publishedCount,mqttConnected}`。 |
| MQTT | `GET /emqx/status` | 连接状态 | 状态模型 | 已实现。返回 `{connected,broker,clientId}`。 |
| MQTT | `POST /emqx/machines/{id}/control` | 下发命令 | 命令 ID、幂等键、权限、回执 | 已实现。必须带请求头 `Idempotency-Key`，8-128 字符；Body `{command,parameters}`；命令只允许 `START/PAUSE/RESUME/STOP/APPLY_PARAMS`；返回 `{commandId,published,status,topic,command,duplicate}`；权限 `ADMIN/DISPATCHER`。 |
| MQTT | `POST /emqx/control-acks` | 接收回执 | 通常由设备/服务调用，前端不得直接调用 | 已实现。Body `{commandId,success,message}`；权限 `ADMIN/DRIVER`；前端一般只读审计，不应伪造设备回执。 |
| MQTT | `GET /emqx/control-audits` | 审计列表 | 分页、状态、时间 | 已实现。返回最近 100 条 `ControlCommandAudit`；无分页；权限 `ADMIN/DISPATCHER`。 |
| MQTT | `GET /emqx/control-audits/by-command` | 命令追踪 | query 参数名 | 已实现。query 为 `commandId`；返回单条审计。 |
| AI | `POST /ai-vision/detect` | 图片检测 | multipart 字段、文件限制、结果坐标 | 已实现。multipart 字段名 `image`；返回 `List<AIVisionService.DetectionResult>`；文件大小/类型限制未在控制器层看到。 |
| AI | `GET /ai-vision/yield-distribution/{fieldId}` | 产量分布 | 坐标系与单位 | 已实现。返回 `double[][]`；坐标系/单位由服务层 demo 逻辑决定，后续需业务确认。 |
| 北斗 | `GET /beidou/satellite/status` | 卫星状态 | 刷新频率、字段 | 已实现。返回 `Map<String,Object>`，字段由 `BeidouNavigationService` 决定。 |
| 北斗 | `POST /beidou/route/plan` | 路径规划 | 坐标系、禁区、错误模型 | 已实现。Body 为开放 `Map<String,Object>`；schema 未固化，前端需通过适配层封装。 |
| 北斗 | `POST /beidou/navigation/start` | 启动导航 | 权限、任务绑定 | 已实现。Body 为开放 `Map<String,Object>`；权限走默认 POST 规则 `ADMIN/DISPATCHER`。 |
| 北斗 | `GET /beidou/position/realtime` | 实时位置 | 轮询还是推送、坐标系 | 已实现。query `machineId`；当前为 HTTP 查询，不是推送。 |
| 北斗 | `GET /beidou/navigation/history` | 历史轨迹 | 时间范围、抽稀 | 已实现。query `machineId`；未看到时间范围/抽稀参数。 |
| 控制计算 | `POST /control-system/calculate-attitude` | 姿态计算 | 输入单位、精度、错误 | 已实现。query 参数 `accData,gyroData,magData` 均为 `double[]`；返回 `double[]`。 |
| 控制计算 | `POST /control-system/calculate-control` | 控制量 | 安全边界 | 已实现。query 参数 `targetSpeed,currentSpeed`；返回 `ControlOutput`。 |
| 控制计算 | `POST /control-system/fuse-sensors` | 传感器融合 | 输入 schema | 已实现。query 参数 `gpsData,imuData,visionData` 均为 `double[]`；返回 `SensorFusionResult`。 |
| 控制计算 | `POST /control-system/calculate-load-model` | 负载模型 | 输入 schema、版本 | 已实现。query 参数 `cropDensity,speed`；返回 `LoadModelResult`。 |
| WebSocket | 后端配置决定 | 事件推送 | URL、鉴权、心跳、事件 schema、断线恢复 | 已配置 STOMP/SockJS endpoint `/ws`，simple broker `/topic`，application prefix `/app`；`/app/sensor-data -> /topic/sensor-data`，`/app/machine-status -> /topic/machine-status`。前端当前只配置 URL，未看到真实客户端连接封装。 |

## 高风险适配点

- 前端页面中仍有直接 `axios` 调用，后续应统一到 `services/http.js` 或 API 适配层，避免丢失 `Authorization`、错误处理和 `/api` 策略。
- `POST /emqx/machines/{id}/control` 必须带 `Idempotency-Key`；当前前端 `ControlSystem.vue` 直接 axios 调用需后续适配，否则会 400。
- 设备/任务状态更新使用裸字符串 Body，不是 `{status}`；任务进度使用 `completedArea` query 且语义是面积，不是百分比。
- Dashboard 中的 WebSocket/MQTT 状态目前是静态展示，不能作为真实连接状态。
- 生产环境不应静默回退 Mock；当前能力接口提供 demo/real 模式信号，前端需显式展示。

## reference-frontend 差异核验

| reference-frontend 能力 | 与当前真实契约的差异 | 适配决定 |
|---|---|---|
| `src/api/http.ts` 使用 `VITE_API_BASE || /api`、`smart-agri-token`、`X-Request-Id` | 当前工程 token key 是 `smart-harvester-token`，已有 `services/http.js`；后端未要求 `X-Request-Id` | 不复制；在现有 `http.js` 中按需补请求 ID 和统一拆错 |
| `src/router/index.ts` 有 `/login`、`MainLayout`、`beforeEach` | 当前登录页在 `App.vue`，路由无守卫 | 借鉴守卫，保留现有路由路径 |
| `src/realtime/mqtt.ts` 前端直连 MQTT 并 publish `machines/{id}/control` | 当前后端真实控制命令必须走 `/emqx/machines/{machineId}/control`，需要 `Idempotency-Key` 和审计 | 不采用前端直连控制，避免绕过权限和审计 |
| `src/realtime/websocket.ts` 使用原生 WebSocket | 当前后端是 STOMP/SockJS `/ws`，broker `/topic`，app prefix `/app` | 需要重新实现或引入兼容客户端，不能直接复制 |
| TypeScript DTO/types | 当前工程是 JavaScript，无 TS 构建脚本 | 可把 DTO 作为 JSDoc/适配层注释参考；不迁移 TS 编译链 |
| Mock 数据与页面展示 | 当前后端已有真实接口和 demo capability 信号 | Mock 只能隔离在适配层或 demo 模式，不能让页面默认静默使用 |
# Codex Merge Final Notes

After stages 01-06, the active migrated frontend pages use the shared API layer rather than page-local `axios` calls. Remaining mentions of direct axios in older audit text are historical findings from stage 0. Sensor paging/sorting and report statistics remain frontend adapter behavior until backend pageable/statistics endpoints are added.
