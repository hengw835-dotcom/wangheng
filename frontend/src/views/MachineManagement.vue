<template>
  <div class="work-page-root">
    <TopNavBar />

    <main class="work-page">
      <section class="page-head">
        <div>
          <span class="eyebrow">MACHINE REGISTRY</span>
          <h1>设备管理</h1>
          <p>维护农机档案、运行状态、位置和基础参数。</p>
        </div>
        <el-button type="primary" @click="openCreate">新增农机</el-button>
      </section>

      <section class="stat-grid">
        <article><span>设备总数</span><strong>{{ machines.length }}</strong></article>
        <article><span>作业中</span><strong>{{ countByStatus('WORKING') }}</strong></article>
        <article><span>在线/待命</span><strong>{{ onlineCount }}</strong></article>
        <article><span>异常/离线</span><strong>{{ offlineCount }}</strong></article>
      </section>

      <el-card class="work-card">
        <template #header>
          <div class="card-header">
            <span>设备列表</span>
            <el-button text type="primary" :loading="machineStore.loading" @click="loadMachines">刷新</el-button>
          </div>
        </template>

        <RequestState
          v-if="machineStore.loading || machineStore.error || machines.length === 0"
          :loading="machineStore.loading"
          :error="machineStore.error"
          :empty="machines.length === 0"
          empty-text="暂无设备数据"
          @retry="loadMachines"
        />

        <el-table v-else :data="machines" height="520">
          <el-table-column prop="machineId" label="农机编号" min-width="150" />
          <el-table-column prop="model" label="型号" min-width="160" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="位置" min-width="180">
            <template #default="{ row }">{{ row.location || '未填写' }}</template>
          </el-table-column>
          <el-table-column prop="lastUpdated" label="最后更新" min-width="180">
            <template #default="{ row }">{{ formatTime(row.lastUpdated) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="210" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="removeMachine(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </main>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑农机' : '新增农机'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="农机编号" required>
          <el-input v-model.trim="form.machineId" :disabled="Boolean(editingId)" placeholder="例如 HARV-001" />
        </el-form-item>
        <el-form-item label="型号" required>
          <el-input v-model.trim="form.model" placeholder="例如 雷沃 GM100" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model.trim="form.location" placeholder="例如 示范区 A 区" />
        </el-form-item>
        <el-form-item label="参数">
          <el-input v-model="form.parameters" type="textarea" :rows="3" placeholder="填写设备参数，JSON 或文字均可" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveMachine">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import RequestState from '../components/common/RequestState.vue'
import { useMachineStore } from '../store'

const machineStore = useMachineStore()
const dialogVisible = ref(false)
const editingId = ref('')
const saving = ref(false)
const form = reactive({
  machineId: '',
  model: '',
  status: 'OFFLINE',
  location: '',
  parameters: ''
})

const statuses = [
  { value: 'ONLINE', label: '在线' },
  { value: 'OFFLINE', label: '离线' },
  { value: 'WORKING', label: '作业中' },
  { value: 'IDLE', label: '待命' },
  { value: 'MAINTENANCE', label: '维护中' },
  { value: 'ERROR', label: '异常' }
]

const machines = computed(() => machineStore.machines || [])
const onlineCount = computed(() => machines.value.filter(item => ['ONLINE', 'WORKING', 'IDLE'].includes(item.status)).length)
const offlineCount = computed(() => machines.value.filter(item => ['OFFLINE', 'ERROR', 'MAINTENANCE'].includes(item.status)).length)

function countByStatus(status) {
  return machines.value.filter(item => item.status === status).length
}

function statusLabel(status) {
  return statuses.find(item => item.value === status)?.label || status || '未设置'
}

function statusType(status) {
  if (['ONLINE', 'WORKING'].includes(status)) return 'success'
  if (['IDLE', 'MAINTENANCE'].includes(status)) return 'warning'
  if (status === 'ERROR') return 'danger'
  return 'info'
}

function formatTime(value) {
  if (!value) return '未记录'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function resetForm() {
  Object.assign(form, { machineId: '', model: '', status: 'OFFLINE', location: '', parameters: '' })
}

function openCreate() {
  editingId.value = ''
  resetForm()
  dialogVisible.value = true
}

function openEdit(machine) {
  editingId.value = machine.machineId
  Object.assign(form, {
    machineId: machine.machineId,
    model: machine.model || '',
    status: machine.status || 'OFFLINE',
    location: machine.location || '',
    parameters: machine.parameters || ''
  })
  dialogVisible.value = true
}

async function loadMachines() {
  await machineStore.fetchMachines()
}

async function saveMachine() {
  if (!form.machineId || !form.model) {
    ElMessage.warning('农机编号和型号不能为空')
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await machineStore.updateMachine({ ...form, machineId: editingId.value })
    } else {
      await machineStore.addMachine({ ...form })
    }
    dialogVisible.value = false
    ElMessage.success('设备信息已保存')
  } finally {
    saving.value = false
  }
}

async function removeMachine(machine) {
  await ElMessageBox.confirm(`确认删除农机 ${machine.machineId}？`, '删除确认', { type: 'warning' })
  await machineStore.deleteMachine(machine.machineId)
  ElMessage.success('设备已删除')
}

onMounted(loadMachines)
</script>

<style scoped>
.work-page-root {
  height: 100%;
  background: var(--app-page-bg);
}

.work-page {
  height: calc(100% - 72px);
  overflow: auto;
  padding: 22px;
}

.page-head,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-head {
  margin-bottom: 16px;
  color: var(--app-text);
}

.eyebrow {
  color: #36c2ff;
  font-size: 12px;
  letter-spacing: .16em;
}

.page-head h1 {
  margin-top: 8px;
  color: #fff;
  font-size: 34px;
}

.page-head p {
  margin-top: 8px;
  color: var(--app-text-muted);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-grid article {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid var(--app-panel-border);
  border-radius: 8px;
  background: var(--app-panel-bg);
}

.stat-grid span {
  color: var(--app-text-muted);
}

.stat-grid strong {
  color: #fff;
  font-size: 30px;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
