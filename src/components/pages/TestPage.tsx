import { Link } from 'react-router-dom'

export function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          テストページ
        </h2>
        <p className="text-gray-600 mb-6">
          React Routerが正常に動作しています
        </p>
        <Link 
          to="/" 
          className="block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}