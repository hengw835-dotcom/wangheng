import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveDefaultRouteForViewport } from './mobile-routing.js'

test('mobile viewport starts on lightweight mobile dashboard', () => {
  assert.equal(resolveDefaultRouteForViewport(390), '/mobile')
  assert.equal(resolveDefaultRouteForViewport(768), '/mobile')
})

test('desktop viewport keeps full cockpit dashboard as default', () => {
  assert.equal(resolveDefaultRouteForViewport(769), '/')
  assert.equal(resolveDefaultRouteForViewport(1440), '/')
})
