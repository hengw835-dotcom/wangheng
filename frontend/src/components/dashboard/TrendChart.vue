<template>
  <div ref="chartRef" class="trend-chart"></div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: { type: String, default: '' },
  unit: { type: String, default: '' },
  today: { type: Array, default: () => [] },
  yesterday: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chart

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0d2130',
    borderColor: '#28495c',
    textStyle: { color: '#d8eaea' }
  },
  legend: {
    right: 4,
    top: 0,
    textStyle: { color: '#7c98a3', fontSize: 10 }
  },
  grid: { left: 38, right: 12, top: 30, bottom: 24 },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#274353' } },
    axisLabel: { color: '#9eb0c0', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(114,158,169,.09)' } }
  },
  yAxis: {
    type: 'value',
    name: props.unit,
    nameTextStyle: { color: '#9eb0c0', fontSize: 10 },
    axisLine: { lineStyle: { color: '#274353' } },
    axisLabel: { color: '#9eb0c0', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(114,158,169,.12)' } }
  },
  series: [
    {
      name: '今日',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: props.today,
      lineStyle: { color: '#55d987', width: 3 },
      itemStyle: { color: '#55d987' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(79,215,131,.28)' },
            { offset: 1, color: 'rgba(79,215,131,0)' }
          ]
        }
      }
    },
    {
      name: '昨日',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      data: props.yesterday,
      lineStyle: { color: '#3b82f6', width: 3 },
      itemStyle: { color: '#3b82f6' }
    }
  ]
}))

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption(option.value, true)
}

function resize() {
  chart?.resize()
}

onMounted(async () => {
  await nextTick()
  render()
  window.addEventListener('resize', resize)
})

watch(option, render, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 205px;
}
</style>
