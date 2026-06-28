import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildReportRows,
  filterSensorRecords,
  normalizeDetectionBox,
  paginateRecords,
  sortSensorRecords,
  summarizeSensors,
  toCsv,
  validateAiImage,
  validateMachineId,
  validateSimulatorReading
} from './analyticsModel.js'

test('validates AI upload type and size', () => {
  assert.equal(validateAiImage({ type: 'image/png', size: 1024 }), '')
  assert.equal(validateAiImage({ type: 'text/plain', size: 100 }), '仅支持 JPG、PNG、WebP 图片')
  assert.match(validateAiImage({ type: 'image/png', size: 20 * 1024 * 1024 }), /10MB/)
})

test('normalizes backend detection pixel boxes to percentages', () => {
  assert.deepEqual(normalizeDetectionBox({ x: 100, y: 50, width: 200, height: 100 }, { width: 1000, height: 500 }), {
    left: 10,
    top: 10,
    width: 20,
    height: 20
  })
})

test('filters sorts and paginates sensor records client side when backend lacks paging', () => {
  const rows = [
    { machineId: 'A', sensorType: 'temp', timestamp: '2026-01-01T00:00:00Z' },
    { machineId: 'A', sensorType: 'rpm', timestamp: '2026-01-02T00:00:00Z' },
    { machineId: 'B', sensorType: 'temp', timestamp: '2026-01-03T00:00:00Z' }
  ]
  const filtered = filterSensorRecords(rows, { machineId: 'A', start: '2026-01-02T00:00:00Z' })
  assert.equal(filtered.length, 1)
  assert.equal(sortSensorRecords(rows, 'desc')[0].machineId, 'B')
  assert.deepEqual(paginateRecords(rows, 2, 2), { total: 3, page: 2, pageSize: 2, rows: [rows[2]] })
})

test('validates simulator inputs against backend constraints', () => {
  assert.equal(validateMachineId('SIM-001'), '')
  assert.equal(validateMachineId('SIM 001'), '设备编号只能包含字母、数字、下划线和连字符')
  assert.deepEqual(validateSimulatorReading({ machineId: 'SIM-001', sensorType: 'temperature', value: 20, unit: 'C', location: 'cab' }), {})
  assert.equal(validateSimulatorReading({ machineId: 'bad id', sensorType: '?', value: 'x' }).value, '数值必须是数字')
})

test('builds report rows and CSV with escaped values', () => {
  const rows = buildReportRows({
    machines: [{ machineId: 'NJ-1', model: 'PRO "100"', status: 'ONLINE' }],
    tasks: [{ taskId: 'T-1', fieldName: 'A-1', status: 'COMPLETED', completedArea: 8, estimatedYield: 12 }],
    sensorSummary: { total: 3, latestMachine: 'NJ-1' }
  })
  const csv = toCsv(rows)
  assert.match(csv, /PRO ""100""/)
  assert.match(csv, /记录 3 条/)
})

test('summarizes sensor records across machines', () => {
  assert.deepEqual(summarizeSensors({
    A: [{ timestamp: '2026-01-01T00:00:00Z' }],
    B: [{ timestamp: '2026-01-02T00:00:00Z' }]
  }), { total: 2, machineCount: 2, latestMachine: 'B', latestTime: '2026-01-02T00:00:00Z' })
})
