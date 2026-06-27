<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">LIVE MQTT DATA</span>
          <h1>传感数据</h1>
          <p>展示后端订阅 EMQX 后写入数据库的真实传感器记录。</p>
        </div>
        <div class="head-actions">
          <el-select v-model="selectedMachineId" filterable placeholder="选择设备">
            <el-option v-for="id in machineIds" :key="id" :label="id" :value="id" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="refresh">刷新</el-button>
        </div>
      </section>

      <section class="kpi-grid">
        <article v-for="item in latestReadings" :key="item.sensorType">
          <span>{{ labelFor(item.sensorType) }}</span>
          <strong>{{ item.value }} <small>{{ item.unit }}</small></strong>
          <footer>{{ formatTime(item.timestamp, true) }}</footer>
        </article>
        <article v-if="latestReadings.length === 0">
          <span>当前设备</span>
          <strong>暂无数据</strong>
          <footer>可到“模拟平台”发送一条测试数据</footer>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header>
            <h2>最近记录</h2>
            <span>{{ selectedMachineId || '未选择设备' }}</span>
          </header>
          <el-empty v-if="records.length === 0" description="暂无传感器记录" />
          <el-table v-else :data="displayRecords" height="520">
            <el-table-column prop="timestamp" label="接收时间" min-width="180">
              <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
            </el-table-column>
            <el-table-column prop="sensorType" label="类型" min-width="150">
              <template #default="{ row }">{{ labelFor(row.sensorType) }} <small>{{ row.sensorType }}</small></template>
            </el-table-column>
            <el-table-column prop="value" label="数值" min-width="100" />
            <el-table-column prop="unit" label="单位" width="90" />
            <el-table-column prop="location" label="来源/位置" min-width="180" />
          </el-table>
        </article>

        <aside class="panel">
          <header><h2>数据说明</h2></header>
          <ul class="notes">
            <li>本页只读取 `/sensor-data` 下的真实入库记录。</li>
            <li>没有数据显示时，不再展示固定假数值。</li>
            <li>模拟平台发布成功后，可在这里按设备编号查看结果。</li>
          </ul>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import axios from 'axios'
import TopNavBar from '../components/layout/TopNavBar.vue'

const selectedMachineId = ref('')
const machineIds = ref([])
const records = ref([])
const loading = ref(false)
let timer

const names = {
  temperature: '温度',
  humidity: '湿度',
  engine_rpm: '发动机转速',
  speed: '行驶速度',
  fuel_level: '燃油液位',
  pressure: '压力',
  engine_temp: '发动机温度',
  wind_speed: '风速'
}

const displayRecords = computed(() => [...records.value].reverse().slice(0, 100))
const latestReadings = computed(() => {
  const latest = new Map()
  displayRecords.value.forEach(item => {
    if (!latest.has(item.sensorType)) latest.set(item.sensorType, item)
  })
  return [...latest.values()].slice(0, 8)
})

function labelFor(type) {
  return names[type] || type || '未知类型'
}

async function fetchMachineIds() {
  const { data } = await axios.get('/api/sensor-data/machines')
  machineIds.value = data
  if (!selectedMachineId.value || !data.includes(selectedMachineId.value)) {
    selectedMachineId.value = data[data.length - 1] || ''
  }
}

async function refresh() {
  if (loading.value) return
  loading.value = true
  try {
    await fetchMachineIds()
    if (selectedMachineId.value) {
      const { data } = await axios.get(`/api/sensor-data/machine/${encodeURIComponent(selectedMachineId.value)}`)
      records.value = data
    } else {
      records.value = []
    }
  } finally {
    loading.value = false
  }
}

function formatTime(value, timeOnly = false) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', timeOnly ? { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour12: false })
}

watch(selectedMachineId, refresh)
onMounted(() => {
  refresh()
  timer = window.setInterval(refresh, 5000)
})
onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.page-root { height: 100%; background: var(--app-page-bg); }
.workspace { height: calc(100% - 72px); overflow: auto; padding: 22px; }
.page-head, .head-actions, .panel header { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.page-head { margin-bottom: 16px; }
.eyebrow { color: #36c2ff; font-size: 12px; letter-spacing: .16em; }
h1 { margin-top: 8px; color: #fff; font-size: 34px; }
p, span, small, footer, li { color: var(--app-text-muted); }
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.kpi-grid article, .panel { border: 1px solid var(--app-panel-border); border-radius: 16px; background: var(--app-panel-bg); }
.kpi-grid article { display: grid; gap: 8px; padding: 18px; }
.kpi-grid strong { color: #fff; font-size: 28px; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(280px, .5fr); gap: 16px; }
.panel { padding: 18px; }
.panel h2 { color: #fff; }
.notes { display: grid; gap: 12px; padding-left: 18px; line-height: 1.7; }
@media (max-width: 1000px) { .kpi-grid, .content-grid { grid-template-columns: 1fr; } .page-head { flex-direction: column; align-items: stretch; } }
</style>
