import { useState } from 'react'
import { useReports } from '../../hooks/useReports'

interface TemplateManagementModalProps {
  onClose: () => void
}

export function TemplateManagementModal({ onClose }: TemplateManagementModalProps) {
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