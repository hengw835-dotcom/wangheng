<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">MQTT SENSOR LAB</span>
          <h1>模拟平台</h1>
          <p>手动向 EMQX 发布模拟传感器数据，用于验证后端订阅和前端刷新链路。</p>
        </div>
        <div class="connection-card" :class="{ offline: !status.mqttConnected }">
          <span class="state-dot"></span>
          <div>
            <strong>EMQX {{ status.mqttConnected ? '已连接' : '未连接' }}</strong>
            <small>{{ status.topic || topic }}</small>
          </div>
        </div>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header><h2>发布控制</h2><el-tag :type="status.running ? 'success' : 'info'">{{ status.running ? '连续发送中' : '手动模式' }}</el-tag></header>
          <el-form label-position="top">
            <el-form-item label="模拟设备编号">
              <el-input v-model.trim="machineId" placeholder="例如 SIM-001" />
            </el-form-item>
            <div class="button-row">
              <el-button type="primary" :loading="busy" @click="publishBatch">发送一组随机数据</el-button>
              <el-button type="success" :disabled="status.running" @click="start">开启连续发送</el-button>
              <el-button type="danger" plain :disabled="!status.running" @click="stop">停止连续发送</el-button>
            </div>
          </el-form>
          <div class="flow"><span>前端模拟平台</span><i>→</i><span>EMQX</span><i>→</i><span>后端订阅</span><i>→</i><span>数据库</span></div>
        </article>

        <article class="panel">
          <header><h2>自定义传感器数据</h2><span>单条精准模拟</span></header>
          <el-form label-position="top">
            <div class="form-grid">
              <el-form-item label="传感器类型">
                <el-select v-model="form.sensorType">
                  <el-option v-for="item in sensorTypes" :key="item.type" :label="item.label" :value="item.type" />
                </el-select>
              </el-form-item>
              <el-form-item label="数值"><el-input-number v-model="form.value" :precision="2" :controls="false" /></el-form-item>
              <el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item>
              <el-form-item label="安装位置"><el-input v-model="form.location" /></el-form-item>
            </div>
            <el-button type="primary" :loading="busy" @click="publishCustom">发布自定义数据</el-button>
          </el-form>
        </article>

        <article class="panel">
          <header><h2>入库结果</h2><el-button text type="primary" @click="refreshRecords">刷新记录</el-button></header>
          <el-empty v-if="latestRecords.length === 0" description="当前设备暂无入库记录" />
          <el-table v-else :data="latestRecords" height="320">
            <el-table-column prop="timestamp" label="接收时间" min-width="170"><template #default="{ row }">{{ formatTime(row.timestamp) }}</template></el-table-column>
            <el-table-column prop="sensorType" label="类型" min-width="130" />
            <el-table-column prop="value" label="数值" min-width="100" />
            <el-table-column prop="unit" label="单位" width="90" />
            <el-table-column prop="location" label="来源" min-width="120" />
          </el-table>
        </article>

        <article class="panel">
          <header><h2>发布日志</h2><span>{{ logs.length }} 条</span></header>
          <div class="console">
            <p v-for="(log, index) in logs" :key="index"><time>{{ log.time }}</time><span :class="log.level">{{ log.message }}</span></p>
            <p v-if="!logs.length" class="empty">等待发送操作...</p>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'

const machineId = ref('SIM-001')
const busy = ref(false)
const records = ref([])
const logs = ref([])
const status = reactive({ running: false, mqttConnected: false, publishedCount: 0, topic: '' })
const sensorTypes = [
  { type: 'temperature', label: '温度', unit: 'C', value: 28 },
  { type: 'humidity', label: '湿度', unit: '%', value: 58 },
  { type: 'engine_rpm', label: '发动机转速', unit: 'rpm', value: 1680 },
  { type: 'speed', label: '行驶速度', unit: 'km/h', value: 6.5 },
  { type: 'fuel_level', label: '燃油液位', unit: '%', value: 76 }
]
const form = reactive({ sensorType: 'temperature', value: 28, unit: 'C', location: '模拟驾驶舱' })
const topic = computed(() => `harvester/${machineId.value}/sensor`)
const latestRecords = computed(() => [...records.value].reverse().slice(0, 30))
let timer

watch(() => form.sensorType, type => {
  const selected = sensorTypes.find(item => item.type === type)
  if (selected) Object.assign(form, { value: selected.value, unit: selected.unit })
})

function addLog(message, level = 'success') {
  logs.value.unshift({ time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), message, level })
  logs.value = logs.value.slice(0, 40)
}

async function refreshStatus() {
  const { data } = await axios.get('/api/sensor-simulator/status')
  Object.assign(status, data)
  if (data.machineId) machineId.value = data.machineId
}

async function refreshRecords() {
  if (!machineId.value) return
  const { data } = await axios.get(`/api/sensor-data/machine/${encodeURIComponent(machineId.value)}`)
  records.value = data
}

async function run(action, successMessage) {
  if (!/^[A-Za-z0-9_-]+$/.test(machineId.value)) {
    ElMessage.warning('设备编号只能包含字母、数字、下划线和连字符')
    return
  }
  busy.value = true
  try {
    await action()
    addLog(successMessage)
    ElMessage.success(successMessage)
    await Promise.allSettled([refreshStatus(), refreshRecords()])
  } catch (error) {
    const message = error.response?.data?.message || error.message || '操作失败'
    addLog(message, 'error')
    ElMessage.error(message)
  } finally {
    busy.value = false
  }
}

function publishBatch() {
  return run(() => axios.post('/api/sensor-simulator/publish-once', null, { params: { machineId: machineId.value } }), '已发送一组随机传感器数据')
}

function publishCustom() {
  return run(() => axios.post('/api/sensor-simulator/publish', { machineId: machineId.value, ...form }), '已发布自定义传感器数据')
}

function start() {
  return run(() => axios.post('/api/sensor-simulator/start', null, { params: { machineId: machineId.value } }), '已开启连续发送')
}

function stop() {
  return run(() => axios.post('/api/sensor-simulator/stop'), '已停止连续发送')
}

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

watch(machineId, () => refreshRecords())
onMounted(() => {
  Promise.allSettled([refreshStatus(), refreshRecords()])
  timer = window.setInterval(() => Promise.allSettled([refreshStatus(), refreshRecords()]), 5000)
})
onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.page-root { height: 100%; background: var(--app-page-bg); }
.workspace { height: calc(100% - 72px); overflow: auto; padding: 22px; }
.page-head, .connection-card, .panel header, .button-row, .flow { display: flex; align-items: center; gap: 14px; }
.page-head { justify-content: space-between; margin-bottom: 16px; }
.eyebrow { color: #36c2ff; font-size: 12px; letter-spacing: .16em; }
h1 { margin-top: 8px; color: #fff; font-size: 34px; }
p, span, small, time, i { color: var(--app-text-muted); }
.connection-card { min-width: 260px; padding: 14px; border: 1px solid rgba(34,217,131,.3); border-radius: 14px; background: rgba(34,217,131,.08); }
.connection-card.offline { border-color: rgba(255,111,124,.35); background: rgba(255,111,124,.08); }
.state-dot { width: 10px; height: 10px; border-radius: 50%; background: #22d983; box-shadow: 0 0 18px rgba(34,217,131,.8); }
.offline .state-dot { background: #ff6f7c; box-shadow: 0 0 18px rgba(255,111,124,.8); }
.content-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.panel { padding: 18px; border: 1px solid var(--app-panel-border); border-radius: 16px; background: var(--app-panel-bg); }
.panel header { justify-content: space-between; margin-bottom: 16px; }
.panel h2 { color: #fff; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.flow { flex-wrap: wrap; margin-top: 18px; padding: 12px; border-radius: 12px; background: rgba(3,16,29,.42); }
.console { height: 320px; overflow: auto; padding: 12px; border-radius: 12px; background: rgba(3,16,29,.48); }
.console p { display: flex; gap: 10px; margin-bottom: 8px; }
.console .success { color: #7df0b4; }
.console .error { color: #ff9ca5; }
@media (max-width: 1100px) { .content-grid { grid-template-columns: 1fr; } .page-head { flex-direction: column; align-items: stretch; } }
</style>
