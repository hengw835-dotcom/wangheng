<template>
  <DashboardCard title="收割数据统计">
    <div class="chart-wrapper" ref="chartRef"></div>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import DashboardCard from '../common/DashboardCard.vue'
import { getDarkTooltip } from '../../utils/echarts-theme.js'

const props = defineProps({
  tasks: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chart = null

function getOption() {
  const hours = []
  const hourData = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000)
    hours.push(`${String(h.getHours()).padStart(2, '0')}:00`)
    hourData.push(0) // 显示空数据
  }

  return {
    tooltip: { ...getDarkTooltip(), trigger: 'axis' },
    grid: { left: 40, right: 40, top: 10, bottom: 30 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.15)' } },
      axisTick: { show: false },
      axisLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        interval: 3
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.06)' } }
    },
    series: [
      {
        type: 'bar',
        data: hourData,
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.6)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
            ]
          },
          borderRadius: [2, 2, 0, 0]
        }
      },
      {
        type: 'line',
        data: hourData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: 'rgba(0, 255, 136, 0.6)', width: 1.5 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 255, 136, 0.15)' },
              { offset: 1, color: 'rgba(0, 255, 136, 0)' }
            ]
          }
        }
      }
    ]
  }
}

let resizeHandler = null

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(getOption())
    resizeHandler = () => chart?.resize()
    window.addEventListener('resize', resizeHandler)
  }
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  chart?.dispose()
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 180px;
}
</style>
