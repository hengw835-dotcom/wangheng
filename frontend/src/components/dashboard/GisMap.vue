<template>
  <div class="map-canvas">
    <div class="map-controls">
      <label><el-icon><Search /></el-icon><input v-model="keyword" placeholder="搜索地块名称/设备ID" /></label>
      <button type="button">全部设备 <el-icon><ArrowDown /></el-icon></button>
    </div>

    <div class="map-checks">
      <label v-for="item in mapChecks" :key="item.label" :class="{ danger: item.danger }">
        <input type="checkbox" :checked="item.checked" />
        <span>{{ item.label }}</span>
      </label>
    </div>

    <svg class="route-layer" viewBox="0 0 900 560" preserveAspectRatio="none">
      <path
        v-for="(field, index) in visibleFields"
        :key="field.id"
        class="boundary"
        :d="fieldPath(index)"
      />
      <path class="cyan-route" d="M410 90 L410 190 L468 230 L463 308 L555 315" />
      <path class="yellow-route" d="M348 110 C330 214 360 250 314 320 C280 374 298 430 378 464" />
      <path class="green-route" d="M380 464 C484 470 544 420 608 362 S744 330 808 245" />
      <circle class="route-node" cx="410" cy="190" r="8" />
      <circle class="route-node" cx="378" cy="464" r="8" />
    </svg>

    <div
      v-for="(field, index) in visibleFields"
      :key="field.id + '-label'"
      class="field-block"
      :style="fieldStyle(index)"
    >
      {{ field.id }}<br />{{ field.area || '--' }}亩
    </div>

    <div class="map-tools left">
      <button type="button">+</button>
      <button type="button">-</button>
      <button type="button"><el-icon><Aim /></el-icon></button>
    </div>

    <div class="map-tools right">
      <button type="button"><el-icon><FullScreen /></el-icon><span>全屏</span></button>
      <button type="button"><el-icon><Grid /></el-icon><span>图层</span></button>
      <button type="button"><el-icon><EditPen /></el-icon><span>测距</span></button>
      <button type="button"><el-icon><Refresh /></el-icon><span>刷新</span></button>
    </div>

    <button
      v-for="machine in filteredMachines"
      :key="machine.id"
      type="button"
      :class="['machine-pin', machineTone(machine.status)]"
      :style="{ left: machine.x + '%', top: machine.y + '%' }"
      @click="selected = machine"
    >
      <span>{{ machine.id }}</span>
      <i></i>
    </button>

    <section v-if="selected" class="machine-card">
      <header>
        <span class="thumb"></span>
        <div>
          <strong>{{ selected.id }}</strong>
          <small>{{ selected.type }} | {{ selected.model }}</small>
        </div>
      </header>
      <dl>
        <dt>{{ selected.statusText }}</dt><dd>{{ selected.health }}%</dd>
        <dt>当前位置</dt><dd>{{ selected.location }}</dd>
        <dt>更新时间</dt><dd>{{ selected.updatedAt }}</dd>
      </dl>
      <button type="button">查看详情</button>
    </section>

    <div v-if="!filteredMachines.length" class="empty-tip">暂无设备位置数据</div>

    <div class="legend">
      <span><i class="green"></i>作业中</span>
      <span><i class="blue"></i>在线</span>
      <span><i class="yellow"></i>维护</span>
      <span><i class="gray"></i>离线</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Aim, ArrowDown, EditPen, FullScreen, Grid, Refresh, Search } from '@element-plus/icons-vue'

const props = defineProps({
  machines: { type: Array, default: () => [] },
  fields: { type: Array, default: () => [] }
})

const keyword = ref('')
const selected = ref(null)
const mapChecks = [
  { label: '地块边界', checked: true },
  { label: '作业路线', checked: true },
  { label: '设备位置', checked: true },
  { label: '基站位置' },
  { label: '禁区区域', danger: true },
  { label: '地形影像' }
]

const fallbackFields = [
  { id: 'A-12', area: 128 },
  { id: 'A-11', area: 98 },
  { id: 'A-13', area: 110 },
  { id: 'A-14', area: 132 }
]

const visibleFields = computed(() => props.fields.length ? props.fields : fallbackFields)
const filteredMachines = computed(() => props.machines.filter(machine => !keyword.value || `${machine.id}${machine.location}${machine.type}`.includes(keyword.value)))

watch(() => props.machines, machines => {
  selected.value = machines[0] || null
}, { immediate: true })

function machineTone(status) {
  if (status === 'WORKING') return 'green'
  if (status === 'ERROR' || status === 'MAINTENANCE') return 'orange'
  return status === 'OFFLINE' ? 'gray' : 'blue'
}

function fieldPath(index) {
  const paths = [
    'M170 265 L350 214 L454 250 L424 392 L228 432 Z',
    'M478 112 L705 42 L758 246 L520 264 Z',
    'M545 280 L760 248 L815 405 L585 430 Z',
    'M104 116 L322 82 L354 208 L128 230 Z'
  ]
  return paths[index % paths.length]
}

function fieldStyle(index) {
  const styles = [
    { left: '22%', top: '36%', width: '150px', height: '120px', transform: 'rotate(-10deg)' },
    { left: '28%', top: '61%', width: '135px', height: '96px', transform: 'rotate(-8deg)' },
    { left: '57%', top: '25%', width: '145px', height: '108px', transform: 'rotate(-9deg)' },
    { left: '72%', top: '9%', width: '130px', height: '116px', transform: 'rotate(-13deg)' }
  ]
  return styles[index % styles.length]
}
</script>

<style scoped>
.map-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    linear-gradient(26deg, rgba(255,255,255,.08) 1px, transparent 1px) 0 0/76px 48px,
    linear-gradient(116deg, rgba(255,255,255,.055) 1px, transparent 1px) 0 0/92px 60px,
    radial-gradient(circle at 50% 52%, rgba(23, 132, 61, .36), transparent 42%),
    linear-gradient(135deg, #172f22, #2c4a2f 42%, #142620);
}

button {
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.map-controls {
  position: absolute;
  z-index: 6;
  left: 16px;
  top: 50px;
  display: flex;
  gap: 10px;
}

.map-controls label,
.map-controls button {
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid rgba(85, 130, 152, .45);
  border-radius: 4px;
  color: #b9c8d5;
  background: rgba(7, 19, 29, .8);
}

.map-controls input {
  width: 165px;
  border: 0;
  outline: 0;
  color: #d6e5f1;
  background: transparent;
}

.route-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.boundary {
  fill: rgba(56, 211, 91, .18);
  stroke: #23e56e;
  stroke-width: 2;
}

.cyan-route,
.yellow-route,
.green-route {
  fill: none;
  stroke-width: 4;
  stroke-dasharray: 9 8;
}

.cyan-route { stroke: #20d9e9; }
.yellow-route { stroke: #f5d719; }
.green-route { stroke: #4ade80; }
.route-node { fill: #07131e; stroke: #4ade80; stroke-width: 4; }

.field-block {
  position: absolute;
  z-index: 2;
  display: grid;
  place-items: center;
  color: #d5ffe4;
  border: 2px solid rgba(41, 214, 96, .8);
  background: rgba(48, 168, 80, .22);
  font-size: 16px;
  line-height: 1.4;
}

.map-checks {
  position: absolute;
  z-index: 6;
  left: 16px;
  top: 96px;
  width: 112px;
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  background: rgba(8, 24, 36, .8);
}

.map-checks label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #b9c8d5;
}

.map-checks input { accent-color: #21e79e; }
.map-checks .danger input { accent-color: #ef4444; }

.map-tools {
  position: absolute;
  z-index: 6;
  display: grid;
  gap: 5px;
}

.map-tools.left {
  left: 18px;
  bottom: 158px;
}

.map-tools.right {
  right: 12px;
  top: 46px;
}

.map-tools button {
  min-width: 34px;
  min-height: 34px;
  display: grid;
  place-items: center;
  color: #d9e8f4;
  border: 1px solid rgba(108, 145, 170, .4);
  border-radius: 4px;
  background: rgba(6, 18, 29, .82);
  font-size: 12px;
}

.machine-pin {
  position: absolute;
  z-index: 7;
  display: grid;
  justify-items: center;
  gap: 3px;
  transform: translate(-50%, -50%);
}

.machine-pin span {
  padding: 3px 8px;
  border-radius: 4px;
  color: #fff;
  background: #0b72d9;
  font-size: 12px;
}

.machine-pin i {
  width: 42px;
  height: 28px;
  border-radius: 7px;
  border: 3px solid currentColor;
  background: rgba(6, 18, 29, .75);
  box-shadow: 0 0 16px currentColor;
}

.machine-pin.green { color: #35e768; }
.machine-pin.blue { color: #2f9dff; }
.machine-pin.orange { color: #ff8c1a; }
.machine-pin.gray { color: #94a3b8; }
.machine-pin.orange span { background: #f97316; }
.machine-pin.green span { background: #16a34a; }
.machine-pin.gray span { background: #475569; }

.machine-card {
  position: absolute;
  z-index: 8;
  right: 90px;
  bottom: 72px;
  width: 245px;
  padding: 14px;
  border: 1px solid #20e17c;
  border-radius: 8px;
  background: rgba(7, 34, 25, .9);
  box-shadow: 0 0 24px rgba(34, 226, 136, .16);
}

.machine-card header {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.thumb {
  width: 40px;
  height: 30px;
  border-radius: 4px;
  background: linear-gradient(135deg, #315b33, #dbe5d6);
}

.machine-card strong {
  color: #43ff9d;
  font-size: 18px;
}

.machine-card small {
  color: #b8c6d2;
}

.machine-card dl {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin: 0;
  color: #b8c6d2;
}

.machine-card dd {
  margin: 0;
  color: #e9f7ff;
}

.machine-card button {
  width: 100%;
  height: 30px;
  margin-top: 12px;
  color: #35ff96;
  border: 1px solid #1acf76;
  border-radius: 5px;
  background: rgba(31, 197, 109, .14);
}

.legend {
  position: absolute;
  z-index: 6;
  left: 18px;
  bottom: 14px;
  display: flex;
  gap: 18px;
  padding: 8px 12px;
  border-radius: 5px;
  color: #b9c8d5;
  background: rgba(8, 24, 36, .78);
}

.legend i {
  width: 10px;
  height: 7px;
  display: inline-block;
  margin-right: 6px;
  border-radius: 50%;
}

.green { background: #36e27f; }
.blue { background: #3aa5ff; }
.yellow { background: #facc15; }
.gray { background: #94a3b8; }

.empty-tip {
  position: absolute;
  z-index: 7;
  left: 50%;
  top: 50%;
  padding: 10px 14px;
  border: 1px solid rgba(148, 163, 184, .24);
  border-radius: 6px;
  color: #b9c8d5;
  background: rgba(8, 24, 36, .78);
  transform: translate(-50%, -50%);
}
</style>
