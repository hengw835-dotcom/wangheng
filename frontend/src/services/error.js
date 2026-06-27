const STATUS_MESSAGES = {
  401: '登录已失效，请重新登录',
  403: '当前账号权限不足',
  429: '请求过于频繁，请稍后再试'
}

export function normalizeApiError(error) {
  const response = error?.response
  const status = response?.status
  const data = response?.data || {}
  const responseHeaders = response?.headers || {}
  const requestHeaders = error?.config?.headers || {}
  const requestId =
    responseHeaders['x-request-id'] ||
    responseHeaders['X-Request-Id'] ||
    requestHeaders['X-Request-Id'] ||
    requestHeaders['x-request-id']

  return {
    status,
    code: data.code || data.error || (status ? `HTTP_${status}` : 'UNKNOWN_ERROR'),
    message: STATUS_MESSAGES[status] || data.message || data.error || error?.message || '请求失败',
    timestamp: data.timestamp,
    requestId
  }
}

export function describeApiError(error) {
  return normalizeApiError(error).message
}
