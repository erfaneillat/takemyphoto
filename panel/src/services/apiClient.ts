import axios from 'axios'
import { getAccessToken } from './tokenStore'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

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
        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
