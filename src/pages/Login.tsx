import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginAsStaff } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
    } catch (error) {
      console.error('ログインエラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'staff' | 'manager') => {
    setIsLoading(true)
    try {
      if (role === 'staff') {
        await loginAsStaff('1')
      } else {
        await loginAsStaff('2')
      }
    } catch (error) {
      console.error('デモログインエラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">🎉 RepoTomo</h1>
          <p className="text-gray-600">心理的安全性重視の報告書管理システム</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="example@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
            >
              ログイン
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">デモアカウント</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('staff')}
                isLoading={isLoading}
                className="w-full"
              >
                👤 スタッフ
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('manager')}
                isLoading={isLoading}
                className="w-full"
              >
                👔 管理者
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 RepoTomo - AI駆動開発による心理的安全性重視システム
          </p>
        </div>
      </div>
    </div>
  )
}