# Unified Cockpit Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/cockpit` UnifiedCockpit framework with scoped layout containers, header, responsive breakpoints, drawer/dialog managers, route integration, and tracking artifacts.

**Architecture:** Build the new cockpit as an additive page and component tree instead of replacing `DashboardView.vue`. Composables provide testable pure logic for breakpoints, drawer state, and dialog state; Vue components consume those helpers and reuse existing dashboard/store components.

**Tech Stack:** Vue 3, Vue Router 4, Pinia, Element Plus, plain CSS scoped by `.yh-cockpit`, Node `node:test`.

## Global Constraints

- Do not modify backend, database, API paths, request methods, request parameters, or response structures.
- Do not delete or replace existing `/`, `/integrated`, `/home`, or business routes.
- Do not add dependencies because npm/corepack install remains unavailable.
- New cockpit-specific styles must remain scoped under `.yh-cockpit`.
- Reuse existing Pinia Store, API wrappers, permissions, and dashboard components.
- Add tests for every new JavaScript helper before implementation.
- Build must pass with `scripts/build-win.ps1`; existing chunk size warning is allowed.

---

## File Structure

- Create `frontend/src/composables/useResponsiveCockpit.js`: breakpoint and layout metric calculations.
- Create `frontend/src/composables/useResponsiveCockpit.test.js`: TDD coverage for 1920/1600/1440/1366.
- Create `frontend/src/composables/useDrawerManager.js`: pure drawer query helpers plus composable state.
- Create `frontend/src/composables/useDrawerManager.test.js`: TDD coverage for single-drawer behavior/query sync.
- Create `frontend/src/composables/useDialogManager.js`: dialog state composable.
- Create `frontend/src/composables/useDialogManager.test.js`: TDD coverage for dialog open/close/all close.
- Create `frontend/src/components/cockpit/CockpitHeader.vue`.
- Create `frontend/src/components/cockpit/CockpitLeftPanel.vue`.
- Create `frontend/src/components/cockpit/CockpitCenterPanel.vue`.
- Create `frontend/src/components/cockpit/CockpitRightPanel.vue`.
- Create `frontend/src/components/cockpit/CockpitBottomPanel.vue`.
- Create `frontend/src/components/cockpit/CockpitDrawerHost.vue`.
- Create `frontend/src/components/cockpit/CockpitDialogHost.vue`.
- Create `frontend/src/views/UnifiedCockpit.vue`.
- Modify `frontend/src/router/index.js`: add `/cockpit` route.
- Modify `frontend/src/config/navigation.js`: add cockpit navigation item.
- Modify `frontend/src/config/navigation.test.js`: verify cockpit route remains reachable.
- Create `outputs/yunhe-cockpit-stage4-framework-report.md` and update `outputs/yunhe-cockpit-task-list-updated.xlsx` after implementation.

---

### Task 1: Responsive cockpit breakpoint helper

**Files:**
- Create: `frontend/src/composables/useResponsiveCockpit.test.js`
- Create: `frontend/src/composables/useResponsiveCockpit.js`

**Interfaces:**
- Produces: `getCockpitBreakpoint(width: number): 'xl' | 'lg' | 'md' | 'sm'`
- Produces: `getCockpitLayoutMetrics(width: number, height?: number): { breakpoint: string, headerHeight: number, leftWidth: number, rightWidth: number, bottomHeight: number, compact: boolean, centerMinRatio: number }`
- Produces: `useResponsiveCockpit(): { width, height, metrics, updateViewport }`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/composables/useResponsiveCockpit.test.js`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { getCockpitBreakpoint, getCockpitLayoutMetrics } from './useResponsiveCockpit.js'

test('maps viewport widths to cockpit breakpoints', () => {
  assert.equal(getCockpitBreakpoint(1920), 'xl')
  assert.equal(getCockpitBreakpoint(1600), 'lg')
  assert.equal(getCockpitBreakpoint(1440), 'md')
  assert.equal(getCockpitBreakpoint(1366), 'sm')
})

test('calculates layout metrics with readable minimum panel sizes', () => {
  assert.deepEqual(getCockpitLayoutMetrics(1920, 1080), {
    breakpoint: 'xl',
    headerHeight: 56,
    leftWidth: 360,
    rightWidth: 380,
    bottomHeight: 210,
    compact: false,
    centerMinRatio: 0.45
  })
  assert.equal(getCockpitLayoutMetrics(1600, 900).leftWidth, 320)
  assert.equal(getCockpitLayoutMetrics(1440, 900).rightWidth, 320)
  assert.equal(getCockpitLayoutMetrics(1366, 768).bottomHeight, 180)
  assert.equal(getCockpitLayoutMetrics(1366, 768).compact, true)
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/composables/useResponsiveCockpit.test.js
```

Expected: FAIL with module not found.

- [ ] **Step 3: Implement helper**

Create `frontend/src/composables/useResponsiveCockpit.js`:

```js
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function getCockpitBreakpoint(width = 1366) {
  if (width >= 1920) return 'xl'
  if (width >= 1600) return 'lg'
  if (width >= 1440) return 'md'
  return 'sm'
}

export function getCockpitLayoutMetrics(width = 1366, height = 768) {
  const breakpoint = getCockpitBreakpoint(width)
  const table = {
    xl: { leftWidth: 360, rightWidth: 380, bottomHeight: 210, compact: false },
    lg: { leftWidth: 320, rightWidth: 340, bottomHeight: 210, compact: false },
    md: { leftWidth: 300, rightWidth: 320, bottomHeight: 200, compact: false },
    sm: { leftWidth: 280, rightWidth: 300, bottomHeight: 180, compact: true }
  }
  const metrics = table[breakpoint]
  return {
    breakpoint,
    headerHeight: 56,
    leftWidth: metrics.leftWidth,
    rightWidth: metrics.rightWidth,
    bottomHeight: Math.max(height < 760 ? 160 : metrics.bottomHeight, 160),
    compact: metrics.compact,
    centerMinRatio: 0.45
  }
}

export function useResponsiveCockpit() {
  const width = ref(typeof window === 'undefined' ? 1366 : window.innerWidth)
  const height = ref(typeof window === 'undefined' ? 768 : window.innerHeight)

  function updateViewport(nextWidth, nextHeight) {
    width.value = nextWidth ?? (typeof window === 'undefined' ? width.value : window.innerWidth)
    height.value = nextHeight ?? (typeof window === 'undefined' ? height.value : window.innerHeight)
  }

  if (typeof window !== 'undefined') {
    onMounted(() => {
      updateViewport()
      window.addEventListener('resize', updateViewport)
    })
    onBeforeUnmount(() => window.removeEventListener('resize', updateViewport))
  }

  const metrics = computed(() => getCockpitLayoutMetrics(width.value, height.value))
  return { width, height, metrics, updateViewport }
}
```

- [ ] **Step 4: Run tests to verify pass**

Run same command. Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/composables/useResponsiveCockpit.js frontend/src/composables/useResponsiveCockpit.test.js
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'feat: add cockpit responsive layout helper'
```

---

### Task 2: Drawer manager helper

**Files:**
- Create: `frontend/src/composables/useDrawerManager.test.js`
- Create: `frontend/src/composables/useDrawerManager.js`

**Interfaces:**
- Produces: `COCKPIT_DRAWER_TYPES: string[]`
- Produces: `buildDrawerQuery(type: string, params?: object, baseQuery?: object): object`
- Produces: `clearDrawerQuery(baseQuery?: object): object`
- Produces: `useDrawerManager(router, route): { currentDrawer, drawerParams, isDrawerOpen, openDrawer, closeDrawer }`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/composables/useDrawerManager.test.js`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { buildDrawerQuery, clearDrawerQuery, COCKPIT_DRAWER_TYPES } from './useDrawerManager.js'

test('defines supported single business drawer types', () => {
  assert.deepEqual(COCKPIT_DRAWER_TYPES, ['machine', 'task', 'sensor', 'control', 'report'])
})

test('builds drawer query while replacing any existing drawer state', () => {
  assert.deepEqual(
    buildDrawerQuery('machine', { machineId: 'M-001' }, { page: '1', drawer: 'task', taskId: 'T-1' }),
    { page: '1', drawer: 'machine', machineId: 'M-001' }
  )
})

test('clears drawer related query keys without removing unrelated query', () => {
  assert.deepEqual(
    clearDrawerQuery({ drawer: 'machine', machineId: 'M-001', taskId: 'T-1', page: '2' }),
    { page: '2' }
  )
})

test('rejects unsupported drawer types', () => {
  assert.throws(() => buildDrawerQuery('unknown'), /Unsupported cockpit drawer/)
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/composables/useDrawerManager.test.js
```

Expected: FAIL with module not found.

- [ ] **Step 3: Implement helper**

Create `frontend/src/composables/useDrawerManager.js`:

```js
import { computed, ref, watch } from 'vue'

export const COCKPIT_DRAWER_TYPES = ['machine', 'task', 'sensor', 'control', 'report']
const DRAWER_QUERY_KEYS = ['drawer', 'machineId', 'taskId', 'sensorId', 'reportId']

function assertDrawerType(type) {
  if (!COCKPIT_DRAWER_TYPES.includes(type)) throw new Error(`Unsupported cockpit drawer: ${type}`)
}

export function clearDrawerQuery(baseQuery = {}) {
  const next = { ...baseQuery }
  for (const key of DRAWER_QUERY_KEYS) delete next[key]
  return next
}

export function buildDrawerQuery(type, params = {}, baseQuery = {}) {
  assertDrawerType(type)
  return {
    ...clearDrawerQuery(baseQuery),
    drawer: type,
    ...params
  }
}

export function useDrawerManager(router, route) {
  const currentDrawer = ref(route?.query?.drawer || null)
  const drawerParams = ref(clearDrawerQuery(route?.query || {}))

  if (route) {
    watch(
      () => route.query,
      query => {
        currentDrawer.value = query.drawer || null
        drawerParams.value = clearDrawerQuery(query || {})
      },
      { immediate: true }
    )
  }

  const isDrawerOpen = computed(() => Boolean(currentDrawer.value))

  async function openDrawer(type, params = {}, options = {}) {
    const query = buildDrawerQuery(type, params, route?.query || {})
    currentDrawer.value = type
    drawerParams.value = params
    if (router && options.syncRoute !== false) await router.replace({ query })
  }

  async function closeDrawer(options = {}) {
    currentDrawer.value = null
    drawerParams.value = {}
    if (router && options.syncRoute !== false) await router.replace({ query: clearDrawerQuery(route?.query || {}) })
  }

  return { currentDrawer, drawerParams, isDrawerOpen, openDrawer, closeDrawer }
}
```

- [ ] **Step 4: Run tests to verify pass**

Run same command. Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/composables/useDrawerManager.js frontend/src/composables/useDrawerManager.test.js
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'feat: add cockpit drawer manager'
```

---

### Task 3: Dialog manager helper

**Files:**
- Create: `frontend/src/composables/useDialogManager.test.js`
- Create: `frontend/src/composables/useDialogManager.js`

**Interfaces:**
- Produces: `COCKPIT_DIALOG_TYPES: string[]`
- Produces: `createDialogState(): object`
- Produces: `useDialogManager(): { dialogs, openDialog, closeDialog, closeAllDialogs }`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/composables/useDialogManager.test.js`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { COCKPIT_DIALOG_TYPES, createDialogState } from './useDialogManager.js'

test('creates closed state for supported cockpit dialogs', () => {
  assert.deepEqual(COCKPIT_DIALOG_TYPES, ['aiVision', 'sensorSimulator'])
  assert.deepEqual(createDialogState(), {
    aiVision: { open: false, params: {} },
    sensorSimulator: { open: false, params: {} }
  })
})

test('creates independent state objects for each call', () => {
  const first = createDialogState()
  const second = createDialogState()
  first.aiVision.open = true
  assert.equal(second.aiVision.open, false)
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/composables/useDialogManager.test.js
```

Expected: FAIL with module not found.

- [ ] **Step 3: Implement helper**

Create `frontend/src/composables/useDialogManager.js`:

```js
import { reactive } from 'vue'

export const COCKPIT_DIALOG_TYPES = ['aiVision', 'sensorSimulator']

export function createDialogState() {
  return Object.fromEntries(COCKPIT_DIALOG_TYPES.map(type => [type, { open: false, params: {} }]))
}

function assertDialogType(type) {
  if (!COCKPIT_DIALOG_TYPES.includes(type)) throw new Error(`Unsupported cockpit dialog: ${type}`)
}

export function useDialogManager() {
  const dialogs = reactive(createDialogState())

  function openDialog(type, params = {}) {
    assertDialogType(type)
    dialogs[type].open = true
    dialogs[type].params = { ...params }
  }

  function closeDialog(type) {
    assertDialogType(type)
    dialogs[type].open = false
    dialogs[type].params = {}
  }

  function closeAllDialogs() {
    for (const type of COCKPIT_DIALOG_TYPES) closeDialog(type)
  }

  return { dialogs, openDialog, closeDialog, closeAllDialogs }
}
```

- [ ] **Step 4: Run tests to verify pass**

Run same command. Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/composables/useDialogManager.js frontend/src/composables/useDialogManager.test.js
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'feat: add cockpit dialog manager'
```

---

### Task 4: Cockpit shell components

**Files:**
- Create: `frontend/src/components/cockpit/CockpitHeader.vue`
- Create: `frontend/src/components/cockpit/CockpitLeftPanel.vue`
- Create: `frontend/src/components/cockpit/CockpitCenterPanel.vue`
- Create: `frontend/src/components/cockpit/CockpitRightPanel.vue`
- Create: `frontend/src/components/cockpit/CockpitBottomPanel.vue`
- Create: `frontend/src/components/cockpit/CockpitDrawerHost.vue`
- Create: `frontend/src/components/cockpit/CockpitDialogHost.vue`

**Interfaces:**
- Consumes: `.yh-cockpit` and `.yh-panel` classes.
- Produces: slot-based cockpit containers.
- Produces: `CockpitHeader` emits `toggle-fullscreen` and `logout`.

- [ ] **Step 1: Create panel containers**

Create each simple panel component:

`CockpitLeftPanel.vue`:

```vue
<template>
  <aside class="cockpit-left yh-panel"><slot /></aside>
</template>
```

`CockpitCenterPanel.vue`:

```vue
<template>
  <section class="cockpit-center yh-panel"><slot /></section>
</template>
```

`CockpitRightPanel.vue`:

```vue
<template>
  <aside class="cockpit-right yh-panel"><slot /></aside>
</template>
```

`CockpitBottomPanel.vue`:

```vue
<template>
  <section class="cockpit-bottom yh-panel"><slot /></section>
</template>
```

- [ ] **Step 2: Create CockpitHeader**

Create `CockpitHeader.vue`:

```vue
<template>
  <header class="cockpit-header yh-panel">
    <div class="cockpit-header__brand">
      <span class="cockpit-header__logo">云</span>
      <div>
        <strong>{{ systemName }}</strong>
        <small>{{ environmentLabel }}</small>
      </div>
    </div>

    <div class="cockpit-header__statuses">
      <span :class="statusClass(apiStatus)">API {{ statusLabel(apiStatus) }}</span>
      <span :class="statusClass(wsStatus)">WS {{ statusLabel(wsStatus) }}</span>
      <span :class="statusClass(mqttStatus)">MQTT {{ statusLabel(mqttStatus) }}</span>
    </div>

    <div class="cockpit-header__actions">
      <time>{{ timeText }}</time>
      <button type="button" @click="$emit('toggle-fullscreen')">全屏</button>
      <button type="button" @click="$emit('logout')">{{ username }} · {{ roleText }}</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { getCockpitStatusMeta } from '../../utils/status-theme.js'

const props = defineProps({
  systemName: { type: String, default: '云禾智控驾驶舱' },
  environmentLabel: { type: String, default: '智慧农机融合驾驶舱' },
  apiStatus: { type: String, default: 'unknown' },
  wsStatus: { type: String, default: 'unknown' },
  mqttStatus: { type: String, default: 'unknown' },
  username: { type: String, default: '用户' },
  roleText: { type: String, default: '登录用户' },
  currentTime: { type: Date, default: () => new Date() }
})

defineEmits(['toggle-fullscreen', 'logout'])

const timeText = computed(() => props.currentTime.toLocaleTimeString('zh-CN', { hour12: false }))
const statusClass = status => getCockpitStatusMeta(status).className
const statusLabel = status => getCockpitStatusMeta(status).label
</script>
```

- [ ] **Step 3: Create hosts**

Create `CockpitDrawerHost.vue`:

```vue
<template>
  <el-drawer :model-value="open" :title="title" size="420px" @close="$emit('close')">
    <slot>
      <el-empty description="请选择驾驶舱业务对象" />
    </slot>
  </el-drawer>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '业务详情' }
})

defineEmits(['close'])
</script>
```

Create `CockpitDialogHost.vue`:

```vue
<template>
  <el-dialog :model-value="aiVisionOpen" title="AI视觉" width="720px" @close="$emit('close-dialog', 'aiVision')">
    <slot name="aiVision"><el-empty description="AI视觉弹窗待接入" /></slot>
  </el-dialog>
  <el-dialog :model-value="sensorSimulatorOpen" title="传感器模拟器" width="720px" @close="$emit('close-dialog', 'sensorSimulator')">
    <slot name="sensorSimulator"><el-empty description="传感器模拟器弹窗待接入" /></slot>
  </el-dialog>
</template>

<script setup>
defineProps({
  aiVisionOpen: { type: Boolean, default: false },
  sensorSimulatorOpen: { type: Boolean, default: false }
})

defineEmits(['close-dialog'])
</script>
```

- [ ] **Step 4: Add cockpit component CSS**

Append to `frontend/src/styles/cockpit.css`:

```css
.yh-cockpit .cockpit-header,
.yh-cockpit .cockpit-left,
.yh-cockpit .cockpit-center,
.yh-cockpit .cockpit-right,
.yh-cockpit .cockpit-bottom {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.yh-cockpit .cockpit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--yh-space-4);
}

.yh-cockpit .cockpit-header__brand,
.yh-cockpit .cockpit-header__statuses,
.yh-cockpit .cockpit-header__actions {
  display: flex;
  align-items: center;
  gap: var(--yh-space-3);
}

.yh-cockpit .cockpit-header__brand strong {
  display: block;
  color: var(--yh-text-primary);
  font-size: var(--yh-font-size-section);
}

.yh-cockpit .cockpit-header__brand small {
  color: var(--yh-text-muted);
}

.yh-cockpit .cockpit-header__logo {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  color: var(--yh-color-cyan);
  border: 1px solid var(--yh-border-glow);
  border-radius: var(--yh-radius-md);
}
```

- [ ] **Step 5: Build check**

Run:

```powershell
$env:PATH='C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

Expected: build exit code 0.

- [ ] **Step 6: Commit**

```powershell
git add frontend/src/components/cockpit frontend/src/styles/cockpit.css
git commit -m "feat: add cockpit shell components"
```

---

### Task 5: UnifiedCockpit page and route

**Files:**
- Create: `frontend/src/views/UnifiedCockpit.vue`
- Modify: `frontend/src/router/index.js`
- Modify: `frontend/src/config/navigation.js`
- Modify: `frontend/src/config/navigation.test.js`

**Interfaces:**
- Consumes: components/composables from Tasks 1-4.
- Produces: `/cockpit` route and navigation entry.

- [ ] **Step 1: Update navigation test first**

Modify `frontend/src/config/navigation.test.js` to assert `/cockpit` exists. Add this assertion in the existing route reachability test:

```js
assert.ok(navigationItems.some(item => item.path === '/cockpit'))
```

- [ ] **Step 2: Run navigation test and verify failure**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/config/navigation.test.js
```

Expected: FAIL because navigation lacks `/cockpit`.

- [ ] **Step 3: Create UnifiedCockpit page**

Create `frontend/src/views/UnifiedCockpit.vue`:

```vue
<template>
  <div class="unified-cockpit yh-cockpit" :style="layoutStyle">
    <CockpitHeader
      class="unified-cockpit__header"
      system-name="云禾智控驾驶舱"
      environment-label="智慧农机融合驾驶舱"
      :api-status="store.error ? 'danger' : 'online'"
      :ws-status="store.error ? 'offline' : 'online'"
      :mqtt-status="store.error ? 'offline' : 'online'"
      :username="authStore.username || '用户'"
      :role-text="roleText"
      :current-time="clock"
      @toggle-fullscreen="toggleFullscreen"
      @logout="authStore.logout()"
    />

    <CockpitLeftPanel class="unified-cockpit__left">
      <KpiCard v-for="item in snapshot.kpis" :key="item.title" :item="item" />
    </CockpitLeftPanel>

    <CockpitCenterPanel class="unified-cockpit__center">
      <GisMap :machines="snapshot.topMachines" :fields="snapshot.fields" />
    </CockpitCenterPanel>

    <CockpitRightPanel class="unified-cockpit__right">
      <DashboardPanel title="任务与告警">
        <DashboardTable :columns="alarmColumns" :items="snapshot.alarms" empty-text="暂无告警" />
      </DashboardPanel>
      <button type="button" class="cockpit-action" @click="openDrawer('machine', { machineId: snapshot.topMachines[0]?.id || '' })">
        打开设备抽屉
      </button>
      <button type="button" class="cockpit-action" @click="openDialog('aiVision')">打开AI弹窗</button>
    </CockpitRightPanel>

    <CockpitBottomPanel class="unified-cockpit__bottom">
      <TrendChart unit="亩" :today="snapshot.trends.areaToday" :yesterday="snapshot.trends.areaYesterday" />
      <TrendChart unit="L" :today="snapshot.trends.fuelToday" :yesterday="snapshot.trends.fuelYesterday" />
    </CockpitBottomPanel>

    <CockpitDrawerHost :open="isDrawerOpen" :title="drawerTitle" @close="closeDrawer">
      <p>当前抽屉：{{ currentDrawer || '--' }}</p>
      <pre>{{ drawerParams }}</pre>
    </CockpitDrawerHost>

    <CockpitDialogHost
      :ai-vision-open="dialogs.aiVision.open"
      :sensor-simulator-open="dialogs.sensorSimulator.open"
      @close-dialog="closeDialog"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CockpitBottomPanel from '../components/cockpit/CockpitBottomPanel.vue'
import CockpitCenterPanel from '../components/cockpit/CockpitCenterPanel.vue'
import CockpitDialogHost from '../components/cockpit/CockpitDialogHost.vue'
import CockpitDrawerHost from '../components/cockpit/CockpitDrawerHost.vue'
import CockpitHeader from '../components/cockpit/CockpitHeader.vue'
import CockpitLeftPanel from '../components/cockpit/CockpitLeftPanel.vue'
import CockpitRightPanel from '../components/cockpit/CockpitRightPanel.vue'
import DashboardPanel from '../components/dashboard/DashboardPanel.vue'
import DashboardTable from '../components/dashboard/DashboardTable.vue'
import GisMap from '../components/dashboard/GisMap.vue'
import KpiCard from '../components/dashboard/KpiCard.vue'
import TrendChart from '../components/dashboard/TrendChart.vue'
import { useDialogManager } from '../composables/useDialogManager.js'
import { useDrawerManager } from '../composables/useDrawerManager.js'
import { useResponsiveCockpit } from '../composables/useResponsiveCockpit.js'
import { useAuthStore, useDashboardStore } from '../store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const store = useDashboardStore()
const { metrics } = useResponsiveCockpit()
const { currentDrawer, drawerParams, isDrawerOpen, openDrawer, closeDrawer } = useDrawerManager(router, route)
const { dialogs, openDialog, closeDialog } = useDialogManager()
const clock = ref(new Date())
let timer

const snapshot = computed(() => store.snapshot)
const roleText = computed(() => authStore.roles?.[0]?.replace('ROLE_', '') || '登录用户')
const drawerTitle = computed(() => currentDrawer.value ? `业务抽屉：${currentDrawer.value}` : '业务详情')
const alarmColumns = [
  { key: 'time', label: '时间' },
  { key: 'device', label: '设备' },
  { key: 'type', label: '类型' },
  { key: 'statusText', label: '状态' }
]

const layoutStyle = computed(() => ({
  '--cockpit-header-height': `${metrics.value.headerHeight}px`,
  '--cockpit-left-width': `${metrics.value.leftWidth}px`,
  '--cockpit-right-width': `${metrics.value.rightWidth}px`,
  '--cockpit-bottom-height': `${metrics.value.bottomHeight}px`
}))

async function toggleFullscreen() {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    await document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    await document.exitFullscreen()
  }
}

onMounted(() => {
  store.load().catch(() => {})
  timer = window.setInterval(() => { clock.value = new Date() }, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>
```

- [ ] **Step 4: Add page CSS**

Append to `frontend/src/styles/cockpit.css`:

```css
.yh-cockpit.unified-cockpit {
  display: grid;
  width: 100%;
  height: 100%;
  padding: var(--yh-space-3);
  gap: var(--yh-space-3);
  grid-template-columns: var(--cockpit-left-width) minmax(45%, 1fr) var(--cockpit-right-width);
  grid-template-rows: var(--cockpit-header-height) minmax(0, 1fr) var(--cockpit-bottom-height);
  grid-template-areas:
    'header header header'
    'left center right'
    'left bottom right';
}

.yh-cockpit .unified-cockpit__header { grid-area: header; }
.yh-cockpit .unified-cockpit__left { grid-area: left; overflow: auto; }
.yh-cockpit .unified-cockpit__center { grid-area: center; min-width: 0; }
.yh-cockpit .unified-cockpit__right { grid-area: right; overflow: auto; }
.yh-cockpit .unified-cockpit__bottom { grid-area: bottom; display: grid; grid-template-columns: 1fr 1fr; gap: var(--yh-space-3); }
.yh-cockpit .cockpit-action { margin-top: var(--yh-space-3); padding: 8px 12px; color: var(--yh-text-primary); background: rgba(47, 140, 255, 0.16); border: 1px solid var(--yh-border-panel); border-radius: var(--yh-radius-sm); }
```

- [ ] **Step 5: Add route and nav**

In `frontend/src/router/index.js`, add route before catch-all:

```js
{
  path: '/cockpit',
  name: 'UnifiedCockpit',
  component: () => import('../views/UnifiedCockpit.vue')
},
```

In `frontend/src/config/navigation.js`, add navigation item:

```js
{ label: '融合驾驶舱', path: '/cockpit' },
```

Use the existing navigation item shape; if it has icons/keys, match that shape exactly.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/**/*.test.js
$env:PATH='C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

Expected: tests pass; build exit code 0.

- [ ] **Step 7: Commit**

```powershell
git add frontend/src/views/UnifiedCockpit.vue frontend/src/router/index.js frontend/src/config/navigation.js frontend/src/config/navigation.test.js frontend/src/styles/cockpit.css
git commit -m "feat: add unified cockpit route"
```

---

### Task 6: Stage 4 reporting and final verification

**Files:**
- Create: `C:\Users\25741\Documents\Codex\2026-07-02\k\outputs\yunhe-cockpit-stage4-framework-report.md`
- Modify: `C:\Users\25741\Documents\Codex\2026-07-02\k\outputs\yunhe-cockpit-task-list-updated.xlsx`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: stage 4 evidence and task status updates.

- [ ] **Step 1: Full verification**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/**/*.test.js
$env:PATH='C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

Expected: all tests pass; build exit code 0.

- [ ] **Step 2: Create report**

Create report with this content:

```markdown
# 云禾智控驾驶舱重构 - 阶段4驾驶舱整体框架报告

## 完成内容

- 新增 `/cockpit` 路由与 `UnifiedCockpit.vue`。
- 新增 `components/cockpit/*` 框架组件：Header、Left/Center/Right/Bottom、DrawerHost、DialogHost。
- 新增响应式断点 helper，覆盖 1920/1600/1440/1366。
- 新增单抽屉管理 helper，支持 query 同步构造与清理。
- 新增弹窗管理 helper，支持 AI 视觉与传感器模拟器弹窗状态。
- 保留原 `/`、`/integrated`、`/home` 与业务页面。

## 验证

- 单元测试：记录最终 tests/pass/fail。
- 生产构建：记录 exit 0；chunk size warning 留待阶段11。
- 路由：`/cockpit` 已加入 router 与 navigation。

## 后续

- 阶段5将地图、任务、告警、趋势等核心视觉模块迁入 UnifiedCockpit。
- 阶段6将设备、任务、传感器、控制、报表等业务抽屉接入 DrawerHost。
```

- [ ] **Step 3: Update workbook rows 35-44**

Update `outputs/yunhe-cockpit-task-list-updated.xlsx` rows for sequence 35-44 to `已完成`, with concise evidence notes:

- 35: `UnifiedCockpit Grid 骨架已落地`
- 36: `CockpitHeader 已落地`
- 37: `CockpitLeftPanel 容器已落地`
- 38: `CockpitCenterPanel 容器已落地`
- 39: `CockpitRightPanel 容器已落地`
- 40: `CockpitBottomPanel 容器已落地`
- 41: `useResponsiveCockpit 已覆盖断点测试`
- 42: `useDrawerManager 已覆盖单抽屉/query 测试`
- 43: `useDialogManager 与 DialogHost 已落地`
- 44: `/cockpit 路由与 navigation 已落地`

- [ ] **Step 4: Final git status**

Run:

```powershell
git status --short --branch
```

Expected: clean project working tree. Output artifacts may live outside repo.
```
