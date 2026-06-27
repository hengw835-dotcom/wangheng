import test from 'node:test'
import assert from 'node:assert/strict'

import { getRuntimeConfig } from '../config/runtime.js'
import { describeApiError, normalizeApiError } from './error.js'

test('uses safe defaults when Vite env values are absent', () => {
  const config = getRuntimeConfig({})

  assert.equal(config.apiBaseURL, '')
  assert.equal(config.backendTarget, 'http://localhost:8086')
  assert.equal(config.websocketURL, 'ws://localhost:8086/ws')
})

test('normalizes common backend error responses for users', () => {
  assert.equal(describeApiError({ response: { status: 401 } }), '登录已失效，请重新登录')
  assert.equal(describeApiError({ response: { status: 403 } }), '当前账号权限不足')
  assert.equal(describeApiError({ response: { status: 429 } }), '请求过于频繁，请稍后再试')
  assert.equal(
    describeApiError({ response: { data: { message: '设备不存在' } } }),
    '设备不存在'
  )
  assert.equal(describeApiError(new Error('network down')), 'network down')
})

test('keeps backend error codes and request identifiers traceable', () => {
  const normalized = normalizeApiError({
    response: {
      status: 400,
      data: {
        code: 'INVALID_MACHINE_ID',
        message: '设备编号格式错误',
        timestamp: '2026-06-27T10:00:00Z'
      },
      headers: {
        'x-request-id': 'req-123'
      }
    },
    config: {
      headers: {
        'X-Request-Id': 'req-abc'
      }
    }
  })

  assert.deepEqual(normalized, {
    status: 400,
    code: 'INVALID_MACHINE_ID',
    message: '设备编号格式错误',
    timestamp: '2026-06-27T10:00:00Z',
    requestId: 'req-123'
  })
})
