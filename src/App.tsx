import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { StaffDashboard } from './pages/staff/Dashboard'
import { AdminDashboard } from './pages/admin/Dashboard'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">アプリケーションを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* ログインページ */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login />
          } 
        />
        
        {/* メインダッシュボード（ロール別リダイレクト） */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {user?.staff?.role === 'MANAGER' || user?.staff?.role === 'ADMIN' ? 
                <Navigate to="/admin" replace /> : 
                <Navigate to="/staff" replace />
              }
            </ProtectedRoute>
          } 
        />
        
        {/* スタッフダッシュボード */}
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 管理者ダッシュボード */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireRole="MANAGER">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 404ページ */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-orange-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600">ページが見つかりません</p>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
