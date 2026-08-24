import axios from 'axios'
import { env } from '../config/env.js'
import { sessionStore } from '../utils/sessionStore.js'

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields ?? null
  }
}

const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const session = sessionStore.getSession()
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status ?? 0
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'The request failed. Please try again.'

    if (status === 401) {
      sessionStore.clearSession()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    // Backend validation errors arrive as an `errors` array
    // (backend/src/middleware/error.middleware.js); keep reading `fields`
    // for compatibility with older mock/dev payloads.
    const fields =
      error?.response?.data?.errors ?? error?.response?.data?.fields ?? null

    return Promise.reject(new ApiError(message, status, fields))
  }
)

export default http
