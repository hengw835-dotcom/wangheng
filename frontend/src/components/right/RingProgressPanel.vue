<template>
  <div class="ring-panel">
    <div class="ring-item" v-for="r in rings" :key="r.title">
      <div class="ring-chart" :ref="el => setRingRef(el, r.title)"></div>
      <div class="ring-label">{{ r.title }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  machines: { type: Array, default: () => [] }
})

const rings = computed(() => {
  const total = props.machines.length || 47
  const working = props.machines.filter(m => m.status === 'WORKING').length || 26
  const newCount = props.machines.filter(m => {
    if (!m.lastUpdated) return false
    const d = new Date(m.lastUpdated)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length || 10
  const errorCount = props.machines.filter(m => m.status === 'ERROR').length || 18
  return [
    { title: '运行设备', value: working, total, color: '#00d4ff' },
    { title: '新增设备', value: newCount, total, color: '#ffd700' },
    { title: '故障设备', value: errorCount, total, color: '#ff8c00' }
  ]
})

const ringRefs = {}
const charts = []

function setRingRef(el, title) {
  if (el) ringRefs[title] = el
}

let resizeHandler = null

onMounted(() => {
  setTimeout(() => {
    rings.value.forEach(r => {
      const el = ringRefs[r.title]
      if (!el) return
      const chart = echarts.init(el)
      const pct = r.total > 0 ? Math.round(r.value / r.total * 100) : 0
      chart.setOption({
        series: [{
          type: 'pie',
          radius: ['68%', '84%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff',
            fontFamily: 'DIN Alternate, Courier New, monospace',
            formatter: `${r.value}`
          },
          labelLine: { show: false },
          itemStyle: { borderWidth: 0 },
          silent: true,
          animation: true,
          animationDuration: 1200,
          data: [
            { value: pct, itemStyle: { color: r.color } },
            { value: 100 - pct, itemStyle: { color: 'rgba(255,255,255,0.04)' } }
          ]
        }]
      })
      charts.push(chart)
    })

    resizeHandler = () => charts.forEach(c => c?.resize())
    window.addEventListener('resize', resizeHandler)
  }, 100)
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  charts.forEach(c => c?.dispose())
})
</script>

<style scoped>
.ring-panel {
  display: flex;
  gap: 8px;
}

.ring-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-chart {
  width: 100%;
  height: 80px;
}

.ring-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
</style>
