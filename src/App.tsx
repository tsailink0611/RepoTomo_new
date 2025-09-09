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

function SimpleAdminDashboard() {
  const { user, logout } = useAuth()
  const { getSubmissionStats, getRecentSubmissions, reportTemplates } = useReports()
  const { sendQuestionResponse, sendSystemNotification, notifications, getUnreadCount, markAsRead } = useNotifications()
  const { sendReminders, sendTestReminder } = useReminders()
  const { sendLINEReminder } = useLINE() // hookをトップレベルで呼び出し
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTemplateManagement, setShowTemplateManagement] = useState(false)
  const [showStaffManagement, setShowStaffManagement] = useState(false)
  const [showStaffRoles, setShowStaffRoles] = useState(false)
  const [showLINESettings, setShowLINESettings] = useState(false)
  const [showSystemNotification, setShowSystemNotification] = useState(false)
  
  const stats = getSubmissionStats()
  const recentSubmissions = getRecentSubmissions(5)

  // LINEリマインダー送信
  const handleSendLINEReminders = async () => {
    try {
      const result = await sendLINEReminder('', 'daily') // 日報のリマインダーを送信
      alert(`LINEリマインダーを送信しました！\n送信: ${result?.summary?.sent || 0}件\nスキップ: ${result?.summary?.skipped || 0}件`)
    } catch (error) {
      console.error('LINEリマインダー送信エラー:', error)
      alert(`LINEリマインダーの送信に失敗しました: ${error?.message || 'Unknown error'}`)
    }
  }

  // 質問回答
  const handleQuestionResponse = (submission: any) => {
    const response = prompt(`${submission.userName}さんの${submission.reportName}への回答を入力してください：`)
    if (response) {
      sendQuestionResponse(submission.reportName, response, submission.userId, submission.userName)
      alert('回答を送信しました！')
    }
  }
  
  return (
    <div className="min-h-screen bg-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-xl md:text-2xl font-bold text-purple-600 hover:text-purple-700">🎉 RepoTomo</Link>
              <span className="ml-2 md:ml-4 text-gray-600 text-sm md:text-base">管理者ダッシュボード</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* 通知ベル */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-800 relative"
                >
                  🔔
                  {getUnreadCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getUnreadCount()}
                    </span>
                  )}
                </button>
                
                {/* 通知ドロップダウン */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800">通知 ({getUnreadCount()}件未読)</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        通知はありません
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.slice(0, 10).map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <div className="text-sm font-medium text-gray-800">{notif.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleString('ja-JP')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <span className="text-sm text-gray-600">
                管理者: {user?.staff?.name || user?.email} さん
              </span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計情報 */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.todayCompleted}</div>
              <p className="text-gray-600">本日の完了提出</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.todayQuestions}</div>
              <p className="text-gray-600">本日の質問</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.todayPartial}</div>
              <p className="text-gray-600">一部完了</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.todayTotal}</div>
              <p className="text-gray-600">本日の総提出数</p>
            </div>
          </div>
        </div>

        {/* 優先対応エリア */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🚨 優先対応が必要な項目
          </h2>
          {stats.todayQuestions > 0 || stats.todayExtension > 0 ? (
            <div className="space-y-3">
              {recentSubmissions
                .filter(sub => sub.status === '質問あり' || sub.status === '延長希望')
                .slice(0, 5)
                .map((submission) => (
                  <div key={submission.id} className={`flex items-center justify-between p-3 rounded ${
                    submission.status === '延長希望' ? 'bg-purple-50' : 'bg-yellow-50'
                  }`}>
                    <div className="flex items-center">
                      <span className={`mr-3 ${
                        submission.status === '延長希望' ? 'text-purple-500' : 'text-yellow-500'
                      }`}>
                        {submission.status === '延長希望' ? '⏰' : '❓'}
                      </span>
                      <div>
                        <span className="font-medium">{submission.userName}</span>
                        <span className="text-gray-600 ml-2">
                          {submission.reportName} - {submission.status}
                        </span>
                        {submission.message && (
                          <p className="text-sm text-gray-500 mt-1">{submission.message}</p>
                        )}
                        {submission.documentUrl && (
                          <div className="flex items-center mt-2">
                            <span className="text-blue-500 mr-2">📎</span>
                            <a 
                              href={submission.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              添付ファイルを確認
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleQuestionResponse(submission)}
                      className={`px-4 py-1 rounded text-sm transition text-white ${
                        submission.status === '延長希望' 
                          ? 'bg-purple-500 hover:bg-purple-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      対応する
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              現在、優先対応が必要な項目はありません
            </p>
          )}
        </div>

        {/* 最近の提出履歴 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📋 最近の提出履歴
          </h2>
          {recentSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">スタッフ</th>
                    <th className="text-left py-2">報告書</th>
                    <th className="text-left py-2">状態</th>
                    <th className="text-left py-2">提出時刻</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{submission.userName}</td>
                      <td className="py-2">{submission.reportName}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          submission.status === '提出完了' 
                            ? 'bg-green-100 text-green-800'
                            : submission.status === '質問あり'
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === '一部完了'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {submission.status === '提出完了' && '✅ '}
                          {submission.status === '質問あり' && '❓ '}
                          {submission.status === '一部完了' && '🔄 '}
                          {submission.status === '延長希望' && '⏰ '}
                          {submission.status}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-600">
                        {new Date(submission.submittedAt).toLocaleString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              まだ提出履歴がありません
            </p>
          )}
        </div>

        {/* 管理機能 */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📊 報告書テンプレート管理</h3>
            <button 
              onClick={() => setShowTemplateManagement(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition mb-2"
            >
              テンプレートを編集
            </button>
            <button 
              onClick={() => setShowNewReportModal(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
            >
              新規報告書を追加
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">👥 スタッフ管理</h3>
            <button 
              onClick={() => setShowStaffManagement(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition mb-2"
            >
              スタッフ一覧
            </button>
            <button 
              onClick={() => setShowStaffRoles(true)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
            >
              権限設定
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📢 LINE通知管理</h3>
            <button 
              onClick={handleSendLINEReminders}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition mb-2"
            >
              📅 LINE リマインダー送信
            </button>
            <button 
              onClick={() => setShowLINESettings(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition mb-2"
            >
              📱 LINE設定管理
            </button>
            <button 
              onClick={() => setShowSystemNotification(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            >
              📢 システム通知
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📊 システム統計</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">総スタッフ数</span>
                <span className="font-semibold">{reportTemplates.length} 人</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">アクティブテンプレート</span>
                <span className="font-semibold">{reportTemplates.filter(t => t.is_active).length} 個</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">今月の総提出数</span>
                <span className="font-semibold">{stats.totalSubmissions} 件</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 新規報告書作成モーダル */}
      {showNewReportModal && (
        <NewReportModal onClose={() => setShowNewReportModal(false)} />
      )}
      
      {/* テンプレート管理モーダル */}
      {showTemplateManagement && (
        <TemplateManagementModal onClose={() => setShowTemplateManagement(false)} />
      )}
      
      {/* スタッフ管理モーダル */}
      {showStaffManagement && (
        <StaffManagementModal onClose={() => setShowStaffManagement(false)} />
      )}
      
      {/* スタッフ権限設定モーダル */}
      {showStaffRoles && (
        <StaffRolesModal onClose={() => setShowStaffRoles(false)} />
      )}
      
      {/* LINE設定管理モーダル */}
      {showLINESettings && (
        <LINESettingsModal onClose={() => setShowLINESettings(false)} />
      )}
      
      {/* システム通知モーダル */}
      {showSystemNotification && (
        <SystemNotificationModal onClose={() => setShowSystemNotification(false)} />
      )}
    </div>
  )
}

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

// 報告書提出モーダル
function ReportSubmissionModal({ 
  reportName, 
  onClose 
}: { 
  reportName: string
  onClose: () => void 
}) {
  const { user } = useAuth()
  const { addReportSubmission, reportTemplates } = useReports()
  const { addNotification } = useNotifications()
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [message, setMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    setShowDetails(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(files)
    console.log('選択されたファイル:', files.map(f => f.name))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles(files)
    console.log('ドロップされたファイル:', files.map(f => f.name))
  }

  const uploadFilesToSupabase = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []
    
    setIsUploading(true)
    const uploadedUrls: string[] = []
    
    try {
      console.log('=== ファイルアップロード開始 ===')
      console.log('ユーザーID:', user?.id)
      console.log('ファイル数:', files.length)
      
      for (const file of files) {
        console.log(`アップロード中: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
        
        // ファイルサイズチェック (10MB制限)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`ファイル "${file.name}" が大きすぎます (10MB以下にしてください)`)
        }
        
        // ファイル名をユニークにする
        const timestamp = Date.now()
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${timestamp}_${cleanFileName}`
        const filePath = `submissions/${user?.id}/${fileName}`
        
        console.log('アップロード先パス:', filePath)
        
        // Supabase Storageにアップロード
        const { data, error } = await supabase.storage
          .from('report-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          console.error('Supabaseアップロードエラー:', error)
          console.error('エラー詳細:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error.error
          })
          throw new Error(`アップロード失敗: ${error.message}`)
        }
        
        console.log('Supabaseアップロード成功:', data)
        
        // 公開URLを取得
        const { data: publicUrl } = supabase.storage
          .from('report-files')
          .getPublicUrl(filePath)
        
        uploadedUrls.push(publicUrl.publicUrl)
        console.log('公開URL取得成功:', publicUrl.publicUrl)
      }
      
      console.log('=== 全ファイルアップロード完了 ===')
      return uploadedUrls
    } catch (error) {
      console.error('=== ファイルアップロード失敗 ===')
      console.error('エラー詳細:', error)
      alert(`ファイルのアップロードに失敗しました: ${error.message}`)
      return []
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      console.log('=== 提出処理開始 ===')
      console.log('reportName:', reportName)
      console.log('selectedAction:', selectedAction)
      console.log('user:', user)
      console.log('reportTemplates:', reportTemplates)
      
      // ファイルをアップロード
      let fileUrls: string[] = []
      if (uploadedFiles.length > 0) {
        console.log('ファイルアップロード開始...')
        fileUrls = await uploadFilesToSupabase(uploadedFiles)
        console.log('アップロードされたファイルURL:', fileUrls)
      }
      
      // 状態を英語のenumに変換
      const statusMap: Record<string, 'completed' | 'has_question' | 'partial' | 'extension_requested'> = {
        '提出完了': 'completed',
        '質問あり': 'has_question', 
        '一部完了': 'partial',
        '延長希望': 'extension_requested'
      }

      // 報告書テンプレートをIDで検索（報告書名から）
      const template = reportTemplates.find(t => t.name === reportName)
      console.log('見つかったテンプレート:', template)
      
      if (!template) {
        console.error('テンプレートが見つかりません。reportName:', reportName)
        console.error('利用可能なテンプレート:', reportTemplates.map(t => t.name))
        throw new Error('報告書テンプレートが見つかりません')
      }

      // 添付ファイルのURLを含める
      const allDocumentUrls = [
        ...(documentUrl ? [documentUrl] : []),
        ...fileUrls
      ].filter(Boolean)

      const submissionData = {
        report_id: template.id,
        status: statusMap[selectedAction],
        document_url: allDocumentUrls.length > 0 ? allDocumentUrls.join(',') : undefined,
        message: message || undefined,
        has_question: selectedAction === '質問あり',
        file_urls: fileUrls.length > 0 ? fileUrls : undefined
      }
      console.log('提出データ:', submissionData)

      const submission = await addReportSubmission(submissionData)
      console.log('提出成功:', submission)
      
      // 管理者に通知を送信
      const staffName = user?.staff?.name || user?.email || '匿名ユーザー'
      const notificationMessage = selectedAction === '質問あり' 
        ? `${staffName}さんから「${reportName}」について質問があります。メッセージ: ${message}`
        : `${staffName}さんから「${reportName}」が提出されました（${selectedAction}）`

      addNotification({
        title: selectedAction === '質問あり' ? '❓ 質問が届きました' : '📝 新しい報告書提出',
        message: notificationMessage,
        type: selectedAction === '質問あり' ? 'question' : 'reminder',
        reportName,
        targetUserName: staffName
      })
      
      alert(`${reportName}の${selectedAction}を記録しました！管理者に通知も送信されました。`)
      console.log('提出記録完了:', submission)
      onClose()
    } catch (error) {
      console.error('=== 提出エラー詳細 ===')
      console.error('エラー:', error)
      console.error('エラーメッセージ:', error.message)
      console.error('エラー全体:', JSON.stringify(error, null, 2))
      alert(`提出の記録に失敗しました。エラー: ${error.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{reportName}の提出</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">状況を選択してください：</p>
              
              <button 
                onClick={() => handleActionSelect('提出完了')}
                className="w-full p-6 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="text-lg font-semibold text-green-700">提出完了</div>
                <div className="text-sm text-gray-600 mt-1">報告書の作成・提出が完了しました</div>
              </button>

              <button 
                onClick={() => handleActionSelect('質問あり')}
                className="w-full p-6 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">❓</div>
                <div className="text-lg font-semibold text-yellow-700">質問あり</div>
                <div className="text-sm text-gray-600 mt-1">不明点があります</div>
              </button>

              <button 
                onClick={() => handleActionSelect('一部完了')}
                className="w-full p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">🔄</div>
                <div className="text-lg font-semibold text-blue-700">一部完了</div>
                <div className="text-sm text-gray-600 mt-1">作業中・部分的に完了</div>
              </button>

              <button 
                onClick={() => handleActionSelect('延長希望')}
                className="w-full p-6 bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-lg font-semibold text-purple-700">延長希望</div>
                <div className="text-sm text-gray-600 mt-1">期限の延長を申請します</div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">選択した状態：</p>
                <p className="text-lg font-semibold">{selectedAction}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  報告書URL（任意）
                </label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ（任意）
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="補足説明があれば記入してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  添付ファイル（任意）
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    id="file-upload" 
                    multiple 
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-500">
                      <div className="text-3xl mb-2">📎</div>
                      <p>クリックしてファイルを選択</p>
                      <p className="text-xs mt-1">または、ここにファイルをドラッグ&ドロップ</p>
                      <p className="text-xs">PDF, Excel, Word, 画像など</p>
                    </div>
                  </label>
                  
                  {/* 選択されたファイルの表示 */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-sm font-medium text-gray-700 mb-1">選択されたファイル:</p>
                      <ul className="text-sm text-gray-600">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span>📄</span>
                            <span>{file.name}</span>
                            <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? 'アップロード中...' : '送信'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SimpleStaffDashboard() {
  const { user, logout } = useAuth()
  const { reportTemplates, isLoading, getRecentSubmissions } = useReports()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  
  // 現在のユーザーの提出履歴を取得
  const userSubmissions = getRecentSubmissions(10).filter(
    submission => submission.userId === user?.id
  )
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">報告書を読み込み中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-orange-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700">🎉 RepoTomo</Link>
              <span className="ml-4 text-gray-600">スタッフダッシュボード</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                こんにちは、{user?.staff?.name || user?.email} さん！
              </span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ウェルカムメッセージ */}
        <div className="mb-8 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            今日もお疲れさまです！😊
          </h2>
          <p className="text-gray-600 text-center">
            報告書の提出は「期限は目安」です。余裕があるときにお願いします。
          </p>
        </div>

        {/* 報告書一覧 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportTemplates
            .filter(template => template.is_active)
            .map((template) => (
              <div key={template.id} className={`rounded-lg shadow p-6 hover:shadow-xl transition ${
                template.category === 'special' 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200' 
                  : 'bg-white'
              }`}>
                <div className="text-center">
                  <div className="text-4xl mb-4">{template.emoji}</div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    template.category === 'special' ? 'text-purple-700' : ''
                  }`}>
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <div className={`text-xs mb-2 ${
                    template.frequency === 'custom' 
                      ? template.category === 'special' ? 'text-purple-600' : 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                    {template.deadline}
                  </div>
                  <button 
                    onClick={() => setSelectedReport(template.name)}
                    className={`w-full px-4 py-2 rounded transition text-white ${
                      template.category === 'special' 
                        ? 'bg-purple-500 hover:bg-purple-600' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    提出する
                  </button>
                </div>
              </div>
            ))
          }
        </div>

        {/* 提出履歴 */}
        {userSubmissions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📊 あなたの提出履歴
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userSubmissions.slice(0, 6).map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{submission.reportName}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      submission.status === '提出完了' 
                        ? 'bg-green-100 text-green-800'
                        : submission.status === '質問あり'
                        ? 'bg-yellow-100 text-yellow-800'
                        : submission.status === '一部完了'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {submission.status === '提出完了' && '✅'}
                      {submission.status === '質問あり' && '❓'}
                      {submission.status === '一部完了' && '🔄'}
                      {submission.status === '延長希望' && '⏰'}
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(submission.submittedAt).toLocaleString('ja-JP')}
                  </p>
                  {submission.message && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded p-2 mt-2">
                      💬 {submission.message}
                    </p>
                  )}
                  {submission.documentUrl && (
                    <a 
                      href={submission.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                    >
                      🔗 添付ファイルを開く
                    </a>
                  )}
                </div>
              ))}
            </div>
            {userSubmissions.length > 6 && (
              <p className="text-center text-gray-500 text-sm mt-4">
                その他 {userSubmissions.length - 6} 件の履歴があります
              </p>
            )}
          </div>
        )}
      </main>

      {/* 報告書提出モーダル */}
      {selectedReport && (
        <ReportSubmissionModal
          reportName={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  )
}

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

// シンプルなスタッフ専用ページ
function SimpleStaffPage() {
  const { reportTemplates, isLoading } = useReports()
  const { isAuthenticated, loginAsStaff } = useAuth()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated)

  // 認証処理
  const handleStaffAuth = async () => {
    const staffId = prompt('スタッフIDを入力してください：')
    if (staffId) {
      try {
        await loginAsStaff(staffId)
        setShowAuthModal(false)
      } catch (error) {
        alert('ログインに失敗しました。正しいスタッフIDを入力してください。')
        console.error('Staff login error:', error)
      }
    }
  }

  // 認証モーダル
  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            スタッフ認証
          </h2>
          <p className="text-gray-600 mb-6">
            報告書提出には認証が必要です。<br/>
            スタッフIDを入力してください。
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleStaffAuth}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              スタッフIDで認証
            </button>
            <Link 
              to="/" 
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* シンプルヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link 
              to="/"
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              ← ホームに戻る
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-orange-600">
                🎉 RepoTomo - スタッフ用
              </h1>
              <p className="text-gray-600 mt-2">
                報告書を提出してください。お疲れさまです！
              </p>
            </div>
            <div className="w-24"></div> {/* 右側のスペース確保 */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 励ましメッセージ */}
        <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            今日もお疲れさまです！😊
          </h2>
          <p className="text-gray-600">
            期限は目安です。余裕があるときに提出してください。
          </p>
        </div>

        {/* 報告書一覧（シンプル版） */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportTemplates
            .filter(template => template.is_active)
            .map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="text-center">
                  <div className="text-4xl mb-3">{template.emoji}</div>
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  <div className="text-xs text-blue-600 mb-4">{template.deadline}</div>
                  <button 
                    onClick={() => setSelectedReport(template.name)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition"
                  >
                    提出する
                  </button>
                </div>
              </div>
            ))
          }
        </div>

        {/* フッター */}
        <div className="text-center mt-12 text-gray-500">
          <p>困ったときは管理者にお声がけください</p>
        </div>
      </main>

      {/* 報告書提出モーダル */}
      {selectedReport && (
        <ReportSubmissionModal
          reportName={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  )
}

export default App