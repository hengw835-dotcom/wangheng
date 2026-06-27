import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildDashboardSnapshot,
  calculateFleetSummary,
  formatPercent,
  taskProgress,
  statusLabel
} from './dashboardModel.js'

test('calculates fleet summary from machines and tasks', () => {
  const machines = [
    { status: 'WORKING' },
    { status: 'ONLINE' },
    { status: 'OFFLINE' },
    { status: 'ERROR' }
  ]
  const tasks = [
    { status: 'IN_PROGRESS', targetArea: 100, completedArea: 40 },
    { status: 'COMPLETED', targetArea: 50, completedArea: 50 }
  ]

  const summary = calculateFleetSummary(machines, tasks)

  assert.equal(summary.onlineMachines, 2)
  assert.equal(summary.totalMachines, 4)
  assert.equal(summary.activeTasks, 1)
  assert.equal(summary.totalTasks, 2)
  assert.equal(summary.harvestProgress, 60)
})

test('formats dashboard status and progress values', () => {
  assert.equal(formatPercent(77.777), '77.8%')
  assert.equal(taskProgress({ targetArea: 320, completedArea: 80 }), 25)
  assert.equal(taskProgress({ targetArea: 0, completedArea: 80 }), 0)
  assert.equal(statusLabel('WORKING'), '作业中')
  assert.equal(statusLabel('UNKNOWN'), 'UNKNOWN')
})

test('builds a dashboard snapshot from real store DTOs', () => {
  const snapshot = buildDashboardSnapshot({
    machines: [
      { machineId: 'NJ-003', model: 'PRO 100', status: 'WORKING', location: 'A-13', lastUpdated: '2026-06-27T10:20:00' },
      { machineId: 'NJ-001', model: 'RX 90', status: 'ONLINE', location: 'A-12', lastUpdated: '2026-06-27T10:19:00' },
      { machineId: 'NJ-002', model: 'HX 80', status: 'ERROR', location: 'A-11', lastUpdated: '2026-06-27T10:18:00' }
    ],
    tasks: [
      { taskId: 'T-1', machineId: 'NJ-003', fieldName: 'A-13', status: 'IN_PROGRESS', targetArea: 120, completedArea: 60, startTime: '2026-06-27T08:00:00' },
      { taskId: 'T-2', machineId: 'NJ-001', fieldName: 'A-12', status: 'COMPLETED', targetArea: 80, completedArea: 80, startTime: '2026-06-27T07:00:00' },
      { taskId: 'T-3', machineId: 'NJ-002', fieldName: 'A-11', status: 'PENDING', targetArea: 100, completedArea: 0, startTime: '2026-06-27T09:00:00' }
    ],
    capabilities: { aiVision: 'demo', navigation: 'enabled', control: 'enabled' },
    now: new Date('2026-06-27T10:30:00')
  })

  assert.equal(snapshot.kpis[0].value, '2')
  assert.equal(snapshot.kpis[1].value, '1')
  assert.equal(snapshot.kpis[2].value, '46.7')
  assert.equal(snapshot.taskProgress.running, 1)
  assert.equal(snapshot.taskProgress.completed, 1)
  assert.equal(snapshot.taskProgress.pending, 1)
  assert.deepEqual(snapshot.topMachines.map(item => item.id), ['NJ-003', 'NJ-001', 'NJ-002'])
  assert.equal(snapshot.alarms[0].device, 'NJ-002')
  assert.equal(snapshot.events[0].device, 'NJ-003')
  assert.equal(snapshot.fields.length, 3)
  assert.equal(snapshot.ai.statusText, 'demo')
})
