import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildDeviceOptions,
  buildGisMapState,
  cycleMapLayer,
  filterMapMachines,
  formatRouteDistance,
  refreshGisMapState,
  zoomGisMap
} from './gisMapModel.js'

test('filters map machines by selected device and keyword', () => {
  const machines = [
    { id: 'machine-001', type: '收割机', location: '示范田 A 区' },
    { id: 'machine-002', type: '拖拉机', location: '停靠区 B' }
  ]

  assert.deepEqual(buildDeviceOptions(machines), [
    { label: '全部设备', value: 'ALL' },
    { label: 'machine-001', value: 'machine-001' },
    { label: 'machine-002', value: 'machine-002' }
  ])
  assert.deepEqual(filterMapMachines(machines, { selectedDevice: 'machine-001', keyword: '' }).map(item => item.id), ['machine-001'])
  assert.deepEqual(filterMapMachines(machines, { selectedDevice: 'ALL', keyword: '停靠' }).map(item => item.id), ['machine-002'])
})

test('updates GIS map tool state for zoom, layers, refresh and measuring', () => {
  const state = buildGisMapState(new Date('2026-06-28T10:20:30'))

  assert.equal(zoomGisMap(state, 4).zoom, 17)
  assert.equal(zoomGisMap(state, -10).zoom, 13)
  assert.equal(cycleMapLayer(state).mapLayer, 'terrain')
  assert.equal(cycleMapLayer({ ...state, mapLayer: 'terrain' }).mapLayer, 'satellite')
  assert.equal(formatRouteDistance(4680), '4.7 km')
  assert.equal(refreshGisMapState(state, new Date('2026-06-28T10:21:00')).lastRefreshed, '10:21:00')
})
