import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import React from 'react'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useReports } from './hooks/useReports'
import { useNotifications } from './hooks/useNotifications'
import { useReminders } from './hooks/useReminders'
import { useStaff } from './hooks/useStaff'
import { PWAInstallPrompt, IOSInstallGuide } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import { SupabaseConnectionTest } from './components/SupabaseConnectionTest'

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
            onClick={() => loginAsStaff('1')}
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
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTemplateManagement, setShowTemplateManagement] = useState(false)
  const [showStaffManagement, setShowStaffManagement] = useState(false)
  const [showStaffRoles, setShowStaffRoles] = useState(false)
  
  const stats = getSubmissionStats()
  const recentSubmissions = getRecentSubmissions(5)

  // 自動リマインダー送信
  const handleSendReminders = () => {
    const count = sendReminders()
    alert(`${count}件のリマインダーを送信しました！`)
  }

  // テストリマインダー送信
  const handleTestReminder = () => {
    sendTestReminder('日報')
    alert('テストリマインダーを送信しました！')
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
              <Link to="/" className="text-2xl font-bold text-purple-600 hover:text-purple-700">🎉 RepoTomo</Link>
              <span className="ml-4 text-gray-600">管理者ダッシュボード</span>
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
              onClick={handleSendReminders}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition mb-2"
            >
              📅 自動リマインダー送信
            </button>
            <button 
              onClick={handleTestReminder}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition mb-2"
            >
              📱 テストリマインダー
            </button>
            <button 
              onClick={() => {
                sendSystemNotification('重要なお知らせ', '明日はシステムメンテナンスを行います。')
                alert('システム通知を送信しました！')
              }}
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
    </div>
  )
}

// テンプレート管理モーダル（管理者用）
function TemplateManagementModal({ onClose }: { onClose: () => void }) {
  const { reportTemplates, updateReportTemplate, deleteReportTemplate } = useReports()
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editFrequency, setEditFrequency] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)

  const handleEditStart = (template: any) => {
    setEditingTemplate(template)
    setEditName(template.name)
    setEditDescription(template.description)
    setEditEmoji(template.emoji)
    setEditFrequency(template.frequency)
    setEditDeadline(template.deadline)
    setEditCategory(template.category)
    setEditIsActive(template.is_active)
  }

  const handleEditSave = async () => {
    if (!editingTemplate) return
    
    try {
      await updateReportTemplate(editingTemplate.id, {
        name: editName,
        description: editDescription,
        emoji: editEmoji,
        frequency: editFrequency,
        deadline: editDeadline,
        category: editCategory,
        is_active: editIsActive
      })
      
      alert('テンプレートを更新しました！')
      setEditingTemplate(null)
      window.location.reload()
    } catch (error) {
      console.error('更新エラー:', error)
      alert(`更新に失敗しました：${error.message}`)
    }
  }

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`「${templateName}」を削除しますか？この操作は取り消せません。`)) return
    
    try {
      await deleteReportTemplate(templateId)
      alert('テンプレートを削除しました')
      window.location.reload()
    } catch (error) {
      console.error('削除エラー:', error)
      alert(`削除に失敗しました：${error.message}`)
    }
  }

  const emojiOptions = ['📝', '📊', '📈', '📋', '💡', '🇳🇵', '🧽', '👥', '📅', '⚡', '🎯', '🔧', '📞', '🏆']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">テンプレート管理</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {editingTemplate ? (
            // 編集フォーム
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">「{editingTemplate.name}」を編集</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    報告書名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">説明文</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">絵文字</label>
                  <div className="grid grid-cols-7 gap-2">
                    {emojiOptions.map((emojiOption) => (
                      <button
                        key={emojiOption}
                        onClick={() => setEditEmoji(emojiOption)}
                        className={`p-2 text-xl rounded border-2 hover:bg-gray-50 transition ${
                          editEmoji === emojiOption ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        {emojiOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">頻度</label>
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                    <option value="biweekly">隔週</option>
                    <option value="custom">カスタム</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">締切</label>
                  <input
                    type="text"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="regular">定期報告</option>
                    <option value="special">特別報告</option>
                    <option value="training">研修・育成</option>
                    <option value="maintenance">点検・メンテナンス</option>
                    <option value="event">イベント・会議</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="mr-3"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  アクティブ（スタッフページに表示）
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                >
                  更新する
                </button>
              </div>
            </div>
          ) : (
            // テンプレート一覧
            <div className="space-y-4">
              <div className="grid gap-4">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{template.emoji}</div>
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <div className="text-xs text-blue-600 mt-1">{template.deadline}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          template.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {template.is_active ? 'アクティブ' : '非アクティブ'}
                        </span>
                        <button
                          onClick={() => handleEditStart(template)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(template.id, template.name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// スタッフ管理モーダル（管理者用）
function StaffManagementModal({ onClose }: { onClose: () => void }) {
  const { staff, addStaff, updateStaff, deleteStaff, toggleStaffActive, getStaffStats, isLoading } = useStaff()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [formData, setFormData] = useState({
    staff_id: '',
    name: '',
    email: '',
    role: 'STAFF' as 'STAFF' | 'MANAGER' | 'ADMIN',
    department: '',
    position: '',
    line_user_id: '',
    is_active: true
  })

  const stats = getStaffStats()

  const resetForm = () => {
    setFormData({
      staff_id: '',
      name: '',
      email: '',
      role: 'STAFF',
      department: '',
      position: '',
      line_user_id: '',
      is_active: true
    })
    setEditingStaff(null)
    setShowAddForm(false)
  }

  const handleAdd = () => {
    setShowAddForm(true)
    resetForm()
  }

  const handleEdit = (staffMember: any) => {
    setEditingStaff(staffMember)
    setFormData({
      staff_id: staffMember.staff_id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      department: staffMember.department || '',
      position: staffMember.position || '',
      line_user_id: staffMember.line_user_id || '',
      is_active: staffMember.is_active
    })
    setShowAddForm(true)
  }

  const handleSubmit = async () => {
    if (!formData.staff_id || !formData.name || !formData.email) {
      alert('必須項目を入力してください')
      return
    }

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData)
        alert('スタッフ情報を更新しました')
      } else {
        await addStaff(formData)
        alert('新しいスタッフを追加しました')
      }
      resetForm()
    } catch (error) {
      console.error('操作エラー:', error)
      alert(`操作に失敗しました：${error.message}`)
    }
  }

  const handleDelete = async (staffMember: any) => {
    if (!confirm(`${staffMember.name}さんを削除しますか？この操作は取り消せません。`)) return

    try {
      await deleteStaff(staffMember.id)
      alert('スタッフを削除しました')
    } catch (error) {
      console.error('削除エラー:', error)
      alert(`削除に失敗しました：${error.message}`)
    }
  }

  const handleToggleActive = async (staffMember: any) => {
    try {
      await toggleStaffActive(staffMember.id)
    } catch (error) {
      console.error('状態変更エラー:', error)
      alert(`状態変更に失敗しました：${error.message}`)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">スタッフ管理</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">総スタッフ数</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">アクティブ</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.managers}</div>
              <p className="text-sm text-gray-600">管理者</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
              <p className="text-sm text-gray-600">システム管理者</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.withLine}</div>
              <p className="text-sm text-gray-600">LINE連携済み</p>
            </div>
          </div>

          {showAddForm ? (
            // 追加/編集フォーム
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">
                {editingStaff ? `${editingStaff.name}さんの情報を編集` : '新しいスタッフを追加'}
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    スタッフID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.staff_id}
                    onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: 001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="田中太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="tanaka@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="STAFF">スタッフ</option>
                    <option value="MANAGER">管理者</option>
                    <option value="ADMIN">システム管理者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">部署</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="営業部"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">役職名</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="主任"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">LINE User ID</label>
                  <input
                    type="text"
                    value={formData.line_user_id}
                    onChange={(e) => setFormData({...formData, line_user_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="LINE連携時に自動設定されます"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActiveStaff"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-3"
                />
                <label htmlFor="isActiveStaff" className="text-sm font-medium text-gray-700">
                  アクティブ（システムを使用可能）
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                >
                  {editingStaff ? '更新する' : '追加する'}
                </button>
              </div>
            </div>
          ) : (
            // スタッフ一覧
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">スタッフ一覧</h3>
                <button
                  onClick={handleAdd}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  + 新しいスタッフを追加
                </button>
              </div>

              <div className="grid gap-4">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{staffMember.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(staffMember.role)}`}>
                              {staffMember.role}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              staffMember.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {staffMember.is_active ? 'アクティブ' : '非アクティブ'}
                            </span>
                            {staffMember.line_user_id && (
                              <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                                LINE連携済み
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {staffMember.staff_id} | {staffMember.email}
                          </div>
                          {staffMember.department && (
                            <div className="text-sm text-gray-500">
                              {staffMember.department} {staffMember.position && `・ ${staffMember.position}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(staffMember)}
                          className={`px-3 py-1 rounded text-sm transition ${
                            staffMember.is_active
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {staffMember.is_active ? '無効化' : '有効化'}
                        </button>
                        <button
                          onClick={() => handleEdit(staffMember)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(staffMember)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// スタッフ権限設定モーダル（管理者用）
function StaffRolesModal({ onClose }: { onClose: () => void }) {
  const { staff, updateStaff, getStaffStats } = useStaff()
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [newRole, setNewRole] = useState<'STAFF' | 'MANAGER' | 'ADMIN'>('STAFF')

  const handleRoleChange = async () => {
    if (!selectedStaff) return

    try {
      await updateStaff(selectedStaff.id, { role: newRole })
      alert(`${selectedStaff.name}さんの権限を${newRole}に変更しました`)
      setSelectedStaff(null)
    } catch (error) {
      console.error('権限変更エラー:', error)
      alert(`権限変更に失敗しました：${error.message}`)
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'システム全体の管理権限'
      case 'MANAGER':
        return '管理ダッシュボードへのアクセス権限'
      default:
        return '基本的な報告書提出権限'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">スタッフ権限設定</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ 権限の変更は慎重に行ってください。システム管理者権限を与えると、すべての機能にアクセス可能になります。
              </p>
            </div>

            {selectedStaff ? (
              // 権限変更フォーム
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {selectedStaff.name}さんの権限を変更
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">現在の権限:</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                      {selectedStaff.role}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({getRoleDescription(selectedStaff.role)})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しい権限
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="STAFF">STAFF - 基本権限</option>
                    <option value="MANAGER">MANAGER - 管理者権限</option>
                    <option value="ADMIN">ADMIN - システム管理者権限</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {getRoleDescription(newRole)}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedStaff(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleRoleChange}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    権限を変更
                  </button>
                </div>
              </div>
            ) : (
              // スタッフ選択一覧
              <div className="grid gap-4">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{staffMember.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              staffMember.role === 'ADMIN' 
                                ? 'bg-red-100 text-red-800'
                                : staffMember.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {staffMember.role}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {staffMember.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getRoleDescription(staffMember.role)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStaff(staffMember)
                          setNewRole(staffMember.role)
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        権限を変更
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 新規報告書作成モーダル（管理者用）
function NewReportModal({ onClose }: { onClose: () => void }) {
  const { addReportTemplate } = useReports()
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [emoji, setEmoji] = useState('📝')
  const [frequency, setFrequency] = useState('daily')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('regular')

  const handleSubmit = async () => {
    if (!reportName.trim()) {
      alert('報告書名を入力してください')
      return
    }
    
    try {
      const newReport = await addReportTemplate({
        name: reportName,
        description: reportDescription,
        emoji: emoji,
        frequency: frequency,
        deadline: deadline,
        category: category
      })
      
      alert(`新しい報告書「${reportName}」を作成しました！スタッフページで確認できます。`)
      console.log('新規報告書が作成されました:', newReport)
      onClose()
      
      // ページを再読み込みして最新データを表示
      window.location.reload()
    } catch (error) {
      console.error('報告書の作成に失敗しました:', error)
      alert(`報告書の作成に失敗しました：${error.message}`)
    }
  }

  const frequencyOptions = [
    { value: 'daily', label: '毎日', example: '毎日 18:00まで' },
    { value: 'weekly', label: '毎週', example: '毎週金曜 17:00まで' },
    { value: 'monthly', label: '毎月', example: '毎月末日 17:00まで' },
    { value: 'biweekly', label: '隔週', example: '隔週日曜 20:00まで' },
    { value: 'custom', label: 'カスタム', example: '管理者が指定' }
  ]

  const emojiOptions = ['📝', '📊', '📈', '📋', '💡', '🇳🇵', '🧽', '👥', '📅', '⚡', '🎯', '🔧', '📞', '🏆']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">新規報告書を作成</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* 報告書名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                報告書名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="例: 品質管理報告"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明文
              </label>
              <input
                type="text"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="例: 店舗の品質管理状況を報告"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 絵文字選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アイコン絵文字
              </label>
              <div className="grid grid-cols-7 gap-2">
                {emojiOptions.map((emojiOption) => (
                  <button
                    key={emojiOption}
                    onClick={() => setEmoji(emojiOption)}
                    className={`p-3 text-2xl rounded-lg border-2 hover:bg-gray-50 transition ${
                      emoji === emojiOption ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    {emojiOption}
                  </button>
                ))}
              </div>
            </div>

            {/* 頻度設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提出頻度
              </label>
              <div className="space-y-2">
                {frequencyOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={frequency === option.value}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="mr-3"
                    />
                    <span className="flex-1">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-gray-500 ml-2">({option.example})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 締切設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                締切の詳細
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="例: 毎週火曜 15:00まで"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="regular">定期報告</option>
                <option value="special">特別報告</option>
                <option value="training">研修・育成</option>
                <option value="maintenance">点検・メンテナンス</option>
                <option value="event">イベント・会議</option>
              </select>
            </div>

            {/* プレビュー */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h4>
              <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">{emoji}</div>
                  <h3 className="text-lg font-semibold mb-1">{reportName || '報告書名'}</h3>
                  <p className="text-gray-600 text-sm mb-2">{reportDescription || '説明文'}</p>
                  <div className="text-xs text-blue-600 mb-2">{deadline || '締切設定'}</div>
                  <button className="w-full bg-orange-500 text-white px-3 py-1 rounded text-sm">
                    提出する
                  </button>
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
              >
                作成する
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    setShowDetails(true)
  }

  const handleSubmit = async () => {
    try {
      console.log('=== 提出処理開始 ===')
      console.log('reportName:', reportName)
      console.log('selectedAction:', selectedAction)
      console.log('user:', user)
      console.log('reportTemplates:', reportTemplates)
      
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

      const submissionData = {
        report_id: template.id,
        status: statusMap[selectedAction],
        document_url: documentUrl || undefined,
        message: message || undefined,
        has_question: selectedAction === '質問あり'
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input type="file" className="hidden" id="file-upload" multiple />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-500">
                      <div className="text-3xl mb-2">📎</div>
                      <p>クリックしてファイルを選択</p>
                      <p className="text-xs mt-1">PDF, Excel, Word, 画像など</p>
                    </div>
                  </label>
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
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                >
                  送信
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
          <Route path="/login" element={<LoginPage />} />
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

// 管理者専用ログインページ
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
        {/* 戻るボタン */}
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

// シンプルなスタッフ専用ページ
function SimpleStaffPage() {
  const { reportTemplates, isLoading } = useReports()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

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