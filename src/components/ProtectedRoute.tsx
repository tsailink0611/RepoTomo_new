import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requireRole?: 'STAFF' | 'MANAGER' | 'ADMIN'
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requireRole && user?.staff?.role !== requireRole && user?.staff?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">アクセス権限がありません</h2>
          <p className="text-gray-600">このページにアクセスする権限がありません。</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}