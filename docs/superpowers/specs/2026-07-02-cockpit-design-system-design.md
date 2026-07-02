# 云禾智控驾驶舱阶段3：作用域化视觉设计系统规格

日期：2026-07-02  
状态：待用户审阅  
适用范围：`frontend` 前端项目，阶段3“视觉设计系统”任务 27-34。  
前置依据：阶段1项目审计报告、阶段2基线与备份核对、当前 `src/styles/*` 与 `src/utils/echarts-theme.js` 实现。

## 1. 背景与目标

当前前端已经存在基础深色大屏风格：`src/styles/variables.css` 定义了 `--bg-*`、`--color-*` 等变量；`src/styles/global.css` 又定义了 `--app-*` 变量，并包含全局 Element Plus 覆盖；`src/utils/echarts-theme.js` 提供局部图表工具函数。问题是视觉变量分裂、Element Plus 覆盖作用域过宽、ECharts 主题未形成统一可复用配置、状态颜色与标签缺少跨模块一致规范。

阶段3目标是建立一套可落地、可复用、可验收的驾驶舱视觉设计系统，并确保旧页面、登录页和非驾驶舱业务页面不被无意污染。设计系统应为后续阶段4-6的驾驶舱框架、核心视觉模块和业务迁移提供稳定基础。

## 2. 范围

本阶段覆盖任务清单 27-34：

1. 主题色：背景色、主色、辅助科技色、状态色、文字色、边框色变量。
2. 字体：系统字体优先，数字等宽字体。
3. 字号：主标题、模块标题、指标数值、正文、辅助信息、状态标签层级，兼容 1366×768 下限。
4. 圆角阴影：半透明背景、细边框、顶部高光、阴影与面板质感。
5. 主题落地：建立可全局引用但可作用域隔离的 cockpit 变量文件。
6. 组件库主题：Element Plus 覆盖仅驾驶舱作用域生效，避免污染登录页/旧页面。
7. 图表主题：统一坐标轴、网格线、Tooltip、图例、配色、空状态、加载态。
8. 状态样式：统一成功、警告、危险、信息、离线、过期等状态色与状态标签。

不在本阶段实现完整布局重构、抽屉弹窗业务迁移、真实 WebSocket/MQTT 改造、地图大规模 Marker 聚合和性能拆包；这些属于后续阶段。

## 3. 推荐方案

采用“作用域化设计系统”：

- 使用 CSS variables，不新增 Sass/Less 等依赖，避免当前 npm/corepack 缺失导致新增依赖不可验证。
- 新增或整理 `src/styles/cockpit-tokens.css` 作为驾驶舱 token 源。
- 新增或整理 `src/styles/cockpit.css` 承载驾驶舱作用域类、面板、按钮、状态标签、Element Plus scoped overrides。
- 在驾驶舱页面外层使用统一作用域类，例如 `.yh-cockpit`。所有驾驶舱专属样式与 Element Plus 覆盖均以 `.yh-cockpit` 为前缀。
- 保留现有 `global.css` 中通用 reset、html/body/#app、滚动条与基础 focus 样式，但逐步移除或降级全局 Element Plus 覆盖，迁移到 cockpit 作用域内。
- 扩展 `src/utils/echarts-theme.js`，导出统一的 `cockpitChartTheme`、palette、tooltip、axis、loading/empty 配置工具，兼容现有调用。
- 新建状态样式配置和状态标签组件/工具，用于统一在线、离线、告警、过期、成功、警告、危险、信息等状态表现。

## 4. 设计 Token

### 4.1 颜色

Token 命名以 `--yh-` 为前缀，避免与现有 `--bg-*` 和 `--app-*` 混淆。

- 背景：
  - `--yh-bg-page`: 页面深色底。
  - `--yh-bg-radial`: 顶部/地图中心科技光晕。
  - `--yh-bg-panel`: 面板半透明背景。
  - `--yh-bg-panel-strong`: 强调面板背景。
  - `--yh-bg-elevated`: 抽屉/弹窗/浮层背景。
- 主色与科技色：
  - `--yh-color-primary`: 主蓝。
  - `--yh-color-cyan`: 霓虹青。
  - `--yh-color-green`: 农业绿色/成功。
  - `--yh-color-amber`: 预警/任务进行。
  - `--yh-color-red`: 危险/告警。
  - `--yh-color-purple`: AI/视觉识别辅助色。
- 文字：
  - `--yh-text-primary`: 主文本。
  - `--yh-text-secondary`: 正文/次级信息。
  - `--yh-text-muted`: 辅助文本。
  - `--yh-text-disabled`: 禁用/弱提示。
- 边框与线条：
  - `--yh-border-subtle`: 细分隔线。
  - `--yh-border-panel`: 面板边框。
  - `--yh-border-glow`: 高亮边框。
  - `--yh-grid-line`: 图表网格线。

状态色必须同时提供文字、背景、边框三个 token，避免在组件里硬编码透明度：

- `--yh-status-success-*`
- `--yh-status-warning-*`
- `--yh-status-danger-*`
- `--yh-status-info-*`
- `--yh-status-offline-*`
- `--yh-status-stale-*`

### 4.2 字体

- 正文字体栈：`Microsoft YaHei`, `PingFang SC`, `Helvetica Neue`, `Arial`, sans-serif。
- 数字字体栈：`DIN Alternate`, `Bahnschrift`, `Roboto Mono`, `Consolas`, monospace。
- 不引入外部字体文件，避免部署额外资源。

### 4.3 字号层级

兼容 1366×768 下限，避免大屏字号过大导致拥挤。

- `--yh-font-size-title`: 22px，页面/系统标题。
- `--yh-font-size-section`: 16px，模块标题。
- `--yh-font-size-kpi`: 28px，核心指标数值。
- `--yh-font-size-body`: 14px，正文。
- `--yh-font-size-small`: 12px，辅助信息。
- `--yh-font-size-tag`: 12px，状态标签。
- `--yh-line-height-body`: 1.5。

### 4.4 间距、圆角、阴影

- 间距：`--yh-space-1` 4px 到 `--yh-space-8` 32px。
- 圆角：`--yh-radius-sm` 6px、`--yh-radius-md` 10px、`--yh-radius-lg` 16px、`--yh-radius-pill` 999px。
- 阴影：
  - `--yh-shadow-panel`: 深色面板基础阴影。
  - `--yh-shadow-glow`: 青蓝弱光晕。
  - `--yh-shadow-danger`: 告警弱光晕。
- 面板质感：统一使用半透明背景、1px 细边框、顶部 inset 高光，不使用高饱和大面积纯色卡片。

## 5. CSS 架构

### 5.1 文件职责

- `src/styles/variables.css`：保留旧变量兼容，逐步桥接到 `--yh-*`。
- `src/styles/global.css`：只保留基础 reset、body/#app、滚动条、focus-visible 等全局基础样式；不再承载驾驶舱专属 Element Plus 覆盖。
- `src/styles/cockpit-tokens.css`：新增驾驶舱 token 源。
- `src/styles/cockpit.css`：新增作用域样式，所有选择器以 `.yh-cockpit` 开头。
- `src/main.js`：引入 `cockpit-tokens.css` 与 `cockpit.css`。

### 5.2 作用域规则

驾驶舱相关页面或根布局添加 `.yh-cockpit`。所有以下内容必须在 `.yh-cockpit` 下生效：

- 驾驶舱面板样式。
- KPI 卡片样式。
- 状态标签样式。
- Element Plus 的 card/table/input/select/button/dialog/drawer/tag/progress/loading 覆盖。
- 图表容器与空状态样式。

登录页和旧业务页不强制添加 `.yh-cockpit`，因此不受驾驶舱组件库主题覆盖。

## 6. Element Plus 覆盖策略

只做视觉层覆盖，不修改业务交互，不关闭 Element Plus 原有状态与可访问性。

覆盖范围：

- `.yh-cockpit .el-card`
- `.yh-cockpit .el-table`
- `.yh-cockpit .el-input__wrapper`
- `.yh-cockpit .el-select__wrapper`
- `.yh-cockpit .el-button`
- `.yh-cockpit .el-dialog`
- `.yh-cockpit .el-drawer`
- `.yh-cockpit .el-tag`
- `.yh-cockpit .el-progress-bar__outer`

验收要求：

- 驾驶舱内覆盖生效。
- 登录页样式不因为驾驶舱覆盖改变。
- 旧业务页若没有 `.yh-cockpit`，不被新覆盖污染。
- 不使用 `!important`，除非修复 Element Plus 内联或高优先级样式确有必要；若使用，必须局部且注释原因。

## 7. ECharts 主题策略

`src/utils/echarts-theme.js` 需要提供统一出口：

- `cockpitChartPalette`: 图表配色数组。
- `cockpitChartTheme`: 可注册或复用的主题对象。
- `getCockpitTooltip(options)`: 统一 tooltip 背景、边框、文字。
- `getCockpitAxis(options)`: 统一坐标轴、标签、网格线。
- `getCockpitLegend(options)`: 统一图例样式。
- `getChartEmptyOption(message)`: 空状态展示。
- `getChartLoadingOptions()`: 加载态样式。

兼容要求：保留现有 `getDarkTooltip`、`getDarkAxis`、`getGlowGradient`、`getGaugeOption`、`getRingOption` 导出，避免破坏已有页面。

## 8. 状态标签策略

新增统一状态配置，建议位置：`src/utils/status-theme.js` 或 `src/components/common/StatusBadge.vue`。为降低第一步风险，可先提供工具配置 + CSS class，后续组件迁移逐步接入。

统一状态：

- success：成功/在线/完成。
- warning：预警/进行中/待处理。
- danger：危险/故障/严重告警。
- info：普通信息/未知。
- offline：离线。
- stale：数据过期。

每个状态需有：label、className、color token、适用业务枚举映射。禁止为了视觉效果编造后端字段、角色或 MQTT Topic。

## 9. 数据流与依赖

本阶段不改后端、不改接口、不改 Store 结构。视觉系统只消费现有前端数据和已有状态字段。若发现字段差异，只在前端映射工具中适配，不改变 API 请求/响应结构。

## 10. 测试与验证

自动化验证：

1. 保持现有 Node 测试全部通过。
2. 为新增状态映射工具、ECharts 主题工具添加单元测试。
3. 构建必须成功。

人工/视觉验证：

1. 驾驶舱页面应呈现统一深色科技农业风格。
2. 1366×768 下标题、KPI、表格和状态标签不明显截断。
3. 登录页不受 `.yh-cockpit` 覆盖影响。
4. 图表 tooltip、坐标轴、网格线、图例颜色一致。
5. 状态标签跨模块颜色一致。

## 11. 风险与缓解

- 风险：现有全局 Element Plus 覆盖迁移后部分旧页面视觉变化。缓解：先新增作用域覆盖，再逐步减少全局覆盖；验证登录页与关键旧页面。
- 风险：当前中文文本存在乱码文件片段，视觉验证时可能影响截图判断。缓解：阶段3不扩大文案修改范围，乱码作为单独问题记录，后续按任务清单处理。
- 风险：npm/corepack 缺失导致无法安装新依赖。缓解：阶段3不新增依赖，仅使用 CSS 与现有 JS。
- 风险：图表组件分散，无法一次全量接入主题。缓解：先保持旧导出兼容，再逐步替换调用。

## 12. 验收映射

| 任务 | 验收证据 |
|---|---|
| 27 主题色 | `cockpit-tokens.css` 色板 token + 设计说明 |
| 28 字体 | 字体 token 与文档 |
| 29 字号 | 字号 token 与 1366×768 验证记录 |
| 30 圆角阴影 | 面板/卡片/浮层 token 与截图 |
| 31 主题落地 | `cockpit-tokens.css`、`cockpit.css` 全局可引用 |
| 32 组件库主题 | `.yh-cockpit .el-*` 覆盖 + 登录页不污染验证 |
| 33 图表主题 | `echarts-theme.js` 统一主题出口 + 单元测试 |
| 34 状态样式 | 状态配置/状态标签样式 + 单元测试 |

## 13. 实施顺序建议

1. 添加设计 token 文件与作用域样式骨架。
2. 将驾驶舱页面根节点接入 `.yh-cockpit`。
3. 迁移/新增 Element Plus scoped overrides。
4. 扩展 ECharts 主题工具并补测试。
5. 添加状态主题工具/状态标签基础样式并补测试。
6. 更新阶段3文档、任务清单状态和验证记录。
