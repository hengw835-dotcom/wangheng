<template>
  <DashboardCard title="监控产品信息">
    <div class="harvest-info">
      <div class="info-table">
        <div class="info-row header-row">
          <span class="col-name">地块</span>
          <span class="col-area">面积(亩)</span>
          <span class="col-yield">产量(吨)</span>
          <span class="col-status">状态</span>
        </div>
        <div class="info-row" v-for="t in displayTasks" :key="t.taskId || t.fieldName">
          <span class="col-name">{{ t.fieldName }}</span>
          <span class="col-area">{{ t.targetArea }}</span>
          <span class="col-yield">{{ t.estimatedYield }}</span>
          <span class="col-status">
            <span class="status-tag" :class="getStatusClass(t.status)">{{ getStatusText(t.status) }}</span>
          </span>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup>
import { computed } from 'vue'
import DashboardCard from '../common/DashboardCard.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] }
})

const displayTasks = computed(() => {
  if (props.tasks.length > 0) return props.tasks.slice(0, 5)
  return [
    { fieldName: '东地块', targetArea: 100, estimatedYield: 25, status: 'IN_PROGRESS' },
    { fieldName: '西地块', targetArea: 80, estimatedYield: 20, status: 'PENDING' },
    { fieldName: '南地块', targetArea: 75, estimatedYield: 22, status: 'COMPLETED' },
    { fieldName: '北地块', targetArea: 120, estimatedYield: 30, status: 'IN_PROGRESS' },
    { fieldName: '中心田', targetArea: 60, estimatedYield: 15, status: 'PENDING' }
  ]
})

function getStatusClass(s) {
  if (s === 'COMPLETED') return 'completed'
  if (s === 'IN_PROGRESS') return 'progress'
  return 'pending'
}

function getStatusText(s) {
  if (s === 'COMPLETED') return '已完成'
  if (s === 'IN_PROGRESS') return '作业中'
  return '待作业'
}
</script>

<style scoped>
.harvest-info {
  overflow: hidden;
}

.info-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  font-size: 11px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.info-row.header-row {
  color: var(--text-muted);
  font-size: 10px;
  border-bottom: 1px solid var(--border-card);
}

.col-name { flex: 1.2; color: var(--text-secondary); }
.col-area { flex: 1; text-align: center; color: var(--text-secondary); }
.col-yield { flex: 1; text-align: center; color: var(--text-secondary); }
.col-status { flex: 1; text-align: right; }

.status-tag {
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 10px;
}

.status-tag.completed { background: rgba(0, 255, 136, 0.15); color: var(--color-green); }
.status-tag.progress { background: rgba(0, 212, 255, 0.15); color: var(--color-cyan); }
.status-tag.pending { background: rgba(255, 215, 0, 0.15); color: var(--color-gold); }
</style>
