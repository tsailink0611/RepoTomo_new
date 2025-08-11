import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import React from 'react'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useReports } from './hooks/useReports'
import { useNotifications } from './hooks/useNotifications'
import { useReminders } from './hooks/useReminders'
import { PWAInstallPrompt, IOSInstallGuide } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'

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
  const { getSubmissionStats, getRecentSubmissions } = useReports()
  const { sendQuestionResponse, sendSystemNotification } = useNotifications()
  const { sendReminders, sendTestReminder } = useReminders()
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  
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
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📊 報告書テンプレート管理</h3>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition mb-2">
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
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition mb-2">
              スタッフ一覧
            </button>
            <button className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
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
        </div>
      </main>

      {/* 新規報告書作成モーダル */}
      {showNewReportModal && (
        <NewReportModal onClose={() => setShowNewReportModal(false)} />
      )}
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

  const handleSubmit = () => {
    if (!reportName.trim()) {
      alert('報告書名を入力してください')
      return
    }
    
    try {
      const newReport = addReportTemplate({
        name: reportName,
        description: reportDescription,
        emoji: emoji,
        frequency: frequency,
        deadline: deadline,
        category: category
      })
      
      alert(`新しい報告書「${reportName}」を作成しました！`)
      console.log('新規報告書が作成されました:', newReport)
      onClose()
    } catch (error) {
      console.error('報告書の作成に失敗しました:', error)
      alert('報告書の作成に失敗しました。もう一度お試しください。')
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
  const { addReportSubmission } = useReports()
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [message, setMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    setShowDetails(true)
  }

  const handleSubmit = () => {
    try {
      const submission = addReportSubmission({
        reportId: reportName, // 実際のIDに変更する必要があります
        reportName: reportName,
        userId: user?.id || 'unknown',
        userName: user?.staff?.name || user?.email || '匿名ユーザー',
        status: selectedAction as '提出完了' | '質問あり' | '一部完了' | '延長希望',
        documentUrl: documentUrl || undefined,
        message: message || undefined
      })
      
      alert(`${reportName}の${selectedAction}を記録しました！`)
      console.log('提出記録:', submission)
      onClose()
    } catch (error) {
      console.error('提出の記録に失敗しました:', error)
      alert('提出の記録に失敗しました。もう一度お試しください。')
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
            .filter(template => template.isActive)
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
            .filter(template => template.isActive)
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