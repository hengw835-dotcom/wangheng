<template>
  <DashboardCard title="设备统计">
    <!-- 设备统计面板已删除 -->
  </DashboardCard>
</template>

<script setup>
import { computed } from 'vue'
import DashboardCard from '../common/DashboardCard.vue'

const props = defineProps({
  machines: { type: Array, default: () => [] }
})

const stats = computed(() => {
  const total = props.machines.length || 47
  const working = props.machines.filter(m => m.status === 'WORKING').length || 32
  const error = props.machines.filter(m => m.status === 'ERROR').length || 11
  return [
    { label: '设备总量', value: total, color: 'var(--color-cyan)' },
    { label: '运行设备', value: working, color: 'var(--color-green)' },
    { label: '异常设备', value: error, color: 'var(--color-orange)' }
  ]
})
</script>

<style scoped>
.stats-row {
  display: flex;
  gap: 8px;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 10px 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-card);
  border-radius: var(--radius);
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  font-family: var(--font-digital);
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
