import assert from 'node:assert/strict'
import test from 'node:test'

import {
  COCKPIT_STATUS_TYPES,
  getCockpitStatusMeta,
  normalizeCockpitStatus
} from './status-theme.js'

test('normalizes common backend and UI statuses to cockpit status types', () => {
  assert.deepEqual(COCKPIT_STATUS_TYPES, ['success', 'warning', 'danger', 'info', 'offline', 'stale'])
  assert.equal(normalizeCockpitStatus('ONLINE'), 'success')
  assert.equal(normalizeCockpitStatus('COMPLETED'), 'success')
  assert.equal(normalizeCockpitStatus('IN_PROGRESS'), 'warning')
  assert.equal(normalizeCockpitStatus('ALARM'), 'danger')
  assert.equal(normalizeCockpitStatus('OFFLINE'), 'offline')
  assert.equal(normalizeCockpitStatus('EXPIRED'), 'stale')
  assert.equal(normalizeCockpitStatus('unknown-value'), 'info')
})

test('returns class names and readable labels for cockpit status badges', () => {
  assert.deepEqual(getCockpitStatusMeta('ONLINE'), {
    type: 'success',
    label: '在线',
    className: 'yh-status-badge yh-status-badge--success'
  })
  assert.deepEqual(getCockpitStatusMeta('OFFLINE'), {
    type: 'offline',
    label: '离线',
    className: 'yh-status-badge yh-status-badge--offline'
  })
  assert.deepEqual(getCockpitStatusMeta('EXPIRED'), {
    type: 'stale',
    label: '过期',
    className: 'yh-status-badge yh-status-badge--stale'
  })
})
