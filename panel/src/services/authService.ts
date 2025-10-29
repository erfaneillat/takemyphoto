import { apiClient } from './apiClient'
import { setAccessToken, setRefreshToken, clearTokens } from './tokenStore'

export interface Admin {
  id: string
  email: string
  name: string
}

export interface AdminLoginResponse {
  status: string
  data: {
    admin: Admin
    accessToken: string
    refreshToken: string
  }
}

export const authService = {
  adminLogin: async (email: string, password: string): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<AdminLoginResponse>('/auth/admin/login', {
      email,
      password,
    })
    
    if (response.data.data.accessToken) {
      setAccessToken(response.data.data.accessToken)
    }
    if (response.data.data.refreshToken) {
      setRefreshToken(response.data.data.refreshToken)
    }
    
    return response.data
  },

  logout: () => {
    clearTokens()
  },
}
