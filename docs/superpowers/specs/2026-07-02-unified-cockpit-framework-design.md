# 云禾智控驾驶舱阶段4：UnifiedCockpit 整体框架规格

日期：2026-07-02  
状态：待实施计划  
适用范围：`frontend` 前端项目，阶段4“驾驶舱整体框架”任务 35-44。  
前置依据：阶段1审计、阶段2基线与备份、阶段3作用域化视觉设计系统。

## 1. 背景与目标

当前项目已有 `DashboardView.vue` 驾驶舱雏形和 `IntegratedView.vue` 综合大屏页，但两者都不是理想的长期框架：`DashboardView.vue` 将头部、侧边栏、地图、KPI、表格、底栏等逻辑集中在一个页面中；`IntegratedView.vue` 文件体积过大且包含较多旧逻辑。阶段4目标是在不破坏现有首页和旧页面的前提下，新增一个可逐步迁移的 `/cockpit` 单一融合式驾驶舱框架。

该框架需要提供稳定布局骨架、统一顶部栏、左右/中心/底部承载区、响应式断点策略、单抽屉管理、弹窗管理和路由查询参数规则，为阶段5核心视觉模块和阶段6业务抽屉/弹窗迁移打基础。

## 2. 设计决策

采用“新建 `/cockpit` 独立框架”方案：

- 新增 `src/views/UnifiedCockpit.vue` 作为驾驶舱页面，不直接替换 `/` 的 `DashboardView.vue`。
- 新增 `src/components/cockpit/` 组件目录承载框架组件。
- 新增 `src/composables/` 存放响应式、抽屉、弹窗管理逻辑。
- 新增 `/cockpit` 路由，旧 `/`、`/integrated`、`/home` 等保持可访问。
- 复用现有 Pinia Store、API 封装、权限逻辑、`DashboardPanel`、`KpiCard`、`GisMap`、`TrendChart` 等组件。
- 使用阶段3 `.yh-cockpit` 作用域视觉系统。

## 3. 阶段4任务覆盖

| 序号 | 任务 | 设计覆盖 |
|---:|---|---|
| 35 | UnifiedCockpit 三栏 Grid 骨架 | `UnifiedCockpit.vue` + CSS grid 区域 |
| 36 | CockpitHeader | `CockpitHeader.vue` |
| 37 | CockpitLeftPanel | `CockpitLeftPanel.vue` 容器 slot |
| 38 | CockpitCenterPanel | `CockpitCenterPanel.vue` 容器 slot，地图主区域占比约 45%+ |
| 39 | CockpitRightPanel | `CockpitRightPanel.vue` 容器 slot/tab/分区 |
| 40 | CockpitBottomPanel | `CockpitBottomPanel.vue` 趋势图挂载区 |
| 41 | useResponsiveCockpit | `useResponsiveCockpit.js` 管理 1920/1600/1440/1366 断点 |
| 42 | useDrawerManager | `useDrawerManager.js` 单业务抽屉状态与路由同步 |
| 43 | 弹窗管理逻辑 | `useDialogManager.js` 管理 AI/模拟器等弹窗状态 |
| 44 | `/cockpit` 路由与查询参数 | router 增加 route + query 规则文档化 |

## 4. 组件架构

### 4.1 页面

`src/views/UnifiedCockpit.vue`

职责：

- 挂载 `.yh-cockpit`。
- 加载 dashboard store 快照。
- 组合 header、left、center、right、bottom、drawer、dialog 管理。
- 不直接包含大量业务细节；具体业务块通过现有组件或轻量区域组件承载。

### 4.2 组件目录

`src/components/cockpit/`：

- `CockpitHeader.vue`：Logo、系统名、环境标签、API/WS/MQTT状态、当前时间、全屏按钮、用户菜单。
- `CockpitLeftPanel.vue`：左侧容器，承载 KPI/设备概况/快速列表，内部使用 slot。
- `CockpitCenterPanel.vue`：中心容器，优先承载 GIS 地图，确保中心地图不被遮挡。
- `CockpitRightPanel.vue`：右侧容器，承载任务/告警/事件/快捷操作，支持 slot。
- `CockpitBottomPanel.vue`：底部趋势图容器，禁止压缩到不可读。
- `CockpitDrawerHost.vue`：业务抽屉承载宿主，仅允许一个主业务抽屉打开。
- `CockpitDialogHost.vue`：AI视觉、传感器模拟器等弹窗承载宿主。

### 4.3 Composables

`src/composables/`：

- `useResponsiveCockpit.js`
  - 输入：窗口宽度/高度或响应式 ref。
  - 输出：当前断点、左右栏宽度、底部高度、是否紧凑模式。
- `useDrawerManager.js`
  - 输出：`currentDrawer`、`drawerParams`、`openDrawer(type, params, options)`、`closeDrawer()`。
  - 规则：同一时刻只允许一个主业务抽屉。
  - 路由同步：query 中使用 `drawer` 和必要 id 参数，例如 `/cockpit?drawer=machine&machineId=xxx`。
- `useDialogManager.js`
  - 输出：`dialogs`、`openDialog(type, params)`、`closeDialog(type)`、`closeAllDialogs()`。
  - 规则：弹窗与抽屉互不替代；弹窗支持多个类型状态，但 UI 层限制层级和 z-index。

## 5. 布局规格

### 5.1 桌面标准布局

根容器：`.unified-cockpit.yh-cockpit`

Grid 区域：

```text
header header header
left   center right
left   bottom right
```

基础尺寸：

- Header：56px。
- 主内容区：剩余高度减底部。
- Bottom：默认 210px。
- Left：断点决定，1920 下约 360px，1600 下约 320px，1440 下约 300px，1366 下约 280px。
- Right：断点决定，1920 下约 380px，1600 下约 340px，1440 下约 320px，1366 下约 300px。
- Center：剩余宽度，必须保持主内容宽度 45% 以上。
- Gap：使用阶段3 `--yh-space-3` 或 `--yh-space-4`。

### 5.2 响应式断点

断点按视口宽度：

- `xl`: >= 1920。
- `lg`: >= 1600 且 < 1920。
- `md`: >= 1440 且 < 1600。
- `sm`: < 1440，重点保障 1366×768。

`sm` 下：

- Header 保持 56px。
- Bottom 可降至 180px，但不能低于 160px。
- 左右栏宽度收缩但不低于 260px。
- 文字字号不再放大，面板内部允许滚动。

## 6. 顶部栏规格

`CockpitHeader` props：

- `systemName: string`
- `environmentLabel: string`
- `apiStatus: 'online' | 'offline' | 'degraded' | 'unknown'`
- `wsStatus: 'online' | 'offline' | 'degraded' | 'unknown'`
- `mqttStatus: 'online' | 'offline' | 'degraded' | 'unknown'`
- `username: string`
- `roleText: string`
- `currentTime: Date`

事件：

- `toggle-fullscreen`
- `logout`

显示规则：

- 状态使用阶段3状态 token 和 `getCockpitStatusMeta`。
- 全屏按钮使用浏览器 Fullscreen API；不支持时按钮禁用或显示不可用。
- 时间使用 `zh-CN`、24小时制。

## 7. 抽屉管理规则

`useDrawerManager` 抽屉类型初始支持：

- `machine`
- `task`
- `sensor`
- `control`
- `report`

接口：

```js
const {
  currentDrawer,
  drawerParams,
  isDrawerOpen,
  openDrawer,
  closeDrawer
} = useDrawerManager(router, route)
```

行为：

- `openDrawer('machine', { machineId: 'M-001' })` 会关闭已有业务抽屉并打开 machine。
- 打开抽屉时同步 query。
- `closeDrawer()` 移除 query 中的 `drawer` 与相关参数。
- 若 query 中存在 `drawer`，初始化时恢复抽屉状态。

## 8. 弹窗管理规则

`useDialogManager` 弹窗类型初始支持：

- `aiVision`
- `sensorSimulator`

接口：

```js
const {
  dialogs,
  openDialog,
  closeDialog,
  closeAllDialogs
} = useDialogManager()
```

行为：

- 弹窗状态与抽屉状态分离。
- `openDialog(type, params)` 设置对应弹窗为 open。
- `closeDialog(type)` 只关闭指定弹窗。
- `closeAllDialogs()` 用于路由离开或全局关闭。

## 9. 路由规则

新增 route：

- path: `/cockpit`
- name: `UnifiedCockpit`
- component: `../views/UnifiedCockpit.vue`

查询参数：

- `drawer`: 当前业务抽屉类型。
- `machineId`, `taskId`, `sensorId`, `reportId`: 业务对象 id。
- `dialog`: 可选初始弹窗类型，若后续需要深链弹窗。

不删除旧路由，不改变后端接口。

## 10. 测试策略

新增单元测试：

- `useResponsiveCockpit.test.js`
  - 验证 1920/1600/1440/1366 断点输出。
- `useDrawerManager.test.js`
  - 验证单抽屉限制、open/close、query 同步参数构造。
- `useDialogManager.test.js`
  - 验证打开/关闭指定弹窗和关闭全部。
- `navigation.test.js`
  - 验证 `/cockpit` 可从全局导航或路由表访问。

构建验证：

- 全量 `node --test` 通过。
- `scripts/build-win.ps1` 通过；chunk warning 留待阶段11。

## 11. 验收标准

- `/cockpit` 路由可访问且不破坏 `/`、`/integrated`、旧业务页。
- 四种断点布局计算有单元测试覆盖。
- Header 显示系统名、状态、时间、全屏、用户信息。
- 左/中/右/底部容器存在并可承载子组件。
- 中心地图区域在设计计算中保持主内容宽度 45% 以上。
- Bottom 最小高度不低于 160px。
- 同时只允许一个主业务抽屉。
- 弹窗可独立控制且不与抽屉状态混淆。
- 所有新增视觉样式使用 `.yh-cockpit` 作用域。

## 12. 风险与缓解

- 风险：直接迁移现有 DashboardView 业务会破坏首页。缓解：新增 `/cockpit` 独立框架，旧页面保留。
- 风险：IntegratedView 过大，不适合作为阶段4基线。缓解：只参考，不拆迁。
- 风险：FullScreen API 浏览器兼容差异。缓解：封装为 header 事件，由页面安全调用，失败不影响主功能。
- 风险：query 同步可能引发重复导航。缓解：抽屉管理 helper 返回纯 query 构造函数，测试覆盖。
- 风险：1366×768 空间紧张。缓解：断点中固定最小栏宽和 bottom 最小高度，内部滚动。

## 13. 实施顺序建议

1. 编写响应式布局 helper 与测试。
2. 编写抽屉管理 helper 与测试。
3. 编写弹窗管理 helper 与测试。
4. 新增 cockpit 容器组件与 Header。
5. 新增 `UnifiedCockpit.vue` 组合页面。
6. 新增 `/cockpit` 路由和导航入口。
7. 全量测试、构建、更新任务清单与阶段4报告。
