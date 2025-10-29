import axios from 'axios'
import { getAccessToken } from './tokenStore'

const resolveApiBase = () => {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  // Prefer explicit env if provided
  if (raw) {
    // If page is https but env uses http, upgrade to https to avoid mixed content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && raw.startsWith('http://')) {
      try {
        const u = new URL(raw)
        u.protocol = 'https:'
        let upgraded = u.toString()
        // If points to /api without version, append /v1
        if (upgraded.endsWith('/api')) upgraded += '/v1'
        if (upgraded.endsWith('/api/')) upgraded += 'v1'
        return upgraded
      } catch {
        // fall through to raw
      }
    }
    let url = raw
    // If points to /api without version, append /v1
    if (url.endsWith('/api')) url += '/v1'
    if (url.endsWith('/api/')) url += 'v1'
    return url
  }
  // Default to same-origin relative path
  return '/api/v1'
}

const API_URL = resolveApiBase()
const PANEL_BASE = import.meta.env.BASE_URL || '/'

export const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const msg = error?.response?.data?.error || error?.response?.data?.message
      const shouldLogout = msg === 'No token provided' || msg === 'Invalid or expired token'
      const method = (error?.config?.method || '').toLowerCase()
      const isRead = method === 'get'
      if (shouldLogout && isRead) {
        try {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        } catch {}
        const targetLogin = `${PANEL_BASE}login`
        if (window.location.pathname !== targetLogin) {
          window.location.replace(targetLogin)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
