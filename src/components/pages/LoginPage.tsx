import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
  const { isAuthenticated, user, loginAsStaff } = useAuth()
  
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            ログイン済み
          </h2>
          <p className="text-gray-600 mb-6">
            ようこそ {user?.staff?.name || user?.email} さん
          </p>
          <Link 
            to="/" 
            className="block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          ログインページ
        </h2>
        <p className="text-gray-600 mb-6">
          テスト用アカウントでログイン
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => {
              const staffId = prompt('スタッフIDを入力してください：')
              if (staffId) {
                // スタッフIDでログイン試行
                loginAsStaff(staffId).catch(error => {
                  alert('ログインに失敗しました。正しいスタッフIDを入力してください。')
                  console.error('Staff login error:', error)
                })
              }
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
          >
            スタッフとしてログイン
          </button>
          <button 
            onClick={() => {
              const password = prompt('管理者パスワードを入力してください：')
              if (password === '123456') {
                loginAsStaff('2')
              } else if (password !== null) {
                alert('パスワードが間違っています')
              }
            }}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition"
          >
            管理者としてログイン
          </button>
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