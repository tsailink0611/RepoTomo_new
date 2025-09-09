import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import { ReportSubmissionModal } from '../modals/ReportSubmissionModal'

export function SimpleStaffPage() {
  const { reportTemplates, isLoading } = useReports()
  const { isAuthenticated, loginAsStaff } = useAuth()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated)

  // 認証処理
  const handleStaffAuth = async () => {
    const staffId = prompt('スタッフIDを入力してください：')
    if (staffId) {
      try {
        await loginAsStaff(staffId)
        setShowAuthModal(false)
      } catch (error) {
        alert('ログインに失敗しました。正しいスタッフIDを入力してください。')
        console.error('Staff login error:', error)
      }
    }
  }

  // 認証モーダル
  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            スタッフ認証
          </h2>
          <p className="text-gray-600 mb-6">
            報告書提出には認証が必要です。<br/>
            スタッフIDを入力してください。
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleStaffAuth}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              スタッフIDで認証
            </button>
            <Link 
              to="/" 
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
            .filter(template => template.is_active)
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