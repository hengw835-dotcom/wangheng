<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">REALTIME CONTROL</span>
          <h1>实时控制</h1>
          <p>控制命令统一通过后端 EMQX 审计接口下发，前端只展示发布、回执、失败和超时状态。</p>
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
              <p>命令会按设备真实状态校验，避免重复提交和越权直连 MQTT。</p>
            </div>
            <el-button text type="primary" @click="refreshAll">刷新状态</el-button>
          </header>

          <el-form label-position="top">
            <el-form-item label="目标农机">
              <el-select v-model="selectedMachineId" filterable placeholder="请选择农机">
                <el-option
                  v-for="machine in machines"
                  :key="machine.machineId"
                  :label="machine.machineId"
                  :value="machine.machineId"
                />
              </el-select>
            </el-form-item>

            <div class="button-grid">
              <el-button type="primary" :loading="sendingCommand === 'START'" :disabled="!canSendCommand('START')" @click="sendCommand('START')">启动</el-button>
              <el-button type="warning" :loading="sendingCommand === 'PAUSE'" :disabled="!canSendCommand('PAUSE')" @click="sendCommand('PAUSE')">暂停</el-button>
              <el-button type="success" :loading="sendingCommand === 'RESUME'" :disabled="!canSendCommand('RESUME')" @click="sendCommand('RESUME')">恢复</el-button>
              <el-button type="danger" :loading="sendingCommand === 'STOP'" :disabled="!canSendCommand('STOP')" @click="sendCommand('STOP')">停止</el-button>
            </div>

            <el-divider />

            <div class="params-grid">
              <el-form-item label="目标速度 km/h" :error="paramErrors.targetSpeed">
                <el-input-number v-model="params.targetSpeed" :min="0" :max="20" :precision="1" />
              </el-form-item>
              <el-form-item label="割台高度 cm" :error="paramErrors.cuttingHeight">
                <el-input-number v-model="params.cuttingHeight" :min="0" :max="100" />
              </el-form-item>
              <el-form-item label="喂入量 %" :error="paramErrors.feedingRate">
                <el-input-number v-model="params.feedingRate" :min="0" :max="100" />
              </el-form-item>
            </div>
            <el-button type="primary" plain :loading="sendingCommand === 'APPLY_PARAMS'" :disabled="!canSendCommand('APPLY_PARAMS')" @click="sendCommand('APPLY_PARAMS', params)">应用参数</el-button>
          </el-form>

          <el-alert v-if="!emqx.connected" class="tip" type="warning" :closable="false" show-icon>
            <template #title>EMQX 未连接，控制命令将被禁用，请先确认后端 MQTT 配置。</template>
          </el-alert>

          <section class="command-state">
            <span>当前设备状态：{{ selectedMachine?.status || '--' }}</span>
            <span>命令状态：<b>{{ commandState }}</b></span>
            <span v-if="lastCommand.commandId">命令 ID：{{ lastCommand.commandId }}</span>
            <span v-if="lastCommand.error" class="error-text">失败原因：{{ lastCommand.error }}</span>
          </section>
        </article>

        <article class="panel">
          <header class="panel-head">
            <div>
              <h2>命令审计</h2>
              <p>展示最近控制命令、操作人、主题、命令 ID 和回执状态。</p>
            </div>
          </header>

          <el-empty v-if="audits.length === 0" description="暂无控制命令审计记录" />
          <el-table v-else :data="audits" height="420">
            <el-table-column prop="createdAt" label="时间" min-width="170">
              <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column prop="machineId" label="设备" min-width="120" />
            <el-table-column prop="commandName" label="命令" min-width="130" />
            <el-table-column prop="operatorName" label="操作人" min-width="110" />
            <el-table-column prop="status" label="状态" min-width="120">
              <template #default="{ row }">
                <el-tag :type="auditType(row.status)">{{ commandStateFromAudit(row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="commandId" label="命令 ID" min-width="220" show-overflow-tooltip />
            <el-table-column prop="topic" label="MQTT Topic" min-width="220" show-overflow-tooltip />
            <el-table-column prop="errorMessage" label="失败原因" min-width="180" show-overflow-tooltip />
          </el-table>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import { useMachineStore } from '../store'
import { emqxApi } from '../services/api'
import {
  COMMAND_STATES,
  canSendControlCommand,
  commandStateFromAudit,
  hasControlErrors,
  validateControlParameters
} from '../utils/controlModel'

const machineStore = useMachineStore()
const selectedMachineId = ref('')
const audits = ref([])
const emqx = reactive({ connected: false, broker: '', clientId: '' })
const params = reactive({ targetSpeed: 8, cuttingHeight: 35, feedingRate: 65 })
const paramErrors = reactive({})
const lastCommand = reactive({ commandId: '', status: '', error: '' })
const commandState = ref(COMMAND_STATES.READY)
const sendingCommand = ref('')
let auditTimer

const machines = computed(() => machineStore.machines || [])
const selectedMachine = computed(() => machines.value.find(machine => machine.machineId === selectedMachineId.value))

async function refreshAll() {
  await Promise.allSettled([machineStore.fetchMachines(), refreshEmqx(), refreshAudits()])
  if (!selectedMachineId.value && machines.value.length) selectedMachineId.value = machines.value[0].machineId
}

async function refreshEmqx() {
  Object.assign(emqx, await emqxApi.getStatus())
}

async function refreshAudits() {
  audits.value = await emqxApi.listAudits()
  if (lastCommand.commandId) {
    const match = audits.value.find(item => item.commandId === lastCommand.commandId)
    if (match) commandState.value = commandStateFromAudit(match)
  }
}

async function sendCommand(command, parameters = {}) {
  if (!canSendCommand(command)) return
  Object.keys(paramErrors).forEach(key => delete paramErrors[key])
  if (command === 'APPLY_PARAMS') {
    Object.assign(paramErrors, validateControlParameters(parameters))
    if (hasControlErrors(paramErrors)) return
  }
  sendingCommand.value = command
  commandState.value = COMMAND_STATES.SENDING
  lastCommand.error = ''
  try {
    const data = await emqxApi.sendControl(selectedMachineId.value, command, parameters)
    lastCommand.commandId = data.commandId
    lastCommand.status = data.status
    commandState.value = data.published ? COMMAND_STATES.ACCEPTED : COMMAND_STATES.FAILED
    ElMessage.success(`命令已提交：${data.command} / ${data.status}`)
    await refreshAudits()
    startAuditPolling()
  } catch (error) {
    commandState.value = COMMAND_STATES.FAILED
    lastCommand.error = error?.response?.data?.message || error?.message || '命令发送失败'
    throw error
  } finally {
    sendingCommand.value = ''
  }
}

function canSendCommand(command) {
  return Boolean(
    emqx.connected &&
    selectedMachineId.value &&
    selectedMachine.value &&
    canSendControlCommand(command, selectedMachine.value.status) &&
    !sendingCommand.value
  )
}

function startAuditPolling() {
  window.clearInterval(auditTimer)
  let ticks = 0
  auditTimer = window.setInterval(async () => {
    ticks += 1
    await refreshAudits()
    if ([COMMAND_STATES.SUCCEEDED, COMMAND_STATES.FAILED].includes(commandState.value) || ticks >= 10) {
      if (ticks >= 10 && commandState.value === COMMAND_STATES.ACCEPTED) commandState.value = COMMAND_STATES.TIMEOUT
      window.clearInterval(auditTimer)
    }
  }, 3000)
}

function auditType(status) {
  if (['PUBLISHED', 'ACKNOWLEDGED'].includes(status)) return 'success'
  if (['FAILED', 'REJECTED'].includes(status)) return 'danger'
  return 'warning'
}

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

onMounted(refreshAll)
onBeforeUnmount(() => window.clearInterval(auditTimer))
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
.command-state { display: grid; gap: 8px; margin-top: 16px; color: var(--app-text-muted); }
.command-state b { color: #22d983; }
.error-text { color: #ff6f7c; }
@media (max-width: 1100px) {
  .content-grid, .page-head { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }
}
</style>
