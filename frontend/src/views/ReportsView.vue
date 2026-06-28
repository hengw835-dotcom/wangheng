<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">DATA REPORTS</span>
          <h1>数据报表</h1>
          <p>设备和任务来自真实接口；传感器统计使用可替换前端聚合适配层，等待后端统计 API 后可直接替换。</p>
        </div>
        <el-button type="primary" @click="exportReport">导出 CSV</el-button>
      </section>

      <section class="kpi-grid">
        <article v-for="item in kpis" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header><h2>任务汇总</h2><span>{{ tasks.length }} 条任务</span></header>
          <el-empty v-if="tasks.length === 0" description="暂无任务数据" />
          <el-table v-else :data="tasks" height="420">
            <el-table-column prop="fieldName" label="地块" min-width="150" />
            <el-table-column prop="machineId" label="农机" min-width="130" />
            <el-table-column prop="status" label="状态" min-width="110">
              <template #default="{ row }">{{ statusLabel(row.status) }}</template>
            </el-table-column>
            <el-table-column prop="targetArea" label="目标面积" min-width="110">
              <template #default="{ row }">{{ numberText(row.targetArea) }} 亩</template>
            </el-table-column>
            <el-table-column prop="completedArea" label="完成面积" min-width="110">
              <template #default="{ row }">{{ numberText(row.completedArea) }} 亩</template>
            </el-table-column>
            <el-table-column prop="estimatedYield" label="预计产量" min-width="110">
              <template #default="{ row }">{{ numberText(row.estimatedYield) }} 吨</template>
            </el-table-column>
          </el-table>
        </article>

        <aside class="panel">
          <header><h2>设备状态分布</h2></header>
          <div class="status-list">
            <article v-for="item in machineStatusRows" :key="item.status">
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </article>
          </div>
        </aside>

        <article class="panel wide">
          <header><h2>传感器数据概况</h2><span>{{ sensorSummary.total }} 条记录</span></header>
          <div class="sensor-summary">
            <article><span>设备数量</span><strong>{{ sensorSummary.machineCount }}</strong></article>
            <article><span>最近设备</span><strong>{{ sensorSummary.latestMachine || '-' }}</strong></article>
            <article><span>最近更新时间</span><strong>{{ formatTime(sensorSummary.latestTime) }}</strong></article>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import { sensorDataApi } from '../services/api'
import { useMachineStore, useTaskStore } from '../store'
import { buildReportRows, summarizeSensors, toCsv } from '../utils/analyticsModel'

const machineStore = useMachineStore()
const taskStore = useTaskStore()
const sensorSummary = reactive({ total: 0, machineCount: 0, latestMachine: '', latestTime: '' })

const machines = computed(() => machineStore.machines || [])
const tasks = computed(() => taskStore.tasks || [])
const totalTargetArea = computed(() => tasks.value.reduce((sum, item) => sum + Number(item.targetArea || 0), 0))
const totalCompletedArea = computed(() => tasks.value.reduce((sum, item) => sum + Number(item.completedArea || 0), 0))
const totalYield = computed(() => tasks.value.reduce((sum, item) => sum + Number(item.estimatedYield || 0), 0))

const kpis = computed(() => [
  { label: '设备总数', value: machines.value.length, note: '来自设备接口' },
  { label: '任务总数', value: tasks.value.length, note: '来自任务接口' },
  { label: '完成面积', value: `${numberText(totalCompletedArea.value)} 亩`, note: `目标 ${numberText(totalTargetArea.value)} 亩` },
  { label: '预计产量', value: `${numberText(totalYield.value)} 吨`, note: '按任务预计产量汇总' }
])

const machineStatusRows = computed(() => {
  const map = new Map()
  machines.value.forEach(machine => map.set(machine.status || 'UNKNOWN', (map.get(machine.status || 'UNKNOWN') || 0) + 1))
  return [...map.entries()].map(([status, count]) => ({ status, label: machineStatusLabel(status), count }))
})

function machineStatusLabel(status) {
  return { ONLINE: '在线', OFFLINE: '离线', WORKING: '作业中', IDLE: '待命', MAINTENANCE: '维护中', ERROR: '异常', UNKNOWN: '未设置' }[status] || status
}

function statusLabel(status) {
  return { PENDING: '待开始', IN_PROGRESS: '进行中', COMPLETED: '已完成' }[status] || status || '未设置'
}

function numberText(value) {
  const number = Number(value || 0)
  return Number.isInteger(number) ? String(number) : number.toFixed(1)
}

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

async function loadSensorSummary() {
  const ids = await sensorDataApi.listMachines()
  const recordsByMachine = {}
  await Promise.all(ids.map(async id => {
    recordsByMachine[id] = await sensorDataApi.listByMachine(id)
  }))
  Object.assign(sensorSummary, summarizeSensors(recordsByMachine))
}

async function refresh() {
  await Promise.allSettled([machineStore.fetchMachines(), taskStore.fetchTasks(), loadSensorSummary()])
}

function exportReport() {
  const rows = buildReportRows(
    { machines: machines.value, tasks: tasks.value, sensorSummary },
    { statusLabel, machineStatusLabel }
  )
  const blob = new Blob([`\ufeff${toCsv(rows)}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `智能农机数据报表-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('报表已导出')
}

onMounted(refresh)
</script>

<style scoped>
.page-root { height: 100%; background: var(--app-page-bg); }
.workspace { height: calc(100% - 72px); overflow: auto; padding: 22px; }
.page-head, .panel header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-head { margin-bottom: 16px; }
.eyebrow { color: #36c2ff; font-size: 12px; letter-spacing: .16em; }
h1 { margin-top: 8px; color: #fff; font-size: 34px; }
p, span, small { color: var(--app-text-muted); }
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.kpi-grid article, .panel { border: 1px solid var(--app-panel-border); border-radius: 16px; background: var(--app-panel-bg); }
.kpi-grid article { display: grid; gap: 8px; padding: 18px; }
.kpi-grid strong { color: #fff; font-size: 30px; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(280px, .6fr); gap: 16px; }
.panel { padding: 18px; }
.panel h2 { color: #fff; }
.wide { grid-column: 1 / -1; }
.status-list, .sensor-summary { display: grid; gap: 12px; }
.status-list article, .sensor-summary article { display: flex; justify-content: space-between; gap: 12px; padding: 14px; border-radius: 12px; background: rgba(3,16,29,.42); }
.status-list strong, .sensor-summary strong { color: #fff; }
.sensor-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
@media (max-width: 1000px) { .kpi-grid, .content-grid, .sensor-summary { grid-template-columns: 1fr; } .page-head { flex-direction: column; align-items: stretch; } }
</style>
