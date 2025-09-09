import React, { useState } from 'react'
import { useLINE } from '../../hooks/useLINE'
import { useStaff } from '../../hooks/useStaff'

interface LINESettingsModalProps {
  onClose: () => void
}

// LINE設定管理モーダル（管理者用）
export function LINESettingsModal({ onClose }: LINESettingsModalProps) {
  const { getLINEStats, getLINENotificationHistory } = useLINE()
  const { staff } = useStaff()
  const [stats, setStats] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [statsData, notificationsData] = await Promise.all([
          getLINEStats(),
          getLINENotificationHistory(20)
        ])
        setStats(statsData)
        setNotifications(notificationsData)
      } catch (error) {
        console.error('データ読み込みエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
            <h2 className="text-2xl font-bold text-gray-800">LINE設定管理</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {/* LINE統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.totalStaff || 0}</div>
              <p className="text-sm text-gray-600">総スタッフ数</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.connectedStaff || 0}</div>
              <p className="text-sm text-gray-600">LINE連携済み</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.activeConnectedStaff || 0}</div>
              <p className="text-sm text-gray-600">アクティブ連携</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.todayNotifications || 0}</div>
              <p className="text-sm text-gray-600">本日の通知数</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* スタッフLINE連携状況 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">スタッフLINE連携状況</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{staffMember.name}</div>
                      <div className="text-sm text-gray-600">{staffMember.email}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        staffMember.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staffMember.is_active ? 'アクティブ' : '非アクティブ'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        staffMember.line_user_id 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staffMember.line_user_id ? 'LINE連携済み' : 'LINE未連携'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 最近のLINE通知履歴 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">最近のLINE通知履歴</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="py-2 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            notification.type === 'reminder' 
                              ? 'bg-orange-100 text-orange-800'
                              : notification.type === 'response'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {notification.type === 'reminder' && 'リマインダー'}
                            {notification.type === 'response' && '回答'}
                            {notification.type === 'system' && 'システム'}
                          </span>
                          <span className="text-sm font-medium">{notification.staff?.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.sent_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{notification.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">LINE通知履歴がありません</p>
                )}
              </div>
            </div>
          </div>

          {/* LINE Bot設定情報 */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">📱 LINE Bot設定について</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>• LINE Bot WebhookのURL: <code className="bg-yellow-100 px-1 rounded">{window.location.origin}/functions/v1/line-webhook</code></p>
              <p>• スタッフはLINE Botを友達追加後、スタッフIDを送信して連携を完了します</p>
              <p>• 連携済みスタッフには自動でリマインダーと通知が送信されます</p>
              <p>• 環境変数でLINE Channel Access TokenとChannel Secretの設定が必要です</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}