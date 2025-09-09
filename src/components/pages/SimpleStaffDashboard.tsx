import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import { ReportSubmissionModal } from '../modals/ReportSubmissionModal'

export function SimpleStaffDashboard() {
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