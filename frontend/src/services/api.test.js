import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CONTROL_COMMANDS,
  MACHINE_STATUSES,
  TASK_STATUSES,
  buildTaskProgressParams,
  createIdempotencyKey,
  createTextBodyConfig,
  toAuthSessionDto,
  toMachineDto,
  toSensorDataDto,
  toTaskDto
} from './api-contracts.js'
import { createRequestId, shouldAttachAuthToken, unwrapApiResponse } from './request.js'
import { ACTION_PERMISSIONS, ROUTE_PERMISSIONS, canAccessRoute, canPerform } from './permissions.js'

test('documents backend enum values used by real DTOs', () => {
  assert.ok(MACHINE_STATUSES.includes('WORKING'))
  assert.ok(TASK_STATUSES.includes('IN_PROGRESS'))
  assert.ok(CONTROL_COMMANDS.includes('APPLY_PARAMS'))
})

test('normalizes direct backend DTO responses without mock envelopes', () => {
  assert.deepEqual(toAuthSessionDto({
    accessToken: 'abc',
    tokenType: 'Bearer',
    expiresAt: '2026-06-27T10:00:00',
    roles: ['ROLE_ADMIN']
  }), {
    accessToken: 'abc',
    tokenType: 'Bearer',
    expiresAt: '2026-06-27T10:00:00',
    roles: ['ROLE_ADMIN']
  })

  assert.deepEqual(toMachineDto({
    id: 1,
    machineId: 'NJ-001',
    model: 'PRO 100',
    status: 'WORKING',
    location: 'A-12',
    lastUpdated: '2026-06-27T10:00:00',
    parameters: { speed: 3.2 }
  }), {
    id: 1,
    machineId: 'NJ-001',
    model: 'PRO 100',
    status: 'WORKING',
    location: 'A-12',
    lastUpdated: '2026-06-27T10:00:00',
    parameters: { speed: 3.2 }
  })

  assert.equal(toTaskDto({ taskId: 'T-1', status: 'PENDING', completedArea: 12 }).completedArea, 12)
  assert.equal(toSensorDataDto({ machineId: 'NJ-001', sensorType: 'fuel', value: 38.6 }).value, 38.6)
})

test('builds real backend request shapes for text bodies, progress params, request IDs and idempotency keys', () => {
  assert.deepEqual(createTextBodyConfig(), { headers: { 'Content-Type': 'text/plain' } })
  assert.deepEqual(buildTaskProgressParams(56.3), { params: { completedArea: 56.3 } })
  assert.match(createRequestId(), /^req-[a-z0-9-]+$/)
  assert.match(createIdempotencyKey('NJ-003', 'START'), /^NJ-003-START-[a-z0-9-]+$/)
  assert.deepEqual(unwrapApiResponse({ data: { ok: true } }), { ok: true })
})

test('does not attach stale bearer tokens to the login endpoint', () => {
  assert.equal(shouldAttachAuthToken('/api/auth/token'), false)
  assert.equal(shouldAttachAuthToken('/auth/token'), false)
  assert.equal(shouldAttachAuthToken('/api/machines'), true)
})

test('defines route and action permission mappings from backend roles', () => {
  assert.deepEqual(ROUTE_PERMISSIONS['/admin'], ['ROLE_ADMIN'])
  assert.deepEqual(ACTION_PERMISSIONS['machine:delete'], ['ROLE_ADMIN'])
  assert.equal(canAccessRoute('/admin', ['ROLE_DISPATCHER']), false)
  assert.equal(canAccessRoute('/machines', ['ROLE_VIEWER']), true)
  assert.equal(canPerform('control:send', ['ROLE_DISPATCHER']), true)
  assert.equal(canPerform('machine:delete', ['ROLE_DISPATCHER']), false)
})
