export function getRuntimeConfig(env = {}) {
  const backendTarget = env.VITE_BACKEND_TARGET || 'http://localhost:8086'
  const apiMode = env.VITE_API_MODE || 'real'
  const production = env.PROD === true || env.MODE === 'production'

  if (production && apiMode === 'mock') {
    throw new Error('Mock mode is not allowed for production builds')
  }

  return {
    apiBaseURL: env.VITE_API_BASE_URL || '',
    backendTarget,
    websocketURL: env.VITE_WS_URL || backendTarget.replace(/^http/, 'ws') + '/ws',
    apiMode,
    mockEnabled: apiMode === 'mock'
  }
}

export const runtimeConfig = getRuntimeConfig(import.meta.env)
