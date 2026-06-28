import test from 'node:test'
import assert from 'node:assert/strict'

import {
  COMMAND_STATES,
  canSendControlCommand,
  commandStateFromAudit,
  createSubscriptionRegistry,
  nextReconnectDelay,
  validateControlParameters
} from './controlModel.js'

test('limits commands by real backend commands and machine status', () => {
  assert.equal(canSendControlCommand('START', 'IDLE'), true)
  assert.equal(canSendControlCommand('START', 'WORKING'), false)
  assert.equal(canSendControlCommand('PAUSE', 'WORKING'), true)
  assert.equal(canSendControlCommand('RESUME', 'PAUSED'), true)
  assert.equal(canSendControlCommand('STOP', 'WORKING'), true)
  assert.equal(canSendControlCommand('APPLY_PARAMS', 'OFFLINE'), false)
  assert.equal(canSendControlCommand('DELETE', 'WORKING'), false)
})

test('maps audits to explicit command UI states', () => {
  assert.equal(commandStateFromAudit({ status: 'PENDING' }), COMMAND_STATES.ACCEPTED)
  assert.equal(commandStateFromAudit({ status: 'PUBLISHED' }), COMMAND_STATES.ACCEPTED)
  assert.equal(commandStateFromAudit({ status: 'ACKNOWLEDGED' }), COMMAND_STATES.SUCCEEDED)
  assert.equal(commandStateFromAudit({ status: 'REJECTED' }), COMMAND_STATES.FAILED)
  assert.equal(commandStateFromAudit({ status: 'FAILED' }), COMMAND_STATES.FAILED)
})

test('validates control parameter ranges and units', () => {
  assert.deepEqual(validateControlParameters({ targetSpeed: 8, cuttingHeight: 35, feedingRate: 65 }), {})
  assert.deepEqual(validateControlParameters({ targetSpeed: 99, cuttingHeight: -1, feedingRate: 120 }), {
    targetSpeed: '目标速度必须在 0-20 km/h',
    cuttingHeight: '割台高度必须在 0-100 cm',
    feedingRate: '喂入量必须在 0-100%'
  })
})

test('calculates bounded exponential reconnect delay with deterministic jitter', () => {
  assert.equal(nextReconnectDelay(0, 1000, 30000, 0), 1000)
  assert.equal(nextReconnectDelay(3, 1000, 30000, 0), 8000)
  assert.equal(nextReconnectDelay(10, 1000, 30000, 0), 30000)
  assert.equal(nextReconnectDelay(1, 1000, 30000, 0.25), 2500)
})

test('deduplicates realtime subscriptions and supports cleanup', () => {
  const registry = createSubscriptionRegistry()
  const handler = () => {}
  assert.equal(registry.add('/topic/machine-status', handler), true)
  assert.equal(registry.add('/topic/machine-status', handler), false)
  assert.equal(registry.size('/topic/machine-status'), 1)
  assert.equal(registry.remove('/topic/machine-status', handler), true)
  assert.equal(registry.size(), 0)
})
