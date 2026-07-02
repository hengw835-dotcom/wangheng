import assert from 'node:assert/strict'
import test from 'node:test'

import { buildDrawerQuery, clearDrawerQuery, COCKPIT_DRAWER_TYPES } from './useDrawerManager.js'

test('defines supported single business drawer types', () => {
  assert.deepEqual(COCKPIT_DRAWER_TYPES, ['machine', 'task', 'sensor', 'control', 'report'])
})

test('builds drawer query while replacing any existing drawer state', () => {
  assert.deepEqual(
    buildDrawerQuery('machine', { machineId: 'M-001' }, { page: '1', drawer: 'task', taskId: 'T-1' }),
    { page: '1', drawer: 'machine', machineId: 'M-001' }
  )
})

test('clears drawer related query keys without removing unrelated query', () => {
  assert.deepEqual(
    clearDrawerQuery({ drawer: 'machine', machineId: 'M-001', taskId: 'T-1', page: '2' }),
    { page: '2' }
  )
})

test('rejects unsupported drawer types', () => {
  assert.throws(() => buildDrawerQuery('unknown'), /Unsupported cockpit drawer/)
})
