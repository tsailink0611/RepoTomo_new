import { useState } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'

export const NotificationSettings = () => {
  const { permission, isSupported, requestPermission, sendTestNotification } = usePushNotifications()
  const { notifications, unreadCount, markAllAsRead } = useRealtimeNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEnableNotifications = async () => {
    setLoading(true)
    const granted = await requestPermission()
    if (granted) {
      // テスト通知を送信
      await sendTestNotification()
    }
    setLoading(false)
  }

  const handleTestNotification = async () => {
    setLoading(true)
    await sendTestNotification()
    setLoading(false)
  }

  return (
    <>
      {/* 通知ベルアイコン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知パネル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-orange-500 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">通知</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-orange-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 通知設定 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">プッシュ通知</span>
                {!isSupported ? (
                  <span className="text-sm text-gray-500">未対応</span>
                ) : permission === 'granted' ? (
                  <span className="text-sm text-green-600">有効</span>
                ) : permission === 'denied' ? (
                  <span className="text-sm text-red-600">ブロック中</span>
                ) : (
                  <button
                    onClick={handleEnableNotifications}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition disabled:opacity-50"
                  >
                    {loading ? '設定中...' : '有効にする'}
                  </button>
                )}
              </div>

              {permission === 'granted' && (
                <button
                  onClick={handleTestNotification}
                  disabled={loading}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition disabled:opacity-50"
                >
                  {loading ? 'テスト中...' : 'テスト通知を送信'}
                </button>
              )}
            </div>

            {/* 通知リスト */}
            <div className="overflow-y-auto max-h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>通知はありません</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-orange-50' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {notification.type === 'reminder' && '⏰'}
                          {notification.type === 'question_response' && '💬'}
                          {notification.type === 'system' && '📢'}
                          {notification.type === 'achievement' && '🏆'}
                          {notification.type === 'deadline' && '📅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.sent_at).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* フッター */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="p-4 border-t">
                <button
                  onClick={markAllAsRead}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition"
                >
                  すべて既読にする
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}