import React, { useState } from 'react'
import { useReports } from '../../hooks/useReports'

interface NewReportModalProps {
  onClose: () => void
}

// 新規報告書作成モーダル（管理者用）
export function NewReportModal({ onClose }: NewReportModalProps) {
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