import { useState } from 'react'
import { useLINE } from '../../hooks/useLINE'

interface SystemNotificationModalProps {
  onClose: () => void
}

export function SystemNotificationModal({ onClose }: SystemNotificationModalProps) {
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

            {/* プリセットメッセージ */}
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
        
        {/* 固定ボタン部分 */}
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