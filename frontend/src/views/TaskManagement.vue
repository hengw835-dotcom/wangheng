<template>
  <div class="work-page-root">
    <TopNavBar />

    <main class="work-page">
      <section class="page-head">
        <div>
          <span class="eyebrow">FIELD TASKS</span>
          <h1>任务管理</h1>
          <p>创建收割任务、推进状态并维护完成面积。</p>
        </div>
        <el-button type="primary" @click="openCreate">创建任务</el-button>
      </section>

      <section class="stat-grid">
        <article><span>任务总数</span><strong>{{ tasks.length }}</strong></article>
        <article><span>待开始</span><strong>{{ countByStatus('PENDING') }}</strong></article>
        <article><span>进行中</span><strong>{{ countByStatus('IN_PROGRESS') }}</strong></article>
        <article><span>已完成</span><strong>{{ countByStatus('COMPLETED') }}</strong></article>
      </section>

      <el-card class="work-card">
        <template #header>
          <div class="card-header">
            <span>任务列表</span>
            <el-button text type="primary" :loading="taskStore.loading" @click="loadTasks">刷新</el-button>
          </div>
        </template>

        <el-empty v-if="!taskStore.loading && tasks.length === 0" description="暂无任务数据，请先创建任务" />
        <el-table v-else v-loading="taskStore.loading" :data="tasks" height="520">
          <el-table-column prop="taskId" label="任务编号" min-width="250" show-overflow-tooltip />
          <el-table-column prop="fieldName" label="地块名称" min-width="160" />
          <el-table-column prop="machineId" label="农机编号" min-width="130" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="面积进度" min-width="180">
            <template #default="{ row }">
              <el-progress :percentage="progress(row)" :stroke-width="8" />
              <small>{{ numberText(row.completedArea) }} / {{ numberText(row.targetArea) }} 亩</small>
            </template>
          </el-table-column>
          <el-table-column prop="estimatedYield" label="预计产量" width="120">
            <template #default="{ row }">{{ numberText(row.estimatedYield) }} 吨</template>
          </el-table-column>
          <el-table-column label="操作" width="270" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'PENDING'" size="small" type="primary" @click="changeStatus(row, 'IN_PROGRESS')">开始</el-button>
              <el-button v-if="row.status === 'IN_PROGRESS'" size="small" type="success" @click="changeStatus(row, 'COMPLETED')">完成</el-button>
              <el-button size="small" @click="openProgress(row)">进度</el-button>
              <el-button size="small" type="danger" @click="removeTask(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </main>

    <el-dialog v-model="dialogVisible" title="创建任务" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="地块名称" required>
          <el-input v-model.trim="form.fieldName" placeholder="例如 兴农 1 号地" />
        </el-form-item>
        <el-form-item label="农机编号" required>
          <el-select v-model="form.machineId" filterable allow-create placeholder="选择或输入农机编号">
            <el-option v-for="machine in machines" :key="machine.machineId" :label="machine.machineId" :value="machine.machineId" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标面积" required>
          <el-input-number v-model="form.targetArea" :min="0.1" :precision="1" />
          <span class="unit">亩</span>
        </el-form-item>
        <el-form-item label="预计产量">
          <el-input-number v-model="form.estimatedYield" :min="0" :precision="1" />
          <span class="unit">吨</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="progressVisible" title="更新完成面积" width="420px">
      <el-form label-width="90px">
        <el-form-item label="完成面积">
          <el-input-number v-model="completedArea" :min="0" :max="currentTask?.targetArea || 0" :precision="1" />
          <span class="unit">亩</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProgress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import { useMachineStore, useTaskStore } from '../store'

const taskStore = useTaskStore()
const machineStore = useMachineStore()
const dialogVisible = ref(false)
const progressVisible = ref(false)
const saving = ref(false)
const currentTask = ref(null)
const completedArea = ref(0)

const form = reactive({
  fieldName: '',
  machineId: '',
  targetArea: 1,
  estimatedYield: 0
})

const tasks = computed(() => taskStore.tasks || [])
const machines = computed(() => machineStore.machines || [])

function statusLabel(status) {
  return { PENDING: '待开始', IN_PROGRESS: '进行中', COMPLETED: '已完成' }[status] || status || '未设置'
}

function statusType(status) {
  if (status === 'COMPLETED') return 'success'
  if (status === 'IN_PROGRESS') return 'warning'
  return 'info'
}

function countByStatus(status) {
  return tasks.value.filter(item => item.status === status).length
}

function numberText(value) {
  const number = Number(value || 0)
  return Number.isInteger(number) ? String(number) : number.toFixed(1)
}

function progress(task) {
  const target = Number(task.targetArea || 0)
  if (!target) return 0
  return Math.min(100, Math.round((Number(task.completedArea || 0) / target) * 100))
}

function openCreate() {
  Object.assign(form, { fieldName: '', machineId: machines.value[0]?.machineId || '', targetArea: 1, estimatedYield: 0 })
  dialogVisible.value = true
}

async function loadTasks() {
  await Promise.allSettled([taskStore.fetchTasks(), machineStore.fetchMachines()])
}

async function saveTask() {
  if (!form.fieldName || !form.machineId || form.targetArea <= 0) {
    ElMessage.warning('地块名称、农机编号和目标面积不能为空')
    return
  }
  saving.value = true
  try {
    await taskStore.createTask({ ...form })
    dialogVisible.value = false
    ElMessage.success('任务已创建')
  } finally {
    saving.value = false
  }
}

async function changeStatus(task, status) {
  await taskStore.updateTaskStatus(task.taskId, status)
  ElMessage.success('任务状态已更新')
}

function openProgress(task) {
  currentTask.value = task
  completedArea.value = Number(task.completedArea || 0)
  progressVisible.value = true
}

async function saveProgress() {
  if (!currentTask.value) return
  await axios.put(`/api/tasks/${encodeURIComponent(currentTask.value.taskId)}/progress`, null, {
    params: { completedArea: completedArea.value }
  })
  await taskStore.fetchTasks()
  progressVisible.value = false
  ElMessage.success('任务进度已更新')
}

async function removeTask(task) {
  await ElMessageBox.confirm(`确认删除任务 ${task.fieldName}？`, '删除确认', { type: 'warning' })
  await taskStore.deleteTask(task.taskId)
  ElMessage.success('任务已删除')
}

onMounted(loadTasks)
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
  border-radius: 14px;
  background: var(--app-panel-bg);
}

.stat-grid span,
.unit,
small {
  color: var(--app-text-muted);
}

.stat-grid strong {
  color: #fff;
  font-size: 30px;
}

.unit {
  margin-left: 8px;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
