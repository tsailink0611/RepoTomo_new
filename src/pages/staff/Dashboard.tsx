import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { ReportTemplate } from '../../types'

export const StaffDashboard = () => {
  const { user, logout } = useAuth()
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)

  useEffect(() => {
    const loadTemplates = async () => {
      const response = await api.getReportTemplates()
      if (response.data) {
        setTemplates(response.data)
      }
      setIsLoading(false)
    }
    loadTemplates()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">🎉 RepoTomo</h1>
              <span className="ml-4 text-gray-600">スタッフダッシュボード</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                こんにちは、{user?.staff?.name}さん！
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムメッセージ */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-orange-100 to-pink-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                今日もお疲れさまです！😊
              </h2>
              <p className="text-gray-600">
                報告書の提出は「期限は目安」です。余裕があるときにお願いします。
              </p>
            </div>
          </Card>
        </div>

        {/* 報告書テンプレート一覧 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-xl transition-shadow duration-200">
              <div className="text-center">
                <div className="text-4xl mb-4">{template.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {template.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {template.description}
                </p>
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full"
                  >
                    📝 提出する
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    📊 履歴を見る
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 最近の活動 */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">最近の活動</h3>
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  <span className="text-gray-800">日報を提出しました</span>
                </div>
                <span className="text-sm text-gray-500">2時間前</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-3">💬</span>
                  <span className="text-gray-800">質問に回答がありました</span>
                </div>
                <span className="text-sm text-gray-500">1日前</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-3">🏆</span>
                  <span className="text-gray-800">継続提出バッジを獲得しました</span>
                </div>
                <span className="text-sm text-gray-500">3日前</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* 報告書提出モーダル */}
      {selectedTemplate && (
        <ReportSubmissionModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  )
}

// 報告書提出モーダルコンポーネント
const ReportSubmissionModal = ({ 
  template, 
  onClose 
}: { 
  template: ReportTemplate
  onClose: () => void 
}) => {
  const { user } = useAuth()
  const [mood, setMood] = useState<'happy' | 'neutral' | 'need_help'>('happy')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [hasQuestion, setHasQuestion] = useState(false)
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await api.submitReport({
        reportId: template.id,
        staffId: user?.id,
        answers,
        mood,
        hasQuestion,
        question: hasQuestion ? question : undefined
      })

      if (response.data) {
        alert('✅ 提出完了！お疲れさまでした😊')
        onClose()
      }
    } catch (error) {
      alert('❌ 提出中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <header className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {template.emoji} {template.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mt-2">{template.description}</p>
          </header>

          <div className="p-6 space-y-6">
            {/* 気分選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                今日の調子はいかがですか？
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMood('happy')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mood === 'happy' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">😊</div>
                  <div className="text-sm font-medium">絶好調！</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMood('neutral')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mood === 'neutral' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">😐</div>
                  <div className="text-sm font-medium">まあまあ</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMood('need_help')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mood === 'need_help' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">😰</div>
                  <div className="text-sm font-medium">助けて！</div>
                </button>
              </div>
            </div>

            {/* 業務内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                今日の業務内容を教えてください
              </label>
              <textarea
                value={answers.work_content || ''}
                onChange={(e) => setAnswers({...answers, work_content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                placeholder="例：店内清掃、接客業務、レジ対応など..."
              />
            </div>

            {/* 質問・相談 */}
            <div>
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={hasQuestion}
                  onChange={(e) => setHasQuestion(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  質問や相談があります
                </span>
              </label>
              {hasQuestion && (
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="遠慮なく何でもお聞きください😊"
                />
              )}
            </div>
          </div>

          <footer className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              提出する
            </Button>
          </footer>
        </form>
      </div>
    </div>
  )
}