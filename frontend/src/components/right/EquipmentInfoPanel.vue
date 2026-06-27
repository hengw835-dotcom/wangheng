<template>
  <DashboardCard>
    <!-- 设备信息面板已删除 -->
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import DashboardCard from '../common/DashboardCard.vue'

const props = defineProps({
  machines: { type: Array, default: () => [] }
})

const devices = computed(() => [
  { label: '收割机', count: props.machines.filter(m => m.model?.includes('收割') || m.model?.includes('Deere') || m.model?.includes('Case') || m.model?.includes('Holland')).length || 0, icon: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="8" width="18" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
  { label: '传感器', count: 0, icon: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="1.5"/></svg>' },
  { label: '摄像头', count: 0, icon: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="6" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M17 10l4-2v8l-4-2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
  { label: '服务器', count: 0, icon: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="4" y="3" width="16" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="13" width="16" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/></svg>' }
])

const gauges = [
  { title: '速度', value: 0, max: 10, color: '#00d4ff' },
  { title: '转速', value: 0, max: 3500, color: '#ffd700' },
  { title: '载量', value: 0, max: 100, color: '#00ff88' }
]

const gaugeRefs = {}
const gaugeCharts = []

function setGaugeRef(el, title) {
  if (el) gaugeRefs[title] = el
}

let resizeHandler = null

onMounted(() => {
  setTimeout(() => {
    gauges.forEach(g => {
      const el = gaugeRefs[g.title]
      if (el) {
        const chart = echarts.init(el)
        chart.setOption({
          series: [{
            type: 'gauge',
            radius: '85%',
            min: 0,
            max: g.max,
            startAngle: 225,
            endAngle: -45,
            progress: { show: true, width: 6, itemStyle: { color: g.color } },
            axisLine: { lineStyle: { width: 6, color: [[1, 'rgba(255,255,255,0.06)']] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            pointer: { show: false },
            anchor: { show: false },
            title: { show: true, offsetCenter: [0, '65%'], fontSize: 10, color: 'rgba(255,255,255,0.5)' },
            detail: {
              valueAnimation: true, fontSize: 15, fontWeight: 'bold',
              color: '#fff', offsetCenter: [0, '15%'],
              formatter: '{value}'
            },
            data: [{ value: g.value, name: g.title }]
          }]
        })
        gaugeCharts.push(chart)
      }
    })

    resizeHandler = () => gaugeCharts.forEach(c => c?.resize())
    window.addEventListener('resize', resizeHandler)
  }, 100)
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  gaugeCharts.forEach(c => c?.dispose())
})
</script>

<style scoped>
.equip-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-icons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.device-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.device-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-cyan);
}

.device-label {
  font-size: 10px;
  color: var(--text-muted);
}

.device-count {
  font-size: 13px;
  font-weight: bold;
  color: var(--text-primary);
  font-family: var(--font-digital);
}

.gauge-row {
  display: flex;
  gap: 4px;
}

.gauge-item {
  flex: 1;
}

.gauge-chart {
  width: 100%;
  height: 90px;
}
</style>
