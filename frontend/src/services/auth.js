export const AUTH_TOKEN_KEY = 'smart-harvester-token'
export const AUTH_USERNAME_KEY = 'smart-harvester-username'
export const AUTH_ROLES_KEY = 'smart-harvester-roles'

function getStorage(storage = globalThis.localStorage) {
  try {
    return storage || null
  } catch {
    return null
  }
}

function readJsonArray(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getAuthToken(storage) {
  return getStorage(storage)?.getItem(AUTH_TOKEN_KEY) || null
}

export function getStoredUsername(storage) {
  return getStorage(storage)?.getItem(AUTH_USERNAME_KEY) || null
}

export function getStoredRoles(storage) {
  return readJsonArray(getStorage(storage)?.getItem(AUTH_ROLES_KEY))
}

export function setAuthSession(session, storage) {
  const target = getStorage(storage)
  if (!target) return
  target.setItem(AUTH_TOKEN_KEY, session.accessToken || '')
  target.setItem(AUTH_USERNAME_KEY, session.username || '')
  target.setItem(AUTH_ROLES_KEY, JSON.stringify(session.roles || []))
}

export function clearAuthSession(storage) {
  const target = getStorage(storage)
  if (!target) return
  target.removeItem(AUTH_TOKEN_KEY)
  target.removeItem(AUTH_USERNAME_KEY)
  target.removeItem(AUTH_ROLES_KEY)
}

function normalizeRole(role) {
  if (!role) return ''
  const upper = String(role).toUpperCase()
  return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`
}

export function hasAnyRole(userRoles = [], allowedRoles = []) {
  if (!allowedRoles.length) return true
  const normalizedUserRoles = userRoles.map(normalizeRole)
  return allowedRoles.map(normalizeRole).some(role => normalizedUserRoles.includes(role))
}
