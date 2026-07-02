# Cockpit Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the phase 3 scoped cockpit visual design system for the smart agriculture dashboard without adding dependencies or polluting login/legacy pages.

**Architecture:** Add CSS token and scoped cockpit style layers, attach `.yh-cockpit` only to cockpit pages/components, and extend JavaScript theme helpers for ECharts/status state. Existing exports remain compatible while new helpers provide stable interfaces for later cockpit refactors.

**Tech Stack:** Vue 3, Vite 4, Element Plus, ECharts 5, plain CSS variables, Node `node:test`.

## Global Constraints

- Do not modify Spring Boot backend, database schema, existing interface paths, request methods, request parameters, or response structures.
- Do not add Sass/Less or any new dependency because current environment lacks npm/corepack for install verification.
- All Element Plus cockpit overrides must be scoped under `.yh-cockpit`.
- Keep login page and legacy pages unaffected unless they explicitly opt into `.yh-cockpit`.
- Preserve existing exports from `src/utils/echarts-theme.js`.
- Add tests for new JavaScript theme/status helpers before implementation.
- Build must pass with `scripts/build-win.ps1`; existing chunk size warning is allowed and belongs to phase 11.

---

## File Structure

- Create `frontend/src/styles/cockpit-tokens.css`: source of `--yh-*` cockpit design tokens.
- Create `frontend/src/styles/cockpit.css`: `.yh-cockpit` scoped layout primitives, panels, Element Plus overrides, status badge classes.
- Modify `frontend/src/styles/variables.css`: bridge legacy variables to new `--yh-*` tokens while keeping old names.
- Modify `frontend/src/styles/global.css`: remove cockpit-specific global Element Plus overrides only after scoped equivalents exist.
- Modify `frontend/src/main.js`: import cockpit token/style files.
- Modify cockpit pages/components root wrappers: add `.yh-cockpit` to `DashboardView.vue` and `IntegratedView.vue`; later pages may opt in when migrated.
- Modify `frontend/src/utils/echarts-theme.js`: add `cockpitChartPalette`, `cockpitChartTheme`, `getCockpitTooltip`, `getCockpitAxis`, `getCockpitLegend`, `getChartEmptyOption`, `getChartLoadingOptions` while preserving old exports.
- Create `frontend/src/utils/status-theme.js`: define cockpit status mapping helpers.
- Create `frontend/src/utils/status-theme.test.js`: TDD tests for status mapping.
- Modify/Create `frontend/src/utils/echarts-theme.test.js`: TDD tests for new ECharts helpers.
- Modify `docs/superpowers/specs/2026-07-02-cockpit-design-system-design.md` only if implementation reveals a spec correction.
- Update output workbook/report after implementation, not during individual code tasks.

---

### Task 1: Add status theme helper with tests

**Files:**
- Create: `frontend/src/utils/status-theme.test.js`
- Create: `frontend/src/utils/status-theme.js`

**Interfaces:**
- Produces: `COCKPIT_STATUS_TYPES: string[]`
- Produces: `getCockpitStatusMeta(status: string): { type: string, label: string, className: string }`
- Produces: `normalizeCockpitStatus(status: string): string`
- Consumes: No project internals.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/utils/status-theme.test.js`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  COCKPIT_STATUS_TYPES,
  getCockpitStatusMeta,
  normalizeCockpitStatus
} from './status-theme.js'

test('normalizes common backend and UI statuses to cockpit status types', () => {
  assert.deepEqual(COCKPIT_STATUS_TYPES, ['success', 'warning', 'danger', 'info', 'offline', 'stale'])
  assert.equal(normalizeCockpitStatus('ONLINE'), 'success')
  assert.equal(normalizeCockpitStatus('COMPLETED'), 'success')
  assert.equal(normalizeCockpitStatus('IN_PROGRESS'), 'warning')
  assert.equal(normalizeCockpitStatus('ALARM'), 'danger')
  assert.equal(normalizeCockpitStatus('OFFLINE'), 'offline')
  assert.equal(normalizeCockpitStatus('EXPIRED'), 'stale')
  assert.equal(normalizeCockpitStatus('unknown-value'), 'info')
})

test('returns class names and readable labels for cockpit status badges', () => {
  assert.deepEqual(getCockpitStatusMeta('ONLINE'), {
    type: 'success',
    label: '在线',
    className: 'yh-status-badge yh-status-badge--success'
  })
  assert.deepEqual(getCockpitStatusMeta('OFFLINE'), {
    type: 'offline',
    label: '离线',
    className: 'yh-status-badge yh-status-badge--offline'
  })
  assert.deepEqual(getCockpitStatusMeta('EXPIRED'), {
    type: 'stale',
    label: '过期',
    className: 'yh-status-badge yh-status-badge--stale'
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/utils/status-theme.test.js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `status-theme.js`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/utils/status-theme.js`:

```js
export const COCKPIT_STATUS_TYPES = ['success', 'warning', 'danger', 'info', 'offline', 'stale']

const STATUS_ALIASES = {
  ONLINE: 'success',
  NORMAL: 'success',
  SUCCESS: 'success',
  COMPLETED: 'success',
  RUNNING: 'warning',
  IN_PROGRESS: 'warning',
  PENDING: 'warning',
  WARNING: 'warning',
  ALARM: 'danger',
  ERROR: 'danger',
  DANGER: 'danger',
  FAULT: 'danger',
  OFFLINE: 'offline',
  DISCONNECTED: 'offline',
  STALE: 'stale',
  EXPIRED: 'stale',
  TIMEOUT: 'stale',
  INFO: 'info',
  UNKNOWN: 'info'
}

const STATUS_LABELS = {
  success: '在线',
  warning: '预警',
  danger: '告警',
  info: '信息',
  offline: '离线',
  stale: '过期'
}

export function normalizeCockpitStatus(status = '') {
  const normalized = String(status || '').trim().toUpperCase()
  return STATUS_ALIASES[normalized] || 'info'
}

export function getCockpitStatusMeta(status = '') {
  const type = normalizeCockpitStatus(status)
  return {
    type,
    label: STATUS_LABELS[type],
    className: `yh-status-badge yh-status-badge--${type}`
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/utils/status-theme.test.js
```

Expected: PASS, 2 tests, 0 failures.

- [ ] **Step 5: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/utils/status-theme.js frontend/src/utils/status-theme.test.js
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'feat: add cockpit status theme helpers'
```

---

### Task 2: Extend ECharts cockpit theme helpers with tests

**Files:**
- Create or Modify: `frontend/src/utils/echarts-theme.test.js`
- Modify: `frontend/src/utils/echarts-theme.js`

**Interfaces:**
- Produces: `cockpitChartPalette: string[]`
- Produces: `cockpitChartTheme: object`
- Produces: `getCockpitTooltip(overrides?: object): object`
- Produces: `getCockpitAxis({ name?: string, data?: string[], showSplitLine?: boolean } = {}): object`
- Produces: `getCockpitLegend(overrides?: object): object`
- Produces: `getChartEmptyOption(message?: string): object`
- Produces: `getChartLoadingOptions(): object`
- Consumes: Existing `echarts-theme.js` exports remain available.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/utils/echarts-theme.test.js`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  cockpitChartPalette,
  cockpitChartTheme,
  getChartEmptyOption,
  getChartLoadingOptions,
  getCockpitAxis,
  getCockpitLegend,
  getCockpitTooltip,
  getDarkTooltip
} from './echarts-theme.js'

test('exports reusable cockpit chart palette and theme', () => {
  assert.ok(cockpitChartPalette.length >= 6)
  assert.equal(cockpitChartPalette[0], '#35D6FF')
  assert.deepEqual(cockpitChartTheme.color, cockpitChartPalette)
  assert.equal(cockpitChartTheme.backgroundColor, 'transparent')
})

test('builds cockpit tooltip axis and legend options', () => {
  assert.equal(getCockpitTooltip().backgroundColor, 'rgba(3, 16, 29, 0.94)')
  assert.equal(getCockpitTooltip({ trigger: 'axis' }).trigger, 'axis')

  const axis = getCockpitAxis({ name: '亩', data: ['一', '二'] })
  assert.equal(axis.name, '亩')
  assert.deepEqual(axis.data, ['一', '二'])
  assert.equal(axis.axisTick.show, false)
  assert.equal(axis.splitLine.show, true)

  const legend = getCockpitLegend({ top: 4 })
  assert.equal(legend.top, 4)
  assert.equal(legend.textStyle.color, 'rgba(220, 236, 255, 0.72)')
})

test('keeps legacy dark tooltip export compatible', () => {
  assert.equal(getDarkTooltip().borderWidth, 1)
})

test('provides empty and loading chart options', () => {
  const empty = getChartEmptyOption('暂无趋势数据')
  assert.equal(empty.title.text, '暂无趋势数据')
  assert.equal(empty.xAxis.show, false)
  assert.equal(empty.yAxis.show, false)

  const loading = getChartLoadingOptions()
  assert.equal(loading.text, '加载中...')
  assert.equal(loading.color, '#35D6FF')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/utils/echarts-theme.test.js
```

Expected: FAIL because new named exports do not exist.

- [ ] **Step 3: Add minimal implementation while preserving old exports**

At the top of `frontend/src/utils/echarts-theme.js`, add:

```js
export const cockpitChartPalette = ['#35D6FF', '#2F8CFF', '#45D483', '#F6C85F', '#FF6B6B', '#9B7CFF', '#5DE2C7']

export const cockpitChartTheme = {
  backgroundColor: 'transparent',
  color: cockpitChartPalette,
  textStyle: {
    color: 'rgba(220, 236, 255, 0.86)',
    fontFamily: 'Microsoft YaHei, PingFang SC, Helvetica Neue, Arial, sans-serif'
  }
}

export function getCockpitTooltip(overrides = {}) {
  return {
    backgroundColor: 'rgba(3, 16, 29, 0.94)',
    borderColor: 'rgba(53, 214, 255, 0.38)',
    borderWidth: 1,
    padding: [8, 10],
    textStyle: { color: '#F4F9FF', fontSize: 12 },
    extraCssText: 'box-shadow: 0 12px 30px rgba(0,0,0,.28); border-radius: 8px;',
    ...overrides
  }
}

export function getCockpitAxis({ name = '', data, showSplitLine = true } = {}) {
  return {
    name,
    data,
    axisLine: { lineStyle: { color: 'rgba(91, 166, 219, 0.36)' } },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(220, 236, 255, 0.62)', fontSize: 11 },
    splitLine: { show: showSplitLine, lineStyle: { color: 'rgba(91, 166, 219, 0.12)' } },
    nameTextStyle: { color: 'rgba(220, 236, 255, 0.62)', fontSize: 11 }
  }
}

export function getCockpitLegend(overrides = {}) {
  return {
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 6,
    textStyle: { color: 'rgba(220, 236, 255, 0.72)', fontSize: 12 },
    ...overrides
  }
}

export function getChartEmptyOption(message = '暂无数据') {
  return {
    title: {
      text: message,
      left: 'center',
      top: 'middle',
      textStyle: { color: 'rgba(220, 236, 255, 0.52)', fontSize: 13, fontWeight: 'normal' }
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: []
  }
}

export function getChartLoadingOptions() {
  return {
    text: '加载中...',
    color: '#35D6FF',
    textColor: 'rgba(220, 236, 255, 0.72)',
    maskColor: 'rgba(3, 16, 29, 0.38)',
    zlevel: 0
  }
}
```

Keep existing functions below unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/utils/echarts-theme.test.js
```

Expected: PASS, 4 tests, 0 failures.

- [ ] **Step 5: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/utils/echarts-theme.js frontend/src/utils/echarts-theme.test.js
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'feat: add cockpit chart theme helpers'
```

---

### Task 3: Add scoped cockpit CSS token and component style layers

**Files:**
- Create: `frontend/src/styles/cockpit-tokens.css`
- Create: `frontend/src/styles/cockpit.css`
- Modify: `frontend/src/styles/variables.css`
- Modify: `frontend/src/main.js`

**Interfaces:**
- Produces: CSS variables prefixed `--yh-*`.
- Produces: CSS classes `.yh-cockpit`, `.yh-panel`, `.yh-status-badge`.
- Consumes: No JavaScript interfaces.

- [ ] **Step 1: Create CSS files**

Create `frontend/src/styles/cockpit-tokens.css`:

```css
:root {
  --yh-bg-page: #03101d;
  --yh-bg-radial: radial-gradient(circle at 50% -20%, rgba(35, 140, 255, 0.24), transparent 38%);
  --yh-bg-panel: linear-gradient(180deg, rgba(9, 30, 50, 0.94), rgba(4, 18, 32, 0.96));
  --yh-bg-panel-strong: rgba(7, 25, 42, 0.96);
  --yh-bg-elevated: #07192a;

  --yh-color-primary: #2f8cff;
  --yh-color-cyan: #35d6ff;
  --yh-color-green: #45d483;
  --yh-color-amber: #f6c85f;
  --yh-color-red: #ff6b6b;
  --yh-color-purple: #9b7cff;

  --yh-text-primary: #f4f9ff;
  --yh-text-secondary: #dcecff;
  --yh-text-muted: #9eb6cf;
  --yh-text-disabled: rgba(158, 182, 207, 0.48);

  --yh-border-subtle: rgba(91, 166, 219, 0.16);
  --yh-border-panel: rgba(91, 166, 219, 0.34);
  --yh-border-glow: rgba(53, 214, 255, 0.42);
  --yh-grid-line: rgba(91, 166, 219, 0.12);

  --yh-status-success-text: #85f0ad;
  --yh-status-success-bg: rgba(69, 212, 131, 0.13);
  --yh-status-success-border: rgba(69, 212, 131, 0.42);
  --yh-status-warning-text: #ffe08a;
  --yh-status-warning-bg: rgba(246, 200, 95, 0.13);
  --yh-status-warning-border: rgba(246, 200, 95, 0.42);
  --yh-status-danger-text: #ff9a9a;
  --yh-status-danger-bg: rgba(255, 107, 107, 0.14);
  --yh-status-danger-border: rgba(255, 107, 107, 0.46);
  --yh-status-info-text: #b9d7ff;
  --yh-status-info-bg: rgba(47, 140, 255, 0.12);
  --yh-status-info-border: rgba(47, 140, 255, 0.36);
  --yh-status-offline-text: #b8c1cc;
  --yh-status-offline-bg: rgba(127, 143, 164, 0.12);
  --yh-status-offline-border: rgba(127, 143, 164, 0.32);
  --yh-status-stale-text: #d7b8ff;
  --yh-status-stale-bg: rgba(155, 124, 255, 0.12);
  --yh-status-stale-border: rgba(155, 124, 255, 0.36);

  --yh-font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  --yh-font-digital: 'DIN Alternate', Bahnschrift, 'Roboto Mono', Consolas, monospace;
  --yh-font-size-title: 22px;
  --yh-font-size-section: 16px;
  --yh-font-size-kpi: 28px;
  --yh-font-size-body: 14px;
  --yh-font-size-small: 12px;
  --yh-font-size-tag: 12px;
  --yh-line-height-body: 1.5;

  --yh-space-1: 4px;
  --yh-space-2: 8px;
  --yh-space-3: 12px;
  --yh-space-4: 16px;
  --yh-space-5: 20px;
  --yh-space-6: 24px;
  --yh-space-8: 32px;

  --yh-radius-sm: 6px;
  --yh-radius-md: 10px;
  --yh-radius-lg: 16px;
  --yh-radius-pill: 999px;

  --yh-shadow-panel: 0 16px 36px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  --yh-shadow-glow: 0 0 22px rgba(53, 214, 255, 0.16);
  --yh-shadow-danger: 0 0 22px rgba(255, 107, 107, 0.16);
}
```

Create `frontend/src/styles/cockpit.css`:

```css
.yh-cockpit {
  min-height: 100%;
  color: var(--yh-text-secondary);
  background: var(--yh-bg-radial), var(--yh-bg-page);
  font-family: var(--yh-font-family);
  font-size: var(--yh-font-size-body);
  line-height: var(--yh-line-height-body);
}

.yh-cockpit .yh-panel,
.yh-cockpit .el-card.work-card,
.yh-cockpit .el-card.control-card,
.yh-cockpit .el-card.theme-card {
  color: var(--yh-text-secondary);
  background: var(--yh-bg-panel);
  border: 1px solid var(--yh-border-panel);
  border-radius: var(--yh-radius-lg);
  box-shadow: var(--yh-shadow-panel);
}

.yh-cockpit .el-card,
.yh-cockpit .el-dialog,
.yh-cockpit .el-drawer {
  --el-bg-color: var(--yh-bg-elevated);
  --el-text-color-primary: var(--yh-text-primary);
  --el-text-color-regular: var(--yh-text-secondary);
  --el-border-color: var(--yh-border-panel);
  --el-card-bg-color: transparent;
  --el-card-border-color: var(--yh-border-panel);
}

.yh-cockpit .el-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(9, 30, 50, 0.92);
  --el-table-border-color: var(--yh-border-subtle);
  --el-table-text-color: var(--yh-text-secondary);
  --el-table-header-text-color: var(--yh-text-muted);
  --el-table-row-hover-bg-color: rgba(47, 140, 255, 0.12);
}

.yh-cockpit .el-input__wrapper,
.yh-cockpit .el-select__wrapper,
.yh-cockpit .el-date-editor.el-input__wrapper {
  background: rgba(3, 16, 29, 0.78);
  border: 1px solid var(--yh-border-panel);
  box-shadow: none;
}

.yh-cockpit .el-input__inner,
.yh-cockpit .el-select__placeholder,
.yh-cockpit .el-select__selected-item,
.yh-cockpit .el-date-editor .el-input__inner {
  color: var(--yh-text-secondary);
}

.yh-cockpit .el-button--primary {
  --el-button-bg-color: var(--yh-color-primary);
  --el-button-border-color: var(--yh-color-primary);
  --el-button-hover-bg-color: #48a0ff;
  --el-button-hover-border-color: #48a0ff;
}

.yh-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 22px;
  padding: 2px 8px;
  border: 1px solid currentColor;
  border-radius: var(--yh-radius-pill);
  font-size: var(--yh-font-size-tag);
  line-height: 1.3;
  white-space: nowrap;
}

.yh-status-badge::before {
  width: 6px;
  height: 6px;
  content: '';
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}

.yh-status-badge--success { color: var(--yh-status-success-text); background: var(--yh-status-success-bg); border-color: var(--yh-status-success-border); }
.yh-status-badge--warning { color: var(--yh-status-warning-text); background: var(--yh-status-warning-bg); border-color: var(--yh-status-warning-border); }
.yh-status-badge--danger { color: var(--yh-status-danger-text); background: var(--yh-status-danger-bg); border-color: var(--yh-status-danger-border); }
.yh-status-badge--info { color: var(--yh-status-info-text); background: var(--yh-status-info-bg); border-color: var(--yh-status-info-border); }
.yh-status-badge--offline { color: var(--yh-status-offline-text); background: var(--yh-status-offline-bg); border-color: var(--yh-status-offline-border); }
.yh-status-badge--stale { color: var(--yh-status-stale-text); background: var(--yh-status-stale-bg); border-color: var(--yh-status-stale-border); }
```

- [ ] **Step 2: Bridge legacy variables**

Append to `frontend/src/styles/variables.css` inside the existing `:root` block or as a second `:root` block:

```css
:root {
  --bg-primary: var(--yh-bg-page, #0a1628);
  --bg-secondary: var(--yh-bg-elevated, #0d1f3c);
  --bg-card: var(--yh-bg-panel-strong, rgba(10, 22, 40, 0.85));
  --border-card: var(--yh-border-panel, rgba(0, 212, 255, 0.15));
  --border-highlight: var(--yh-border-glow, rgba(0, 212, 255, 0.4));
  --color-cyan: var(--yh-color-cyan, #00d4ff);
  --color-blue: var(--yh-color-primary, #0066ff);
  --color-gold: var(--yh-color-amber, #ffd700);
  --color-green: var(--yh-color-green, #00ff88);
  --color-red: var(--yh-color-red, #ff4757);
  --text-primary: var(--yh-text-primary, #ffffff);
  --text-secondary: var(--yh-text-secondary, rgba(255, 255, 255, 0.7));
  --text-muted: var(--yh-text-muted, rgba(255, 255, 255, 0.4));
  --font-family: var(--yh-font-family, 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif);
  --font-digital: var(--yh-font-digital, 'DIN Alternate', 'Courier New', monospace);
}
```

- [ ] **Step 3: Import cockpit styles**

Modify `frontend/src/main.js` imports to include cockpit files after variables and before global component use:

```js
import './styles/variables.css'
import './styles/cockpit-tokens.css'
import './styles/global.css'
import './styles/cockpit.css'
import './styles/animations.css'
```

- [ ] **Step 4: Run build to validate CSS imports**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

Expected: exit code 0. Chunk size warning may appear.

- [ ] **Step 5: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/styles/cockpit-tokens.css frontend/src/styles/cockpit.css frontend/src/styles/variables.css frontend/src/main.js
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'feat: add scoped cockpit design tokens'
```

---

### Task 4: Attach cockpit scope to cockpit pages and preserve legacy pages

**Files:**
- Modify: `frontend/src/views/DashboardView.vue`
- Modify: `frontend/src/views/IntegratedView.vue`

**Interfaces:**
- Consumes: `.yh-cockpit` class from Task 3.
- Produces: Cockpit scoped pages that activate Element Plus overrides.

- [ ] **Step 1: Add cockpit class to DashboardView root**

Change the first template wrapper in `frontend/src/views/DashboardView.vue` from:

```vue
<div class="screen">
```

to:

```vue
<div class="screen yh-cockpit">
```

- [ ] **Step 2: Add cockpit class to IntegratedView root**

Find the first root wrapper in `frontend/src/views/IntegratedView.vue`. If it is:

```vue
<div class="integrated-view">
```

change it to:

```vue
<div class="integrated-view yh-cockpit">
```

If the root class name differs, append `yh-cockpit` to the existing class list without removing the original class.

- [ ] **Step 3: Run tests and build**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/**/*.test.js
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

Expected: all tests pass; build exit code 0.

- [ ] **Step 4: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/views/DashboardView.vue frontend/src/views/IntegratedView.vue
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'feat: scope cockpit styles to dashboard pages'
```

---

### Task 5: Reduce global Element Plus pollution after scoped equivalents exist

**Files:**
- Modify: `frontend/src/styles/global.css`

**Interfaces:**
- Consumes: scoped Element Plus overrides from Task 3.
- Produces: global stylesheet that contains only reset/base/focus/scrollbar and safe shared variables.

- [ ] **Step 1: Edit global.css carefully**

In `frontend/src/styles/global.css`, keep these sections:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { ... }
#app { ... }
::-webkit-scrollbar { ... }
::-webkit-scrollbar-track { ... }
::-webkit-scrollbar-thumb { ... }
button, input, select { font: inherit; }
button, .el-button { transition: ...; }
button:hover:not(:disabled), .el-button:hover:not(:disabled) { transform: translateY(-1px); }
button:focus-visible, input:focus-visible, select:focus-visible { ... }
:root { --app-* variables ... }
```

Move or delete unscoped blocks that start with these selectors because Task 3 provides scoped replacements:

```css
.el-card.work-card,
.el-card.control-card,
.el-card.theme-card { ... }
.el-card.work-card > .el-card__header,
.el-card.control-card > .el-card__header,
.el-card.theme-card > .el-card__header { ... }
.el-card.work-card > .el-card__body,
.el-card.control-card > .el-card__body,
.el-card.theme-card > .el-card__body { ... }
.el-table { ... }
.el-table th.el-table__cell { ... }
.el-table tr,
.el-table td.el-table__cell { ... }
.el-input__wrapper,
.el-select__wrapper,
.el-date-editor.el-input__wrapper { ... }
.el-input__inner,
.el-select__placeholder,
.el-select__selected-item,
.el-date-editor .el-input__inner { ... }
.el-form-item__label,
.el-statistic__head { ... }
.el-statistic__content { ... }
```

- [ ] **Step 2: Run tests and build**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/**/*.test.js
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

Expected: all tests pass; build exit code 0.

- [ ] **Step 3: Commit**

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' add frontend/src/styles/global.css
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' commit -m 'refactor: limit cockpit element plus overrides to scope'
```

---

### Task 6: Final verification and phase 3 tracking outputs

**Files:**
- Modify: `outputs/yunhe-cockpit-task-list-updated.xlsx` through artifact generation script or workbook tooling.
- Create: `outputs/yunhe-cockpit-stage3-design-system-report.md`

**Interfaces:**
- Consumes: all previous task deliverables.
- Produces: stage 3 status/report artifacts.

- [ ] **Step 1: Run full verification**

Run from `frontend`:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src/**/*.test.js
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

Expected: all tests pass; build exit code 0; chunk size warning allowed.

- [ ] **Step 2: Verify scope textually**

Run:

```powershell
Select-String -Path src\styles\cockpit.css -Pattern '^\.yh-cockpit|\.yh-status-badge' | Select-Object -First 20
Select-String -Path src\styles\global.css -Pattern '^\.el-card|^\.el-table|^\.el-input|^\.el-select' -CaseSensitive:$false
```

Expected: `cockpit.css` contains scoped selectors; `global.css` should not contain the removed unscoped Element Plus selectors.

- [ ] **Step 3: Create phase 3 report**

Create `C:\Users\25741\Documents\Codex\2026-07-02\k\outputs\yunhe-cockpit-stage3-design-system-report.md`:

```markdown
# 云禾智控驾驶舱重构 - 阶段3视觉设计系统报告

## 完成内容

- 新增 `cockpit-tokens.css`，提供 `--yh-*` 主题色、字体、字号、间距、圆角、阴影和状态色 token。
- 新增 `cockpit.css`，将驾驶舱面板、Element Plus 覆盖和状态标签限制在 `.yh-cockpit` 作用域内。
- 驾驶舱页面接入 `.yh-cockpit`，登录页和旧页面默认不启用驾驶舱覆盖。
- 扩展 `echarts-theme.js`，提供统一 cockpit palette、tooltip、axis、legend、empty/loading 配置，并保留旧导出。
- 新增 `status-theme.js`，统一 success/warning/danger/info/offline/stale 状态映射。

## 验证

- 单元测试：记录最终 `node --test` 输出。
- 生产构建：记录最终 `build-win.ps1` 输出，chunk size warning 留待阶段11。
- 作用域检查：`global.css` 不再包含主要未作用域 Element Plus 覆盖；`cockpit.css` 使用 `.yh-cockpit` 前缀。

## 后续

- 阶段4开始搭建 UnifiedCockpit 布局时，复用 `.yh-cockpit`、`.yh-panel`、状态标签和图表主题。
- 业务页面迁移时逐步替换散落硬编码颜色。
```

- [ ] **Step 4: Update task workbook**

Update `outputs/yunhe-cockpit-task-list-updated.xlsx` rows for sequence 27-34:

- 27: 已完成，备注 `见阶段3视觉设计系统报告`
- 28: 已完成，备注 `字体 token 已落地`
- 29: 已完成，备注 `字号 token 已落地；1366×768 视觉验证待阶段4页面截图复核`
- 30: 已完成，备注 `圆角/阴影/面板 token 已落地`
- 31: 已完成，备注 `cockpit-tokens.css/cockpit.css 已引入`
- 32: 已完成，备注 `Element Plus 覆盖已限制在 .yh-cockpit`
- 33: 已完成，备注 `ECharts cockpit 主题 helper 已落地`
- 34: 已完成，备注 `状态样式与映射 helper 已落地`

- [ ] **Step 5: Commit outputs only if project convention allows**

Do not commit `outputs/` unless the repository already tracks Codex output artifacts. Otherwise leave outputs uncommitted and report paths in final response.

- [ ] **Step 6: Final git status**

Run:

```powershell
& 'C:\Users\25741\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe' -C 'C:\Users\25741\Desktop\智能农机\smart-harvester' status --short --branch
```

Expected: only intended untracked legacy files remain, or clean if all implementation files were committed.
```
