import test from 'node:test'
import assert from 'node:assert/strict'

import {
  canTransitionTaskStatus,
  filterMachines,
  filterTasks,
  mapServerFieldErrors,
  paginateRows,
  validateMachineForm,
  validateTaskForm
} from './operationsModel.js'

test('filters and paginates machines without mutating rows', () => {
  const machines = [
    { machineId: 'NJ-001', model: 'PRO', status: 'WORKING', location: 'A-1' },
    { machineId: 'NJ-002', model: 'X2', status: 'OFFLINE', location: 'B-1' },
    { machineId: 'AB-003', model: 'RX', status: 'IDLE', location: 'A-2' }
  ]

  assert.deepEqual(filterMachines(machines, { keyword: 'NJ', status: 'ALL' }).map(item => item.machineId), ['NJ-001', 'NJ-002'])
  assert.deepEqual(filterMachines(machines, { keyword: 'A-', status: 'IDLE' }).map(item => item.machineId), ['AB-003'])
  assert.deepEqual(paginateRows(machines, { page: 2, pageSize: 2 }).map(item => item.machineId), ['AB-003'])
})

test('filters tasks by keyword, device and legal backend status', () => {
  const tasks = [
    { taskId: 'T-1', machineId: 'NJ-001', fieldName: 'A区', status: 'PENDING' },
    { taskId: 'T-2', machineId: 'NJ-002', fieldName: 'B区', status: 'IN_PROGRESS' },
    { taskId: 'T-3', machineId: 'NJ-001', fieldName: 'C区', status: 'COMPLETED' }
  ]

  assert.deepEqual(filterTasks(tasks, { machineId: 'NJ-001', status: 'ALL' }).map(item => item.taskId), ['T-1', 'T-3'])
  assert.deepEqual(filterTasks(tasks, { keyword: 'B', status: 'IN_PROGRESS' }).map(item => item.taskId), ['T-2'])
  assert.deepEqual(filterTasks(tasks, { status: 'RUNNING' }).map(item => item.taskId), [])
})

test('enforces task status machine and validates forms', () => {
  assert.equal(canTransitionTaskStatus('PENDING', 'IN_PROGRESS'), true)
  assert.equal(canTransitionTaskStatus('IN_PROGRESS', 'COMPLETED'), true)
  assert.equal(canTransitionTaskStatus('COMPLETED', 'IN_PROGRESS'), false)
  assert.equal(canTransitionTaskStatus('PENDING', 'COMPLETED'), false)

  assert.deepEqual(validateMachineForm({ machineId: '', model: '', status: 'BROKEN' }), {
    machineId: '农机编号不能为空',
    model: '型号不能为空',
    status: '设备状态不合法'
  })
  assert.deepEqual(validateTaskForm({ fieldName: '', machineId: '', targetArea: 0 }), {
    fieldName: '地块名称不能为空',
    machineId: '农机编号不能为空',
    targetArea: '目标面积必须大于 0'
  })
})

test('maps backend field errors to frontend form fields', () => {
  assert.deepEqual(mapServerFieldErrors({
    response: {
      data: {
        fieldErrors: {
          machineId: 'must match pattern',
          targetArea: 'must be positive'
        }
      }
    }
  }), {
    machineId: 'must match pattern',
    targetArea: 'must be positive'
  })
  assert.deepEqual(mapServerFieldErrors({ response: { data: { message: 'Machine not found: NJ-999' } } }), {
    machineId: 'Machine not found: NJ-999'
  })
})
