export const REQUEST_ID_HEADER = 'X-Request-Id'

export function createRequestId() {
  if (globalThis.crypto?.randomUUID) {
    return `req-${globalThis.crypto.randomUUID()}`
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function unwrapApiResponse(response) {
  return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response
}

export function createRequestController() {
  if (typeof AbortController === 'undefined') {
    return { signal: undefined, abort() {} }
  }
  return new AbortController()
}

export function shouldAttachAuthToken(url = '') {
  const normalized = String(url)
  return !normalized.endsWith('/auth/token') && !normalized.includes('/auth/token?')
}
