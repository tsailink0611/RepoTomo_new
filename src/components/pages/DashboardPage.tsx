import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const isManager = user?.staff?.role === 'MANAGER' || user?.staff?.role === 'ADMIN'
  
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          ダッシュボード
        </h2>
        <p className="text-gray-600 mb-4">
          ようこそ、{user?.staff?.name || user?.email} さん
        </p>
        <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded mb-6">
          🛡️ このページは認証が必要です
        </div>
        <p className="text-gray-600 mb-6">
          役職: {user?.staff?.role || 'STAFF'}
        </p>
        <div className="space-y-3">
          {isManager ? (
            <Link 
              to="/admin/dashboard" 
              className="block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition"
            >
              管理者ダッシュボードへ
            </Link>
          ) : (
            <Link 
              to="/staff/dashboard" 
              className="block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
            >
              スタッフダッシュボードへ
            </Link>
          )}
          <Link 
            to="/" 
            className="block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}