export const cockpitChartPalette = ['#35D6FF', '#2F8CFF', '#45D483', '#F6C85F', '#FF6B6B', '#9B7CFF', '#5DE2C7']

export const cockpitChartTheme = {
  backgroundColor: 'transparent',
  color: cockpitChartPalette,
  textStyle: {
    color: 'rgba(220, 236, 255, 0.86)',
    fontFamily: 'Microsoft YaHei, PingFang SC, Helvetica Neue, Arial, sans-serif'
  }
}

export function getCockpitTooltip(overrides = {}) {
  return {
    backgroundColor: 'rgba(3, 16, 29, 0.94)',
    borderColor: 'rgba(53, 214, 255, 0.38)',
    borderWidth: 1,
    padding: [8, 10],
    textStyle: { color: '#F4F9FF', fontSize: 12 },
    extraCssText: 'box-shadow: 0 12px 30px rgba(0,0,0,.28); border-radius: 8px;',
    ...overrides
  }
}

export function getCockpitAxis({ name = '', data, showSplitLine = true } = {}) {
  return {
    name,
    data,
    axisLine: { lineStyle: { color: 'rgba(91, 166, 219, 0.36)' } },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(220, 236, 255, 0.62)', fontSize: 11 },
    splitLine: { show: showSplitLine, lineStyle: { color: 'rgba(91, 166, 219, 0.12)' } },
    nameTextStyle: { color: 'rgba(220, 236, 255, 0.62)', fontSize: 11 }
  }
}

export function getCockpitLegend(overrides = {}) {
  return {
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 6,
    textStyle: { color: 'rgba(220, 236, 255, 0.72)', fontSize: 12 },
    ...overrides
  }
}

export function getChartEmptyOption(message = '暂无数据') {
  return {
    title: {
      text: message,
      left: 'center',
      top: 'middle',
      textStyle: { color: 'rgba(220, 236, 255, 0.52)', fontSize: 13, fontWeight: 'normal' }
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: []
  }
}

export function getChartLoadingOptions() {
  return {
    text: '加载中...',
    color: '#35D6FF',
    textColor: 'rgba(220, 236, 255, 0.72)',
    maskColor: 'rgba(3, 16, 29, 0.38)',
    zlevel: 0
  }
}

export function getDarkTooltip() {
  return {
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderWidth: 1,
    textStyle: { color: '#fff', fontSize: 12 }
  }
}

export function getDarkAxis(name, data) {
  return {
    axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.06)' } },
    name,
    nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
    data
  }
}

export function getGlowGradient(color1, color2) {
  return {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 }
    ]
  }
}

export function getGaugeOption(value, max, title, color) {
  return {
    series: [{
      type: 'gauge',
      radius: '90%',
      min: 0,
      max,
      progress: { show: true, width: 8, itemStyle: { color } },
      axisLine: { lineStyle: { width: 8, color: [[1, 'rgba(0, 212, 255, 0.1)']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: { show: true, offsetCenter: [0, '70%'], fontSize: 11, color: 'rgba(255,255,255,0.6)' },
      detail: {
        valueAnimation: true, fontSize: 18, fontWeight: 'bold',
        color: '#fff', offsetCenter: [0, '20%'],
        formatter: '{value}'
      },
      data: [{ value, name: title }]
    }]
  }
}

export function getRingOption(value, total, title, color) {
  const percent = total > 0 ? (value / total * 100) : 0
  return {
    series: [{
      type: 'pie',
      radius: ['70%', '85%'],
      avoidLabelOverlap: false,
      label: { show: true, position: 'center', fontSize: 16, fontWeight: 'bold', color: '#fff', formatter: `${value}` },
      labelLine: { show: false },
      itemStyle: { borderWidth: 0 },
      data: [
        { value: percent, name: title, itemStyle: { color } },
        { value: 100 - percent, name: '', itemStyle: { color: 'rgba(255,255,255,0.05)' } }
      ]
    }]
  }
}
