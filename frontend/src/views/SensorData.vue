<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">LIVE MQTT DATA</span>
          <h1>传感数据</h1>
          <p>读取后端入库记录，前端提供筛选、排序和分页适配；不把本地聚合伪装成后端统计 API。</p>
        </div>
        <div class="head-actions">
          <el-select v-model="filters.machineId" filterable placeholder="选择设备">
            <el-option v-for="id in machineIds" :key="id" :label="id" :value="id" />
          </el-select>
          <el-select v-model="filters.sensorType" clearable placeholder="类型">
            <el-option v-for="type in sensorTypes" :key="type" :label="labelFor(type)" :value="type" />
          </el-select>
          <el-date-picker v-model="dateRange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" />
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
          <footer>可到模拟平台发送测试数据</footer>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header>
            <h2>最近记录</h2>
            <span>{{ filteredRecords.length }} 条</span>
          </header>
          <el-empty v-if="paged.rows.length === 0" description="暂无传感器记录" />
          <el-table v-else :data="paged.rows" height="520" @sort-change="handleSort">
            <el-table-column prop="timestamp" label="接收时间" min-width="180" sortable="custom">
              <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
            </el-table-column>
            <el-table-column prop="sensorType" label="类型" min-width="150">
              <template #default="{ row }">{{ labelFor(row.sensorType) }} <small>{{ row.sensorType }}</small></template>
            </el-table-column>
            <el-table-column prop="value" label="数值" min-width="100" />
            <el-table-column prop="unit" label="单位" width="90" />
            <el-table-column prop="location" label="来源/位置" min-width="180" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button text type="danger" :disabled="!canDelete" @click="deleteRecord(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            class="pager"
            layout="total, sizes, prev, pager, next"
            :total="paged.total"
            :page-sizes="[10, 20, 50, 100]"
          />
        </article>

        <aside class="panel">
          <header><h2>数据说明</h2></header>
          <ul class="notes">
            <li>设备、类型和时间范围优先调用真实后端接口。</li>
            <li>当前后端未提供分页和排序参数，本页在前端适配层处理。</li>
            <li>删除传感器记录需要 ADMIN 权限，按钮按当前角色禁用。</li>
          </ul>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import { sensorDataApi } from '../services/api'
import { getStoredRoles } from '../services/auth'
import { canPerform } from '../services/permissions'
import { filterSensorRecords, paginateRecords, sortSensorRecords } from '../utils/analyticsModel'

const filters = reactive({ machineId: '', sensorType: '' })
const dateRange = ref([])
const machineIds = ref([])
const records = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const sortDirection = ref('desc')
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

const canDelete = computed(() => canPerform('sensor:delete', getStoredRoles()))
const sensorTypes = computed(() => [...new Set(records.value.map(item => item.sensorType).filter(Boolean))])
const filteredRecords = computed(() => {
  const [start, end] = dateRange.value || []
  return filterSensorRecords(records.value, {
    machineId: filters.machineId,
    sensorType: filters.sensorType,
    start,
    end
  })
})
const displayRecords = computed(() => sortSensorRecords(filteredRecords.value, sortDirection.value))
const paged = computed(() => paginateRecords(displayRecords.value, page.value, pageSize.value))
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
  const ids = await sensorDataApi.listMachines()
  machineIds.value = ids
  if (!filters.machineId || !ids.includes(filters.machineId)) filters.machineId = ids[ids.length - 1] || ''
}

async function refresh() {
  if (loading.value) return
  loading.value = true
  try {
    await fetchMachineIds()
    if (!filters.machineId) {
      records.value = []
      return
    }
    const [start, end] = dateRange.value || []
    if (start && end) {
      records.value = await sensorDataApi.listByTimeRange(filters.machineId, new Date(start).toISOString(), new Date(end).toISOString())
    } else if (filters.sensorType) {
      records.value = await sensorDataApi.listByMachineAndType(filters.machineId, filters.sensorType)
    } else {
      records.value = await sensorDataApi.listByMachine(filters.machineId)
    }
  } finally {
    loading.value = false
  }
}

async function deleteRecord(row) {
  await ElMessageBox.confirm(`确认删除传感器记录 ${row.id}？`, '删除确认', { type: 'warning' })
  await sensorDataApi.delete(row.id)
  ElMessage.success('记录已删除')
  await refresh()
}

function handleSort({ order }) {
  sortDirection.value = order === 'ascending' ? 'asc' : 'desc'
}

function formatTime(value, timeOnly = false) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', timeOnly ? { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour12: false })
}

watch(() => [filters.machineId, filters.sensorType, dateRange.value], () => {
  page.value = 1
  refresh()
})
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
.head-actions { flex-wrap: wrap; justify-content: flex-end; }
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
.pager { margin-top: 14px; justify-content: flex-end; }
@media (max-width: 1000px) { .kpi-grid, .content-grid { grid-template-columns: 1fr; } .page-head { flex-direction: column; align-items: stretch; } }
</style>
