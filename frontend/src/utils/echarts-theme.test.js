import assert from 'node:assert/strict'
import test from 'node:test'

import {
  cockpitChartPalette,
  cockpitChartTheme,
  getChartEmptyOption,
  getChartLoadingOptions,
  getCockpitAxis,
  getCockpitLegend,
  getCockpitTooltip,
  getDarkTooltip
} from './echarts-theme.js'

test('exports reusable cockpit chart palette and theme', () => {
  assert.ok(cockpitChartPalette.length >= 6)
  assert.equal(cockpitChartPalette[0], '#35D6FF')
  assert.deepEqual(cockpitChartTheme.color, cockpitChartPalette)
  assert.equal(cockpitChartTheme.backgroundColor, 'transparent')
})

test('builds cockpit tooltip axis and legend options', () => {
  assert.equal(getCockpitTooltip().backgroundColor, 'rgba(3, 16, 29, 0.94)')
  assert.equal(getCockpitTooltip({ trigger: 'axis' }).trigger, 'axis')

  const axis = getCockpitAxis({ name: '亩', data: ['一', '二'] })
  assert.equal(axis.name, '亩')
  assert.deepEqual(axis.data, ['一', '二'])
  assert.equal(axis.axisTick.show, false)
  assert.equal(axis.splitLine.show, true)

  const legend = getCockpitLegend({ top: 4 })
  assert.equal(legend.top, 4)
  assert.equal(legend.textStyle.color, 'rgba(220, 236, 255, 0.72)')
})

test('keeps legacy dark tooltip export compatible', () => {
  assert.equal(getDarkTooltip().borderWidth, 1)
})

test('provides empty and loading chart options', () => {
  const empty = getChartEmptyOption('暂无趋势数据')
  assert.equal(empty.title.text, '暂无趋势数据')
  assert.equal(empty.xAxis.show, false)
  assert.equal(empty.yAxis.show, false)

  const loading = getChartLoadingOptions()
  assert.equal(loading.text, '加载中...')
  assert.equal(loading.color, '#35D6FF')
})
