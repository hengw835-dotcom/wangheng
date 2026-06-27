import axios from 'axios'

import { runtimeConfig } from '../config/runtime.js'
import { clearAuthSession, getAuthToken } from './auth.js'
import {
  REQUEST_ID_HEADER,
  createRequestController,
  createRequestId,
  shouldAttachAuthToken,
  unwrapApiResponse
} from './request.js'

export { REQUEST_ID_HEADER, createRequestController, createRequestId, shouldAttachAuthToken, unwrapApiResponse }

export const apiClient = axios.create({
  baseURL: runtimeConfig.apiBaseURL,
  timeout: 15000
})

export function installHttpInterceptors(client = apiClient) {
  client.interceptors.request.use(config => {
    const token = getAuthToken()
    config.headers = config.headers || {}
    if (token && shouldAttachAuthToken(config.url)) config.headers.Authorization = `Bearer ${token}`
    if (!config.headers[REQUEST_ID_HEADER]) config.headers[REQUEST_ID_HEADER] = createRequestId()
    if (!config.headers.Accept) config.headers.Accept = 'application/json'
    return config
  })

  client.interceptors.response.use(
    response => response,
    error => {
      const isLoginRequest = error.config?.url?.includes('/api/auth/token') || error.config?.url?.includes('/auth/token')
      if (error.response?.status === 401 && !isLoginRequest) {
        clearAuthSession()
        if (typeof window !== 'undefined' && window?.location) window.location.reload()
      }
      return Promise.reject(error)
    }
  )
}
