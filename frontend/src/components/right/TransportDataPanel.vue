<template>
  <DashboardCard title="运输数据">
    <div class="transport-panel">
      <div class="transport-item" v-for="t in transportData" :key="t.label">
        <div class="transport-info">
          <span class="transport-label">{{ t.label }}</span>
          <span class="transport-value" :style="{ color: t.color }">{{ t.value }}</span>
        </div>
        <div class="transport-bar">
          <div class="bar-fill" :style="{ width: t.percent + '%', background: t.color }"></div>
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

const transportData = computed(() => {
  const completed = props.tasks.filter(t => t.status === 'COMPLETED')
  const totalYield = completed.reduce((s, t) => s + (t.estimatedYield || 0), 0)

  return [
    { label: '已运输量', value: `${totalYield || 67} 吨`, percent: 72, color: 'var(--color-cyan)' },
    { label: '待运输量', value: `${Math.floor(totalYield * 0.3) || 22} 吨`, percent: 28, color: 'var(--color-gold)' },
    { label: '运输车辆', value: '5 辆', percent: 60, color: 'var(--color-green)' },
    { label: '仓储使用', value: '78%', percent: 78, color: 'var(--color-orange)' }
  ]
})
</script>

<style scoped>
.transport-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transport-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transport-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transport-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.transport-value {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-digital);
}

.transport-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s ease;
}
</style>
