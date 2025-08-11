import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'

interface MockSubmission {
  id: string
  staffName: string
  reportTitle: string
  mood: 'happy' | 'neutral' | 'need_help'
  hasQuestion: boolean
  question?: string
  submittedAt: string
  isAnswered: boolean
}

export const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [submissions, setSubmissions] = useState<MockSubmission[]>([])
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingQuestions: 0,
    submissionRate: 0,
    needHelpCount: 0
  })

  useEffect(() => {
    // モックデータの読み込み
    const mockSubmissions: MockSubmission[] = [
      {
        id: '1',
        staffName: '田中太郎',
        reportTitle: '日報',
        mood: 'happy',
        hasQuestion: true,
        question: 'シフトの変更についてお聞きしたいことがあります',
        submittedAt: '2025-07-26T10:30:00Z',
        isAnswered: false
      },
      {
        id: '2',
        staffName: '田中太郎',
        reportTitle: '日報',
        mood: 'need_help',
        hasQuestion: true,
        question: '新しい機器の使い方がよくわかりません',
        submittedAt: '2025-07-25T18:15:00Z',
        isAnswered: false
      },
      {
        id: '3',
        staffName: '田中太郎',
        reportTitle: '日報',
        mood: 'neutral',
        hasQuestion: false,
        submittedAt: '2025-07-24T17:45:00Z',
        isAnswered: true
      }
    ]

    setSubmissions(mockSubmissions)
    setStats({
      totalSubmissions: mockSubmissions.length,
      pendingQuestions: mockSubmissions.filter(s => s.hasQuestion && !s.isAnswered).length,
      submissionRate: 85,
      needHelpCount: mockSubmissions.filter(s => s.mood === 'need_help').length
    })
  }, [])

  const getMoodIcon = (mood: 'happy' | 'neutral' | 'need_help') => {
    switch (mood) {
      case 'happy': return '😊'
      case 'neutral': return '😐'
      case 'need_help': return '😰'
    }
  }

  const getMoodColor = (mood: 'happy' | 'neutral' | 'need_help') => {
    switch (mood) {
      case 'happy': return 'text-green-600 bg-green-50'
      case 'neutral': return 'text-yellow-600 bg-yellow-50'
      case 'need_help': return 'text-red-600 bg-red-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">🎉 RepoTomo</h1>
              <span className="ml-4 text-gray-600">管理者ダッシュボード</span>
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
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSubmissions}</div>
            <div className="text-gray-600">今日の提出数</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.submissionRate}%</div>
            <div className="text-gray-600">提出率</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.pendingQuestions}</div>
            <div className="text-gray-600">未回答の質問</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.needHelpCount}</div>
            <div className="text-gray-600">要サポート</div>
          </Card>
        </div>

        {/* 優先対応エリア */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            🚨 優先対応が必要な項目
          </h2>
          <div className="space-y-4">
            {submissions
              .filter(s => s.mood === 'need_help' || (s.hasQuestion && !s.isAnswered))
              .map((submission) => (
                <Card key={submission.id} className="border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${getMoodColor(submission.mood)}`}>
                          {getMoodIcon(submission.mood)} {submission.mood === 'need_help' ? '要サポート' : '通常'}
                        </span>
                        <span className="font-medium text-gray-800">{submission.staffName}</span>
                        <span className="text-gray-500 ml-2">• {submission.reportTitle}</span>
                      </div>
                      {submission.hasQuestion && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-700">{submission.question}</p>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button size="sm" variant="primary">
                        💬 返信する
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* 最近の提出一覧 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            📋 最近の提出一覧
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      スタッフ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      報告書
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      気分
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      質問
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      提出日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{submission.staffName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{submission.reportTitle}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(submission.mood)}`}>
                          {getMoodIcon(submission.mood)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.hasQuestion ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            submission.isAnswered ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
                          }`}>
                            {submission.isAnswered ? '✅ 回答済み' : '❓ 未回答'}
                          </span>
                        ) : (
                          <span className="text-gray-400">なし</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button size="sm" variant="secondary">
                          👀 詳細
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}