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
