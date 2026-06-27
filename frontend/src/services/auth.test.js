import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clearAuthSession,
  getAuthToken,
  getStoredRoles,
  getStoredUsername,
  hasAnyRole,
  setAuthSession
} from './auth.js'

function createStorage() {
  const items = new Map()
  return {
    getItem(key) {
      return items.has(key) ? items.get(key) : null
    },
    setItem(key, value) {
      items.set(key, String(value))
    },
    removeItem(key) {
      items.delete(key)
    }
  }
}

test('stores and clears token session through a guarded storage adapter', () => {
  const storage = createStorage()

  setAuthSession(
    {
      accessToken: 'token-1',
      username: 'admin',
      roles: ['ROLE_ADMIN', 'ROLE_DISPATCHER']
    },
    storage
  )

  assert.equal(getAuthToken(storage), 'token-1')
  assert.equal(getStoredUsername(storage), 'admin')
  assert.deepEqual(getStoredRoles(storage), ['ROLE_ADMIN', 'ROLE_DISPATCHER'])

  clearAuthSession(storage)

  assert.equal(getAuthToken(storage), null)
  assert.equal(getStoredUsername(storage), null)
  assert.deepEqual(getStoredRoles(storage), [])
})

test('checks role permissions with ROLE_ prefixed and plain role names', () => {
  assert.equal(hasAnyRole(['ROLE_ADMIN'], ['ADMIN']), true)
  assert.equal(hasAnyRole(['DISPATCHER'], ['ROLE_ADMIN', 'ROLE_DISPATCHER']), true)
  assert.equal(hasAnyRole(['ROLE_VIEWER'], ['ADMIN', 'DISPATCHER']), false)
  assert.equal(hasAnyRole(['ROLE_VIEWER'], []), true)
})
