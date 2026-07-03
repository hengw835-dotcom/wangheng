import test from 'node:test'
import assert from 'node:assert/strict'

import { apiPath } from './api-path.js'

test('keeps api proxy prefix when frontend is served with same-origin proxy', () => {
  assert.equal(apiPath('/auth/token', { apiBaseURL: '' }), '/api/auth/token')
  assert.equal(apiPath('machines', { apiBaseURL: '' }), '/api/machines')
})

test('omits api proxy prefix when frontend targets an external backend origin', () => {
  assert.equal(apiPath('/auth/token', { apiBaseURL: 'https://smart-harvester-api.onrender.com' }), '/auth/token')
  assert.equal(apiPath('machines', { apiBaseURL: 'https://smart-harvester-api.onrender.com' }), '/machines')
})
