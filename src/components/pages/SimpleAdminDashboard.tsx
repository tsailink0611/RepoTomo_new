import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import { useNotifications } from '../../hooks/useNotifications'
import { useReminders } from '../../hooks/useReminders'
import { useLINE } from '../../hooks/useLINE'
import { NewReportModal } from '../modals/NewReportModal'
import { TemplateManagementModal } from '../modals/TemplateManagementModal'
import { StaffManagementModal } from '../modals/StaffManagementModal'
import { StaffRolesModal } from '../modals/StaffRolesModal'
import { LINESettingsModal } from '../modals/LINESettingsModal'
import { SystemNotificationModal } from '../modals/SystemNotificationModal'

export function SimpleAdminDashboard() {
  const { user, logout } = useAuth()
  const { getSubmissionStats, getRecentSubmissions, reportTemplates } = useReports()
  const { sendQuestionResponse, sendSystemNotification, notifications, getUnreadCount, markAsRead } = useNotifications()
  const { sendReminders, sendTestReminder } = useReminders()
  const { sendLINEReminder } = useLINE()
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTemplateManagement, setShowTemplateManagement] = useState(false)
  const [showStaffManagement, setShowStaffManagement] = useState(false)
  const [showStaffRoles, setShowStaffRoles] = useState(false)
  const [showLINESettings, setShowLINESettings] = useState(false)
  const [showSystemNotification, setShowSystemNotification] = useState(false)
  
  const stats = getSubmissionStats()
  const recentSubmissions = getRecentSubmissions(5)

  const handleSendLINEReminders = async () => {
    try {
      const result = await sendLINEReminder('', 'daily')
      alert(`LINEリマインダーを送信しました！\n送信: ${result?.summary?.sent || 0}件\nスキップ: ${result?.summary?.skipped || 0}件`)
    } catch (error) {
      console.error('LINEリマインダー送信エラー:', error)
      alert(`LINEリマインダーの送信に失敗しました: ${error?.message || 'Unknown error'}`)
    }
  }

  const handleQuestionResponse = (submission: any) => {
    const response = prompt(`${submission.userName}さんの${submission.reportName}への回答を入力してください：`)
    if (response) {
      sendQuestionResponse(submission.reportName, response, submission.userId, submission.userName)
      alert('回答を送信しました！')
    }
  }
  
  return (
    <div className="min-h-screen bg-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-xl md:text-2xl font-bold text-purple-600 hover:text-purple-700">🎉 RepoTomo</Link>
              <span className="ml-2 md:ml-4 text-gray-600 text-sm md:text-base">管理者ダッシュボード</span>
            </div>
            <div className="flex items-center space-x-4">
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

      {showNewReportModal && (
        <NewReportModal onClose={() => setShowNewReportModal(false)} />
      )}
      
      {showTemplateManagement && (
        <TemplateManagementModal onClose={() => setShowTemplateManagement(false)} />
      )}
      
      {showStaffManagement && (
        <StaffManagementModal onClose={() => setShowStaffManagement(false)} />
      )}
      
      {showStaffRoles && (
        <StaffRolesModal onClose={() => setShowStaffRoles(false)} />
      )}
      
      {showLINESettings && (
        <LINESettingsModal onClose={() => setShowLINESettings(false)} />
      )}
      
      {showSystemNotification && (
        <SystemNotificationModal onClose={() => setShowSystemNotification(false)} />
      )}
    </div>
  )
}