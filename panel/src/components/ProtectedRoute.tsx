import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { getAccessToken } from '@/services/tokenStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()
  const token = typeof window !== 'undefined' ? getAccessToken() : null

  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
