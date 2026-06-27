<template>
  <DashboardCard title="环境传感数据">
    <div class="sensor-grid">
      <div class="sensor-item" v-for="s in sensorList" :key="s.label">
        <span class="sensor-label">{{ s.label }}</span>
        <span class="sensor-value" :style="{ color: s.color }">{{ s.value }}</span>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup>
import { computed } from 'vue'
import DashboardCard from '../common/DashboardCard.vue'

const props = defineProps({
  sensorData: { type: Array, default: () => [] }
})

const sensorList = computed(() => {
  const findValue = (type) => {
    const item = props.sensorData.find(d => d.sensorType === type)
    return item ? item.value : null
  }

  return [
    { label: '环境温度', value: (findValue('temperature') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' },
    { label: '温室传感', value: (findValue('greenhouse_temp') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' },
    { label: '大气压传感', value: (findValue('pressure') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' },
    { label: '温度传感', value: (findValue('engine_temp') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' },
    { label: '环境湿度', value: (findValue('humidity') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' },
    { label: 'PM2.5传感', value: (findValue('pm25') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' },
    { label: '风向传感', value: (findValue('wind_direction') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' },
    { label: '风速传感', value: (findValue('wind_speed') ?? 23.22).toFixed(2), color: 'var(--color-cyan)' }
  ]
})
</script>

<style scoped>
.sensor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.sensor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 3px;
}

.sensor-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.sensor-value {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-digital);
}
</style>
