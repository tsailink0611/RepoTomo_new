import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import React from 'react'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useReports } from './hooks/useReports'
import { useNotifications } from './hooks/useNotifications'
import { useReminders } from './hooks/useReminders'
import { useStaff } from './hooks/useStaff'
import { useLINE } from './hooks/useLINE'
import { supabase } from './lib/supabase'
import { PWAInstallPrompt, IOSInstallGuide } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import { SupabaseConnectionTest } from './components/SupabaseConnectionTest'
import { AdminLoginPage } from './components/pages/AdminLoginPage'
import { DashboardPage } from './components/pages/DashboardPage'
import { SystemNotificationModal } from './components/modals/SystemNotificationModal'
import { LINESettingsModal } from './components/modals/LINESettingsModal'
import { TemplateManagementModal } from './components/modals/TemplateManagementModal'
import { StaffRolesModal } from './components/modals/StaffRolesModal'
import { NewReportModal } from './components/modals/NewReportModal'
import { StaffManagementModal } from './components/modals/StaffManagementModal'
import { ReportSubmissionModal } from './components/modals/ReportSubmissionModal'
import { SimpleStaffDashboard } from './components/pages/SimpleStaffDashboard'
import { SimpleStaffPage } from './components/pages/SimpleStaffPage'
import { SimpleAdminDashboard } from './components/pages/SimpleAdminDashboard'

function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
      console.log('PWA install prompt captured')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log('Install prompt outcome:', outcome)
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="max-w-4xl w-full px-4">
        {/* インストールボタン（テスト用） */}
        {showInstallButton && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <button onClick={handleInstallClick} className="font-semibold">
              📱 アプリをインストール
            </button>
          </div>
        )}

        {/* メインタイトル */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-600 mb-4">
            🎉 RepoTomo
          </h1>
          <p className="text-xl text-gray-600">
            心理的安全性重視の報告書管理システム
          </p>
          
          {/* PWA情報表示（デバッグ用） */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Service Worker: {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? '✅ サポート' : '❌ 未サポート'}</p>
            <p>PWA Installable: {showInstallButton ? '✅ インストール可能' : '⏳ 待機中'}</p>
          </div>
          
          {/* 手動インストールボタン（テスト用） */}
          <div className="mt-6">
            <button 
              onClick={() => {
                if (deferredPrompt) {
                  handleInstallClick()
                } else {
                  alert('この機能はHTTPS環境または対応ブラウザで利用できます。\n\n手動でインストール:\n1. ブラウザメニュー（︙）\n2. 「アプリをインストール」または「ホーム画面に追加」')
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              📱 PWAアプリをインストール
            </button>
          </div>
        </div>

        {/* 入り口選択 */}
        <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
          {/* スタッフ用入り口 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-orange-600 mb-3">
                スタッフの方
              </h2>
              <p className="text-gray-600 mb-6">
                報告書の提出はこちらから<br/>
                お疲れさまです！
              </p>
              <Link 
                to="/staff"
                className="block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                報告書を提出する
              </Link>
            </div>
          </div>

          {/* 管理者用入り口 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-center">
              <div className="text-6xl mb-4">🛡️</div>
              <h2 className="text-2xl font-bold text-purple-600 mb-3">
                管理者の方
              </h2>
              <p className="text-gray-600 mb-6">
                管理ダッシュボード<br/>
                パスワードが必要です
              </p>
              <Link 
                to="/admin"
                className="block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                管理者ログイン
              </Link>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-12 text-gray-500">
          <p>困ったときはお気軽にお声がけください</p>
        </div>

        {/* Supabase接続テスト */}
        <SupabaseConnectionTest />
      </div>
    </div>
  )
}

// LoginPage component already EXTRACTED to src/components/pages/LoginPage.tsx - PHASE 2 COMPLETE
/*
function LoginPage() {
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
*/

function TestPage() {
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

// SimpleAdminDashboard → src/components/pages/SimpleAdminDashboard.tsx に移動済み (360行)

// テンプレート管理モーダル（管理者用） - EXTRACTED to src/components/modals/TemplateManagementModal.tsx

// スタッフ管理モーダル（管理者用） - EXTRACTED to src/components/modals/StaffManagementModal.tsx

// スタッフ権限設定モーダル（管理者用） - EXTRACTED to src/components/modals/StaffRolesModal.tsx

// LINE設定管理モーダル（管理者用） - EXTRACTED to src/components/modals/LINESettingsModal.tsx

// システム通知送信モーダル（管理者用） - EXTRACTED to src/components/modals/SystemNotificationModal.tsx
/*
function SystemNotificationModal({ onClose }: { onClose: () => void }) {
  const { sendSystemNotificationToLINE } = useLINE()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert('タイトルとメッセージを入力してください')
      return
    }

    setIsLoading(true)
    try {
      const result = await sendSystemNotificationToLINE(title, message)
      alert(`システム通知を送信しました！\n送信成功: ${result.sent}件\n送信失敗: ${result.failed}件`)
      setTitle('')
      setMessage('')
      onClose()
    } catch (error) {
      console.error('システム通知送信エラー:', error)
      alert(`システム通知の送信に失敗しました: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const presetMessages = [
    {
      title: '重要なお知らせ',
      message: 'システムメンテナンスのため、明日18:00-20:00の間、一時的にサービスを停止いたします。ご理解のほどよろしくお願いいたします。'
    },
    {
      title: '報告書提出のお願い',
      message: '月末の報告書提出期限が近づいております。まだ提出がお済みでない方は、お早めにご提出をお願いいたします。'
    },
    {
      title: '新機能のお知らせ',
      message: 'RepoTomoに新しい機能が追加されました。詳細は管理者までお問い合わせください。'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">システム通知送信</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                📢 この通知は、LINE連携済みのすべてのアクティブなスタッフに送信されます。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 重要なお知らせ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メッセージ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="通知する内容を入力してください..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プリセットメッセージ
              </label>
              <div className="grid gap-2">
                {presetMessages.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTitle(preset.title)
                      setMessage(preset.message)
                    }}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    disabled={isLoading}
                  >
                    <div className="font-medium text-sm">{preset.title}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">{preset.message}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              onClick={handleSend}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '送信中...' : '通知を送信'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
*/

// 新規報告書作成モーダル（管理者用） - EXTRACTED to src/components/modals/NewReportModal.tsx

// ReportSubmissionModal → src/components/modals/ReportSubmissionModal.tsx に移動済み (351行)

// SimpleStaffDashboard → src/components/pages/SimpleStaffDashboard.tsx に移動済み (165行)

// DashboardPage - EXTRACTED to src/components/pages/DashboardPage.tsx
/*
function DashboardPage() {
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
*/

function App() {
  return (
    <Router>
      <div>
        {/* オフラインインジケーター */}
        <OfflineIndicator />
        
        {/* PWAインストールプロンプト */}
        <PWAInstallPrompt />
        
        {/* iOS用インストールガイド */}
        <IOSInstallGuide />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/dashboard" 
            element={
              <ProtectedRoute>
                <SimpleStaffDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requireRole="MANAGER">
                <SimpleAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff" 
            element={<SimpleStaffPage />} 
          />
          <Route 
            path="/admin" 
            element={<AdminLoginPage />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

// 管理者専用ログインページ - EXTRACTED to src/components/pages/AdminLoginPage.tsx
/*
function AdminLoginPage() {
  const { loginAsStaff } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAdminLogin = async () => {
    if (password === '123456') {
      await loginAsStaff('2') // 管理者としてログイン
      navigate('/admin/dashboard')
    } else {
      setError('パスワードが間違っています')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-4">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            ← ホームに戻る
          </Link>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-purple-600 mb-2">
            🎉 RepoTomo
          </h2>
          <p className="text-xl font-semibold text-gray-800">管理者ログイン</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="パスワードを入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleAdminLogin}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  )
}
*/

// SimpleStaffPage → src/components/pages/SimpleStaffPage.tsx に移動済み (138行)

export default App