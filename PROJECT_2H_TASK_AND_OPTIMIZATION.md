# 两小时项目任务与优化清单

## 本次两小时任务

目标：把智能农机项目整理成“可启动、可演示、可继续优化”的状态。

时间安排：

1. 0-20 分钟：检查项目结构、端口、前后端启动方式和测试状态。
2. 20-50 分钟：修复 Windows 本地启动脚本，降低 PowerShell 执行策略导致的启动失败。
3. 50-80 分钟：执行后端测试、前端构建，记录真实阻塞点。
4. 80-110 分钟：整理演示路线和优化清单，区分“已能实现”和“暂不能完整实现”。
5. 110-120 分钟：汇总执行结果，给出下一步优先级。

## 已完成事项

- 新增后端开发启动脚本：`start-backend-dev.ps1`
- 新增前端开发启动脚本：`start-frontend-dev.ps1`
- 前端脚本改用 `npm.cmd`，避免 Windows PowerShell 默认拦截 `npm.ps1`
- 新增后端 `dev` profile，默认使用 H2 本地文件库，降低演示时对 MySQL 的依赖
- dev profile 关闭 Redis 健康检查，避免本地未启动 Redis 时 `/actuator/health` 被误判为不可用
- dev profile 为 H2 增加 `NON_KEYWORDS=VALUE`，兼容现有 `sensor_data.value` 字段迁移
- 新增前端 Windows 构建脚本：`frontend/scripts/build-win.ps1`
- 前端 `npm run build` 已改为通过短盘符构建，规避中文路径/上级目录权限触发的 esbuild 崩溃
- 后端已执行 `mvn test`，测试通过

## 本次验证结果

- 前端构建：`npm.cmd run build` 通过
- 后端测试：`mvn test` 通过，3 个测试全部成功
- 前端开发服务：`http://localhost:3000/` 返回 200
- 后端开发服务：`http://localhost:8086/actuator/health` 返回 `UP`
- JWT 登录：`admin / AdminPass2026!` 可获取 token
- 受保护接口：携带 token 访问 `/capabilities` 正常返回 demo 能力状态
- 外部依赖状态：EMQX 未连接时 MQTT 功能降级禁用，不影响后端启动

## 本地演示启动

后端：

```powershell
cd C:\Users\王老爹的book\Desktop\智能农机\smart-harvester
.\start-backend-dev.ps1
```

开发演示账号：

- 管理员：`admin` / `AdminPass2026!`
- 调度员：`dispatcher` / `Dispatcher2026!`
- 驾驶员：`driver` / `DriverPass2026!`
- 只读用户：`viewer` / `ViewerPass2026!`

前端：

```powershell
cd C:\Users\王老爹的book\Desktop\智能农机\smart-harvester
.\start-frontend-dev.ps1
```

前端构建：

```powershell
cd C:\Users\王老爹的book\Desktop\智能农机\smart-harvester\frontend
npm.cmd run build
```

访问：

- 前端首页：`http://localhost:3000/#/`
- 传感器页面：`http://localhost:3000/#/sensors`
- 模拟器页面：`http://localhost:3000/#/simulator`
- 视觉识别页面：`http://localhost:3000/#/vision`
- 后端健康检查：`http://localhost:8086/actuator/health`

## 可真实实现的优化清单

### P0：演示稳定性

1. 增加 `dev` profile，使用 H2 内存库或本地文件库作为演示数据库，避免 MySQL 未启动导致后端无法演示。
2. 为 EMQX/MQTT 增加连接状态页面，明确显示“已连接、未连接、重连中、订阅主题”。
3. 前端统一处理 401/403/429 错误，提示用户登录、权限不足或请求过快。
4. 登录态接入前端路由守卫，避免接口已加 JWT 但页面仍按公开接口调用。
5. 增加一键启动脚本，顺序检查 Node、Maven、端口占用、后端健康、前端访问。

### P1：真实功能闭环

1. 传感器模拟平台发布数据后，后端保存到 `sensor_data`，前端通过轮询或 WebSocket 实时刷新。
2. 控制命令从前端发出后，后端写入 `control_command_audit`，再通过 MQTT 发布到 EMQX。
3. 设备回执进入 `/emqx/control-acks` 后，更新审计记录状态并推送前端。
4. AI 视觉页面接入训练好的 YOLOv8 权重推理结果，至少支持上传图片并返回识别框、置信度、类别。
5. 报表页面接入真实任务、设备、传感器数据，生成日报/周报统计。

### P2：工程质量

1. 把误放在 `backend/src/main/resources` 下的 Python 虚拟环境移出项目资源目录，避免 Maven 打包复制大量无关文件。
2. 修复 README 编码乱码，统一保存为 UTF-8。
3. 增加 `.env.example`，列出 JWT、账号、数据库、MQTT、Prometheus token 等环境变量。
4. 增加后端接口集成测试，覆盖认证、权限、传感器写入、控制审计、幂等键。
5. 前端抽出统一 API 客户端，集中管理 token、错误提示、重试策略。

## 暂时不能完整实现的部分与解决方案

1. 真实农机控制：缺少真实设备、下位机协议和安全联锁。
   解决方案：先用 EMQX 主题和模拟设备程序闭环，答辩时说明真实设备接入需要设备厂商协议、急停保护和现场联调。

2. 高精度实时视觉识别：当前只有训练数据和 YOLO 权重，后端未完整接入推理服务。
   解决方案：拆成独立 Python 推理服务，Spring Boot 通过 HTTP 调用；先实现图片上传识别，再扩展视频流。

3. 北斗导航真实定位：没有 GNSS 硬件和真实 NMEA/RTK 数据源。
   解决方案：先接入模拟轨迹和定位数据格式，后续通过串口、TCP 或 MQTT 接入真实定位终端。

4. 生产级 OIDC：当前更适合本地 JWT 演示。
   解决方案：生产环境对接学校统一认证或 Keycloak，后端保留资源服务器模式，前端走授权码流程。

## 建议演示顺序

1. 首页总览：说明设备、任务、传感器、视觉识别四个核心模块。
2. 传感器模拟器：发布一条模拟数据。
3. 传感器页面：展示数据进入系统后的刷新效果。
4. 控制系统：展示控制命令、设备回执和审计记录设计。
5. 视觉识别：展示数据集、训练结果和未来推理接入方案。
6. 监控运维：说明 Actuator、Prometheus、Grafana、告警预案。
