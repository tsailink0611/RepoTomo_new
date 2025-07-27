import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

function HomePage() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          🎉 React Router テスト
        </h1>
        <p className="text-center text-gray-600 mb-4">
          useAuth無し、Question型無し
        </p>
        <div className="flex flex-col space-y-3">
          <Link to="/test" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-center">
            テストページへ
          </Link>
          <Link to="/login" className="bg-secondary hover:bg-secondary/90 text-gray-800 px-6 py-2 rounded-lg text-center">
            ログインページへ
          </Link>
        </div>
      </div>
    </div>
  )
}

function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-600">テストページ</h1>
        <p className="text-center text-gray-600 mb-4">React Router 動作中</p>
        <Link to="/" className="block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-center">
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}

function LoginPage() {
  const { isAuthenticated, user, loginAsStaff } = useAuth()
  
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4 text-green-600">ログイン成功</h1>
          <p className="text-center text-gray-600 mb-4">ようこそ {user?.staff?.name} さん</p>
          <Link to="/" className="block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-center">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4 text-green-600">useAuth テスト</h1>
        <p className="text-center text-gray-600 mb-6">Question型依存無し</p>
        <div className="space-y-3">
          <button 
            onClick={() => loginAsStaff('1')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            スタッフとしてログイン
          </button>
          <button 
            onClick={() => loginAsStaff('2')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            管理者としてログイン
          </button>
          <Link to="/" className="block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-center">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}
