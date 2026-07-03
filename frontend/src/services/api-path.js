import { runtimeConfig } from '../config/runtime.js'

export function apiPath(path, config = runtimeConfig) {
  const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${path || ''}`
  return config.apiBaseURL ? normalizedPath : `/api${normalizedPath}`
}
