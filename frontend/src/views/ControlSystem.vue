<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">REALTIME CONTROL</span>
          <h1>实时控制</h1>
          <p>通过 EMQX 发布控制命令，并保留后端审计记录。未连接 EMQX 时禁止发送控制命令。</p>
        </div>
        <div class="connection-card" :class="{ offline: !emqx.connected }">
          <span class="state-dot"></span>
          <div>
            <strong>EMQX {{ emqx.connected ? '已连接' : '未连接' }}</strong>
            <small>{{ emqx.broker || '等待状态接口返回' }}</small>
          </div>
        </div>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header class="panel-head">
            <div>
              <h2>控制命令</h2>
              <p>选择设备后发送 START / PAUSE / RESUME / STOP / APPLY_PARAMS</p>
            </div>
            <el-button text type="primary" @click="refreshAll">刷新状态</el-button>
          </header>

          <el-form label-position="top">
            <el-form-item label="目标农机">
              <el-select v-model="selectedMachineId" filterable placeholder="请选择农机">
                <el-option v-for="machine in machines" :key="machine.machineId" :label="machine.machineId" :value="machine.machineId" />
              </el-select>
            </el-form-item>

            <div class="button-grid">
              <el-button type="primary" :disabled="!canSend" @click="sendCommand('START')">启动</el-button>
              <el-button type="warning" :disabled="!canSend" @click="sendCommand('PAUSE')">暂停</el-button>
              <el-button type="success" :disabled="!canSend" @click="sendCommand('RESUME')">恢复</el-button>
              <el-button type="danger" :disabled="!canSend" @click="sendCommand('STOP')">停止</el-button>
            </div>

            <el-divider />

            <div class="params-grid">
              <el-form-item label="目标速度 km/h">
                <el-input-number v-model="params.targetSpeed" :min="0" :max="20" :precision="1" />
              </el-form-item>
              <el-form-item label="割台高度 cm">
                <el-input-number v-model="params.cuttingHeight" :min="0" :max="100" />
              </el-form-item>
              <el-form-item label="喂入量 %">
                <el-input-number v-model="params.feedingRate" :min="0" :max="100" />
              </el-form-item>
            </div>
            <el-button type="primary" plain :disabled="!canSend" @click="sendCommand('APPLY_PARAMS', params)">应用参数</el-button>
          </el-form>

          <el-alert v-if="!emqx.connected" class="tip" type="warning" :closable="false" show-icon>
            <template #title>EMQX 未连接，请先启动 EMQX 并确认后端 MQTT 配置。</template>
          </el-alert>
        </article>

        <article class="panel">
          <header class="panel-head">
            <div>
              <h2>命令审计</h2>
              <p>展示最近 100 条控制命令、操作者、主题和发布状态。</p>
            </div>
          </header>

          <el-empty v-if="audits.length === 0" description="暂无控制命令审计记录" />
          <el-table v-else :data="audits" height="420">
            <el-table-column prop="createdAt" label="时间" min-width="170">
              <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column prop="machineId" label="设备" min-width="120" />
            <el-table-column prop="commandName" label="命令" min-width="130" />
            <el-table-column prop="operatorName" label="操作者" min-width="110" />
            <el-table-column prop="status" label="状态" min-width="120">
              <template #default="{ row }"><el-tag :type="auditType(row.status)">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="topic" label="MQTT Topic" min-width="220" show-overflow-tooltip />
          </el-table>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import { useMachineStore } from '../store'

const machineStore = useMachineStore()
const selectedMachineId = ref('')
const audits = ref([])
const emqx = reactive({ connected: false, broker: '', clientId: '' })
const params = reactive({ targetSpeed: 8, cuttingHeight: 35, feedingRate: 65 })

const machines = computed(() => machineStore.machines || [])
const canSend = computed(() => emqx.connected && selectedMachineId.value)

async function refreshAll() {
  await Promise.allSettled([machineStore.fetchMachines(), refreshEmqx(), refreshAudits()])
  if (!selectedMachineId.value && machines.value.length) selectedMachineId.value = machines.value[0].machineId
}

async function refreshEmqx() {
  const { data } = await axios.get('/api/emqx/status')
  Object.assign(emqx, data)
}

async function refreshAudits() {
  const { data } = await axios.get('/api/emqx/control-audits')
  audits.value = data
}

async function sendCommand(command, parameters = {}) {
  if (!canSend.value) return
  const key = `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(16).slice(2)}`
  const { data } = await axios.post(`/api/emqx/machines/${encodeURIComponent(selectedMachineId.value)}/control`, {
    command,
    parameters
  }, {
    headers: { 'Idempotency-Key': key }
  })
  ElMessage.success(`命令已提交：${data.command} / ${data.status}`)
  await refreshAudits()
}

function auditType(status) {
  if (['PUBLISHED', 'ACKNOWLEDGED'].includes(status)) return 'success'
  if (status === 'FAILED' || status === 'REJECTED') return 'danger'
  return 'warning'
}

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

onMounted(refreshAll)
</script>

<style scoped>
.page-root { height: 100%; background: var(--app-page-bg); }
.workspace { height: calc(100% - 72px); overflow: auto; padding: 22px; }
.page-head { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 16px; }
.eyebrow { color: #36c2ff; font-size: 12px; letter-spacing: .16em; }
h1 { margin-top: 8px; color: #fff; font-size: 34px; }
p, small { color: var(--app-text-muted); }
.connection-card { min-width: 260px; display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid rgba(34,217,131,.3); border-radius: 14px; background: rgba(34,217,131,.08); }
.connection-card.offline { border-color: rgba(255,111,124,.35); background: rgba(255,111,124,.08); }
.state-dot { width: 10px; height: 10px; border-radius: 50%; background: #22d983; box-shadow: 0 0 18px rgba(34,217,131,.8); }
.offline .state-dot { background: #ff6f7c; box-shadow: 0 0 18px rgba(255,111,124,.8); }
.content-grid { display: grid; grid-template-columns: minmax(360px, .8fr) minmax(0, 1.2fr); gap: 16px; }
.panel { padding: 18px; border: 1px solid var(--app-panel-border); border-radius: 16px; background: var(--app-panel-bg); }
.panel-head { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.panel-head h2 { color: #fff; }
.button-grid, .params-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.tip { margin-top: 16px; }
@media (max-width: 1100px) { .content-grid, .page-head { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; } }
</style>
