import axios from 'axios'
import { getAccessToken } from './tokenStore'

const getApiUrl = () => {
  // If VITE_API_URL is set, normalize it to use current page protocol
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL
    // Replace http:// or https:// with current protocol to avoid mixed content
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    return url.replace(/^https?:/, protocol.slice(0, -1))
  }
  
  // Otherwise use relative URL (will use current page protocol)
  return '/api/v1'
}

const API_URL = getApiUrl()
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
