import { hasAnyRole } from './auth.js'

export const ROLE_ADMIN = 'ROLE_ADMIN'
export const ROLE_DISPATCHER = 'ROLE_DISPATCHER'
export const ROLE_DRIVER = 'ROLE_DRIVER'
export const ROLE_VIEWER = 'ROLE_VIEWER'

export const ROUTE_PERMISSIONS = {
  '/': [],
  '/dashboard': [],
  '/machines': [ROLE_ADMIN, ROLE_DISPATCHER, ROLE_DRIVER, ROLE_VIEWER],
  '/tasks': [ROLE_ADMIN, ROLE_DISPATCHER, ROLE_DRIVER, ROLE_VIEWER],
  '/monitor': [ROLE_ADMIN, ROLE_DISPATCHER, ROLE_DRIVER],
  '/vision': [ROLE_ADMIN, ROLE_DISPATCHER, ROLE_VIEWER],
  '/sensors': [ROLE_ADMIN, ROLE_DISPATCHER, ROLE_DRIVER, ROLE_VIEWER],
  '/simulator': [ROLE_ADMIN, ROLE_DISPATCHER],
  '/reports': [ROLE_ADMIN, ROLE_DISPATCHER, ROLE_VIEWER],
  '/admin': [ROLE_ADMIN]
}

export const ACTION_PERMISSIONS = {
  'machine:create': [ROLE_ADMIN, ROLE_DISPATCHER],
  'machine:update': [ROLE_ADMIN, ROLE_DISPATCHER],
  'machine:delete': [ROLE_ADMIN],
  'machine:status': [ROLE_ADMIN, ROLE_DISPATCHER],
  'task:create': [ROLE_ADMIN, ROLE_DISPATCHER],
  'task:update': [ROLE_ADMIN, ROLE_DISPATCHER],
  'task:delete': [ROLE_ADMIN],
  'task:progress': [ROLE_ADMIN, ROLE_DISPATCHER, ROLE_DRIVER],
  'sensor:create': [ROLE_ADMIN, ROLE_DRIVER],
  'control:send': [ROLE_ADMIN, ROLE_DISPATCHER]
}

export function canAccessRoute(path, roles = []) {
  return hasAnyRole(roles, ROUTE_PERMISSIONS[path] || [])
}

export function canPerform(action, roles = []) {
  return hasAnyRole(roles, ACTION_PERMISSIONS[action] || [])
}
