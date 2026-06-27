import test from 'node:test'
import assert from 'node:assert/strict'

import { getRuntimeConfig } from './runtime.js'

test('requires mock mode to be explicit', () => {
  const config = getRuntimeConfig({})

  assert.equal(config.apiMode, 'real')
  assert.equal(config.mockEnabled, false)
})

test('blocks mock mode for production builds', () => {
  assert.throws(
    () => getRuntimeConfig({ MODE: 'production', VITE_API_MODE: 'mock' }),
    /Mock mode is not allowed/
  )
})

test('uses configured API base and websocket URL without changing backend target', () => {
  const config = getRuntimeConfig({
    VITE_BACKEND_TARGET: 'http://localhost:8086',
    VITE_API_BASE_URL: '/api',
    VITE_WS_URL: 'ws://localhost:8086/ws',
    VITE_API_MODE: 'real'
  })

  assert.equal(config.apiBaseURL, '/api')
  assert.equal(config.backendTarget, 'http://localhost:8086')
  assert.equal(config.websocketURL, 'ws://localhost:8086/ws')
})
