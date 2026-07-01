# Integrated Agri Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single integrated smart-agriculture operations cockpit on the existing Vue frontend while preserving current backend contracts and functionality.

**Architecture:** Keep the existing Vue 3 + Vite + Pinia application and make `/` the primary integrated cockpit. Use the current `snapshot`/store data flow, add focused layout/drawer data helpers, and concentrate visual changes in `DashboardView.vue`, shared dashboard components, and global styles. Existing routes remain compatible, while the cockpit exposes feature panels through in-page drawers/dialogs.

**Tech Stack:** Vue 3, Vite 4, Pinia, Vue Router, Element Plus, ECharts, Axios, Node test runner.

## Global Constraints

- Only modify the frontend; do not modify backend services or API contracts.
- Preserve existing authentication, login, logout, role display, and request-state behavior.
- Keep current routes available; make `/` the primary single cockpit experience.
- Do not add a new large UI framework.
- Use visual colors: primary agriculture green `#16a34a`, deep green `#0f2f23`, blue for online, green for normal, orange for warning, red for abnormal.
- Desktop-first target is 1365×768 and above, with responsive collapse for narrower screens.
- Run `npm test` and `npm run build` after implementation.

---

## File Structure

- Modify `frontend/src/views/DashboardView.vue`: main integrated cockpit container, layout regions, drawer/dialog state, feature panel rendering.
- Modify `frontend/src/styles/variables.css`: green SaaS color tokens and shared shadows/radii.
- Modify `frontend/src/styles/global.css`: base page background, font smoothing, common button/card resets.
- Modify `frontend/src/components/common/DashboardCard.vue` only if existing card styles conflict with the new cockpit.
- Modify `frontend/src/components/dashboard/DashboardPanel.vue`: light SaaS card visual language.
- Modify `frontend/src/components/dashboard/KpiCard.vue`: new metric card visual style.
- Modify `frontend/src/components/dashboard/GisMap.vue`: map presentation should look like a field operations map.
- Modify `frontend/src/components/dashboard/DashboardTable.vue`: table visuals for drawer and cockpit cards.
- Modify `frontend/src/config/navigation.js`: fix Chinese navigation labels and keep route compatibility.
- Create `frontend/src/utils/cockpitPanels.js`: pure helpers that derive drawer/dialog panel data from `snapshot` and capability text.
- Create `frontend/src/utils/cockpitPanels.test.js`: tests for drawer panel metadata and empty-state-safe values.
- Leave `frontend/src/utils/gisMapModel.test.js` unmodified because it is an existing untracked user/workspace file.

---

### Task 1: Add cockpit panel data helpers

**Files:**
- Create: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\utils\cockpitPanels.js`
- Create: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\utils\cockpitPanels.test.js`

**Interfaces:**
- Consumes: `snapshot` object from `DashboardView.vue`, `capabilityText` object from `DashboardView.vue`.
- Produces: `buildCockpitPanels(snapshot, capabilityText): Record<string, PanelDefinition>`.
- `PanelDefinition` shape: `{ key: string, title: string, subtitle: string, badge: string, emptyText: string, metrics: Array<{ label: string, value: string | number, tone: string }>, rows: Array<Record<string, unknown>> }`.

- [ ] **Step 1: Write failing tests for panel metadata and empty-state safety**

Create `frontend/src/utils/cockpitPanels.test.js` with:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCockpitPanels } from './cockpitPanels.js'

const baseSnapshot = {
  topMachines: [{ id: 'HV-001', type: '履带式收割机', statusText: '在线', rate: 96 }],
  taskProgress: { total: 3, pending: 1, running: 1, completed: 1, completedRate: 33 },
  alarms: [{ id: 'A-1', levelText: '预警', statusText: '未处理', message: '土壤湿度偏低' }],
  events: [{ id: 'E-1', type: '调度', statusText: '完成', content: '任务已下发' }],
  ai: { statusText: '识别中', detectionType: '小麦', confidence: 0.92 },
  trends: { areaToday: [1, 2, 3], fuelToday: [3, 2, 1] },
  kpis: [{ title: '在线农机', value: 12, sub: 'API 正常' }]
}

const capabilityText = {
  aiVision: '演示模式',
  navigation: '可用',
  control: '实时控制'
}

test('buildCockpitPanels returns all cockpit panel definitions', () => {
  const panels = buildCockpitPanels(baseSnapshot, capabilityText)
  assert.deepEqual(Object.keys(panels), ['machines', 'tasks', 'control', 'vision', 'sensors', 'reports', 'simulator'])
  assert.equal(panels.machines.title, '农机设备')
  assert.equal(panels.tasks.badge, '3 个任务')
  assert.equal(panels.vision.metrics[0].value, '小麦')
})

test('buildCockpitPanels tolerates missing arrays and nested objects', () => {
  const panels = buildCockpitPanels({}, {})
  assert.equal(panels.machines.rows.length, 0)
  assert.equal(panels.machines.emptyText, '暂无农机设备数据')
  assert.equal(panels.tasks.metrics[0].value, 0)
  assert.equal(panels.vision.metrics[1].value, '0.00')
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run from `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend`:

```powershell
node --test src/utils/cockpitPanels.test.js
```

Expected: failure because `src/utils/cockpitPanels.js` does not exist.

- [ ] **Step 3: Implement the helper**

Create `frontend/src/utils/cockpitPanels.js` with:

```js
function asArray(value) {
  return Array.isArray(value) ? value : []
}

function numberValue(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback
}

function confidenceValue(ai) {
  const confidence = numberValue(ai?.confidence, 0)
  return confidence.toFixed(2)
}

export function buildCockpitPanels(snapshot = {}, capabilityText = {}) {
  const machines = asArray(snapshot.topMachines)
  const alarms = asArray(snapshot.alarms)
  const events = asArray(snapshot.events)
  const kpis = asArray(snapshot.kpis)
  const taskProgress = snapshot.taskProgress || {}
  const ai = snapshot.ai || {}

  return {
    machines: {
      key: 'machines',
      title: '农机设备',
      subtitle: '查看在线农机、作业状态和设备健康度',
      badge: `${machines.length} 台设备`,
      emptyText: '暂无农机设备数据',
      metrics: [
        { label: '在线设备', value: machines.length, tone: 'online' },
        { label: '平均健康度', value: machines.length ? `${Math.round(machines.reduce((sum, item) => sum + numberValue(item.rate), 0) / machines.length)}%` : '0%', tone: 'normal' },
        { label: '接口状态', value: kpis[0]?.sub || '待连接', tone: 'info' }
      ],
      rows: machines
    },
    tasks: {
      key: 'tasks',
      title: '任务调度',
      subtitle: '查看任务进度、待执行任务和完成率',
      badge: `${numberValue(taskProgress.total)} 个任务`,
      emptyText: '暂无任务数据',
      metrics: [
        { label: '任务总数', value: numberValue(taskProgress.total), tone: 'info' },
        { label: '进行中', value: numberValue(taskProgress.running), tone: 'online' },
        { label: '完成率', value: `${numberValue(taskProgress.completedRate)}%`, tone: 'normal' }
      ],
      rows: events
    },
    control: {
      key: 'control',
      title: '控制系统',
      subtitle: '查看线控能力、导航能力和控制链路状态',
      badge: capabilityText.control || '能力未知',
      emptyText: '暂无控制事件',
      metrics: [
        { label: '线控状态', value: capabilityText.control || '未知', tone: 'online' },
        { label: '导航能力', value: capabilityText.navigation || '未知', tone: 'info' },
        { label: '待处理告警', value: alarms.length, tone: alarms.length ? 'warning' : 'normal' }
      ],
      rows: events
    },
    vision: {
      key: 'vision',
      title: 'AI 视觉识别',
      subtitle: '查看当前识别画面、识别类型和置信度',
      badge: ai.statusText || '待识别',
      emptyText: '暂无 AI 识别记录',
      metrics: [
        { label: '识别类型', value: ai.detectionType || '未识别', tone: 'normal' },
        { label: '置信度', value: confidenceValue(ai), tone: 'online' },
        { label: '视觉模式', value: capabilityText.aiVision || '未知', tone: 'info' }
      ],
      rows: ai.detectionType ? [{ type: ai.detectionType, confidence: confidenceValue(ai), status: ai.statusText || '待识别' }] : []
    },
    sensors: {
      key: 'sensors',
      title: '传感器数据',
      subtitle: '查看环境、土壤、湿度和告警数据',
      badge: `${alarms.length} 条告警`,
      emptyText: '暂无传感器告警',
      metrics: [
        { label: '告警数量', value: alarms.length, tone: alarms.length ? 'warning' : 'normal' },
        { label: '数据链路', value: '实时采集', tone: 'online' },
        { label: '采样状态', value: '运行中', tone: 'normal' }
      ],
      rows: alarms
    },
    reports: {
      key: 'reports',
      title: '报表分析',
      subtitle: '查看作业面积、油耗、产量和事件趋势',
      badge: '趋势分析',
      emptyText: '暂无报表事件',
      metrics: [
        { label: '面积趋势点', value: asArray(snapshot.trends?.areaToday).length, tone: 'normal' },
        { label: '油耗趋势点', value: asArray(snapshot.trends?.fuelToday).length, tone: 'info' },
        { label: '事件数量', value: events.length, tone: 'online' }
      ],
      rows: events
    },
    simulator: {
      key: 'simulator',
      title: '模拟器 / 演示',
      subtitle: '用于演示传感器上报、农机状态和调试数据',
      badge: '演示入口',
      emptyText: '暂无模拟器事件',
      metrics: [
        { label: '模拟状态', value: '可用', tone: 'online' },
        { label: '数据源', value: '演示数据', tone: 'info' },
        { label: '安全级别', value: '本地调试', tone: 'normal' }
      ],
      rows: events
    }
  }
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```powershell
node --test src/utils/cockpitPanels.test.js
```

Expected: both tests pass.

- [ ] **Step 5: Commit task 1**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' add src/utils/cockpitPanels.js src/utils/cockpitPanels.test.js
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' commit -m "feat: add cockpit panel helpers"
```

---

### Task 2: Fix navigation labels and cockpit copy

**Files:**
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\config\navigation.js`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\config\navigation.test.js`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\App.vue`

**Interfaces:**
- Consumes: existing `navItems` export.
- Produces: readable Chinese labels used by existing nav rendering and compatibility routes.

- [ ] **Step 1: Update navigation test expected labels**

Open `frontend/src/config/navigation.test.js` and make the assertion require these labels:

```js
const labels = navItems.map(item => item.label)
assert.deepEqual(labels, ['总览', '设备', '任务', '控制', 'AI视觉', '传感器', '模拟器', '报表', '综合大屏', '旧首页'])
```

- [ ] **Step 2: Run navigation test and verify it fails if labels are still garbled**

Run:

```powershell
node --test src/config/navigation.test.js
```

Expected: failure showing mismatched labels.

- [ ] **Step 3: Replace navigation labels**

Replace `frontend/src/config/navigation.js` with:

```js
export const navItems = [
  { label: '总览', path: '/', icon: 'home' },
  { label: '设备', path: '/machines', icon: 'platform' },
  { label: '任务', path: '/tasks', icon: 'tickets' },
  { label: '控制', path: '/monitor', icon: 'cpu' },
  { label: 'AI视觉', path: '/vision', icon: 'video' },
  { label: '传感器', path: '/sensors', icon: 'position' },
  { label: '模拟器', path: '/simulator', icon: 'monitor' },
  { label: '报表', path: '/reports', icon: 'analysis' },
  { label: '综合大屏', path: '/integrated', icon: 'view' },
  { label: '旧首页', path: '/home', icon: 'van' }
]
```

- [ ] **Step 4: Fix login page Chinese copy without changing auth behavior**

In `frontend/src/App.vue`, keep the script unchanged and replace the login text with:

```vue
<span class="eyebrow">SMART HARVESTER SECURITY</span>
<h1>登录云禾智控</h1>
<p>使用管理员、调度员、驾驶员或只读账号登录平台。</p>
<label>
  用户名
  <input v-model.trim="username" autocomplete="username" required />
</label>
<label>
  密码
  <input v-model="password" type="password" autocomplete="current-password" required />
</label>
<button type="submit" :disabled="authStore.loading">
  {{ authStore.loading ? '正在验证...' : '安全登录' }}
</button>
```

- [ ] **Step 5: Run tests and commit task 2**

Run:

```powershell
node --test src/config/navigation.test.js
```

Expected: pass.

Commit:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' add src/config/navigation.js src/config/navigation.test.js src/App.vue
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' commit -m "fix: restore readable cockpit navigation copy"
```

---

### Task 3: Introduce green SaaS visual tokens

**Files:**
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\styles\variables.css`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\styles\global.css`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\components\dashboard\DashboardPanel.vue`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\components\dashboard\KpiCard.vue`

**Interfaces:**
- Consumes: existing component props.
- Produces: CSS variables and card styles used by the new cockpit.

- [ ] **Step 1: Add a CSS verification test through build feedback**

No separate CSS unit test is required because this project does not currently test CSS. Use Vite build in Step 4 as the verification gate. Before editing, record that `npm run build` currently works or fails for unrelated reasons.

Run:

```powershell
npm run build
```

Expected: current build completes or shows only existing warnings. If it fails, capture the failure and fix only if it is caused by files in this task.

- [ ] **Step 2: Add visual variables**

Append these tokens to `frontend/src/styles/variables.css`:

```css
:root {
  --agri-primary: #16a34a;
  --agri-primary-dark: #0f2f23;
  --agri-primary-soft: #e8f8ee;
  --agri-bg: #f3f7f1;
  --agri-card: #ffffff;
  --agri-border: rgba(15, 47, 35, 0.1);
  --agri-text: #18352a;
  --agri-muted: #6b7d73;
  --agri-blue: #2563eb;
  --agri-green: #16a34a;
  --agri-orange: #f59e0b;
  --agri-red: #dc2626;
  --agri-shadow: 0 18px 45px rgba(15, 47, 35, 0.09);
  --agri-radius-lg: 24px;
  --agri-radius-md: 18px;
  --agri-radius-sm: 12px;
}
```

- [ ] **Step 3: Add global cockpit base styles**

In `frontend/src/styles/global.css`, ensure body background and font are:

```css
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: var(--agri-text, #18352a);
  background: var(--agri-bg, #f3f7f1);
  font-family: Inter, "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
  text-rendering: geometricPrecision;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

Keep existing non-conflicting global styles.

- [ ] **Step 4: Refresh shared card visuals**

In `DashboardPanel.vue` and `KpiCard.vue`, keep the existing props and markup compatible. Update CSS to use white cards, green accents, rounded corners, and subtle shadows. Do not rename props.

- [ ] **Step 5: Build and commit task 3**

Run:

```powershell
npm run build
```

Expected: build passes with only existing chunk-size warnings.

Commit:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' add src/styles/variables.css src/styles/global.css src/components/dashboard/DashboardPanel.vue src/components/dashboard/KpiCard.vue
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' commit -m "style: add green cockpit visual system"
```

---

### Task 4: Rebuild DashboardView as the single integrated cockpit

**Files:**
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\views\DashboardView.vue`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\components\dashboard\GisMap.vue`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\components\dashboard\TrendChart.vue`
- Modify: `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend\src\components\dashboard\DashboardTable.vue`

**Interfaces:**
- Consumes: existing store state, `snapshot`, `capabilityText`, `buildCockpitPanels`.
- Produces: `/` renders topbar, sidebar, center map/AI section, right operations column, bottom analytics grid, and feature drawers/dialogs.

- [ ] **Step 1: Add import and state for cockpit panels**

In `DashboardView.vue`, import:

```js
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { buildCockpitPanels } from '../utils/cockpitPanels'
```

Add state:

```js
const activePanelKey = ref('')
const aiDialogVisible = ref(false)
const cockpitPanels = computed(() => buildCockpitPanels(snapshot.value, capabilityText.value))

function openPanel(key) {
  if (key === 'vision') {
    aiDialogVisible.value = true
    return
  }
  activePanelKey.value = key
}

function closePanel() {
  activePanelKey.value = ''
}
```

Adjust names if the existing file already imports `computed`, `ref`, `onMounted`, or `onUnmounted`; do not duplicate imports.

- [ ] **Step 2: Replace garbled visible copy with readable cockpit sections**

Use these visible section names in the template:

```txt
智慧农机运营驾驶舱
实时作业态势
农机设备
任务调度
线控控制
AI 视觉
传感器
报表分析
模拟器
中心 GIS 作业地图
在线设备 TOP5
任务进度
传感器告警
AI 识别画面
作业面积趋势
油耗趋势
最新事件
```

- [ ] **Step 3: Implement the cockpit layout**

The template should contain these top-level blocks:

```vue
<div class="cockpit-screen">
  <aside class="cockpit-sidebar">...</aside>
  <section class="cockpit-main">
    <header class="cockpit-topbar">...</header>
    <main class="cockpit-content">
      <section class="cockpit-hero">...</section>
      <section class="cockpit-kpis">...</section>
      <section class="cockpit-grid">...</section>
      <section class="cockpit-bottom">...</section>
    </main>
  </section>
  <el-drawer ...>...</el-drawer>
  <el-dialog ...>...</el-dialog>
</div>
```

The drawer must use:

```vue
<el-drawer
  :model-value="Boolean(activePanelKey)"
  :title="activePanelKey ? cockpitPanels[activePanelKey]?.title : ''"
  size="420px"
  @close="closePanel"
>
```

- [ ] **Step 4: Keep route compatibility in sidebar actions**

Sidebar primary cockpit buttons should call `openPanel(key)` for `machines`, `tasks`, `control`, `vision`, `sensors`, `reports`, and `simulator`. If a user needs old pages, include a compact compatibility menu that still calls `router.push(item.path)` using `navItems`.

- [ ] **Step 5: Update map and table visuals without changing props**

Keep existing `GisMap`, `TrendChart`, and `DashboardTable` props. Update only visual structure and CSS so they fit the green cockpit.

- [ ] **Step 6: Run focused unit tests**

Run:

```powershell
node --test src/utils/cockpitPanels.test.js src/config/navigation.test.js src/utils/dashboardModel.test.js src/services/auth.test.js
```

Expected: all listed tests pass.

- [ ] **Step 7: Commit task 4**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' add src/views/DashboardView.vue src/components/dashboard/GisMap.vue src/components/dashboard/TrendChart.vue src/components/dashboard/DashboardTable.vue
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' commit -m "feat: rebuild dashboard as integrated cockpit"
```

---

### Task 5: Verify full frontend behavior and browser rendering

**Files:**
- Modify only files required to fix failures introduced by Tasks 1-4.

**Interfaces:**
- Consumes: completed cockpit implementation.
- Produces: passing tests, passing build, and verified local page.

- [ ] **Step 1: Run all frontend tests**

From `C:\Users\25741\Desktop\智能农机\smart-harvester\frontend` run:

```powershell
node --test src/**/*.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: build passes. Existing Vite chunk-size warnings are acceptable.

- [ ] **Step 3: Start or reuse the local dev server**

If port `3000` is not listening, run:

```powershell
npm.cmd run dev -- --host 0.0.0.0
```

Expected: Vite reports `Local: http://localhost:3000/`.

- [ ] **Step 4: Verify page in browser**

Open:

```txt
http://127.0.0.1:3000/index.html#/
```

Expected visible results:

- Page title or hero includes `智慧农机运营驾驶舱`.
- Left navigation includes `设备`, `任务`, `控制`, `AI 视觉`, `传感器`, `报表`.
- Center map section is visible.
- KPI cards are visible.
- Right status column shows device, task, or alert information.
- Clicking `设备` opens a drawer titled `农机设备`.
- Clicking `AI 视觉` opens an AI dialog.

- [ ] **Step 5: Commit final verification fixes**

If verification required fixes:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' add src
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' commit -m "fix: polish integrated cockpit verification issues"
```

If no fixes were required, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: the plan covers frontend-only scope, single `/` cockpit, retained routes, existing auth/API behavior, drawer/dialog interaction, green SaaS visual system, error/empty-state safety, desktop-first responsiveness, and required test/build/browser verification.
- Placeholder scan: this plan contains no deferred requirements or undefined task outputs.
- Type consistency: `buildCockpitPanels(snapshot, capabilityText)` and the `PanelDefinition` shape are defined in Task 1 and consumed by Task 4 with matching keys.
