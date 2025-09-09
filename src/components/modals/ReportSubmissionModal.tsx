import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import { useNotifications } from '../../hooks/useNotifications'
import { supabase } from '../../lib/supabase'

interface ReportSubmissionModalProps {
  reportName: string
  onClose: () => void
}

export function ReportSubmissionModal({ 
  reportName, 
  onClose 
}: ReportSubmissionModalProps) {
  const { user } = useAuth()
  const { addReportSubmission, reportTemplates } = useReports()
  const { addNotification } = useNotifications()
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [message, setMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    setShowDetails(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(files)
    console.log('選択されたファイル:', files.map(f => f.name))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles(files)
    console.log('ドロップされたファイル:', files.map(f => f.name))
  }

  const uploadFilesToSupabase = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []
    
    setIsUploading(true)
    const uploadedUrls: string[] = []
    
    try {
      console.log('=== ファイルアップロード開始 ===')
      console.log('ユーザーID:', user?.id)
      console.log('ファイル数:', files.length)
      
      for (const file of files) {
        console.log(`アップロード中: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
        
        // ファイルサイズチェック (10MB制限)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`ファイル "${file.name}" が大きすぎます (10MB以下にしてください)`)
        }
        
        // ファイル名をユニークにする
        const timestamp = Date.now()
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${timestamp}_${cleanFileName}`
        const filePath = `submissions/${user?.id}/${fileName}`
        
        console.log('アップロード先パス:', filePath)
        
        // Supabase Storageにアップロード
        const { data, error } = await supabase.storage
          .from('report-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          console.error('Supabaseアップロードエラー:', error)
          console.error('エラー詳細:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error.error
          })
          throw new Error(`アップロード失敗: ${error.message}`)
        }
        
        console.log('Supabaseアップロード成功:', data)
        
        // 公開URLを取得
        const { data: publicUrl } = supabase.storage
          .from('report-files')
          .getPublicUrl(filePath)
        
        uploadedUrls.push(publicUrl.publicUrl)
        console.log('公開URL取得成功:', publicUrl.publicUrl)
      }
      
      console.log('=== 全ファイルアップロード完了 ===')
      return uploadedUrls
    } catch (error) {
      console.error('=== ファイルアップロード失敗 ===')
      console.error('エラー詳細:', error)
      alert(`ファイルのアップロードに失敗しました: ${error.message}`)
      return []
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      console.log('=== 提出処理開始 ===')
      console.log('reportName:', reportName)
      console.log('selectedAction:', selectedAction)
      console.log('user:', user)
      console.log('reportTemplates:', reportTemplates)
      
      // ファイルをアップロード
      let fileUrls: string[] = []
      if (uploadedFiles.length > 0) {
        console.log('ファイルアップロード開始...')
        fileUrls = await uploadFilesToSupabase(uploadedFiles)
        console.log('アップロードされたファイルURL:', fileUrls)
      }
      
      // 状態を英語のenumに変換
      const statusMap: Record<string, 'completed' | 'has_question' | 'partial' | 'extension_requested'> = {
        '提出完了': 'completed',
        '質問あり': 'has_question', 
        '一部完了': 'partial',
        '延長希望': 'extension_requested'
      }

      // 報告書テンプレートをIDで検索（報告書名から）
      const template = reportTemplates.find(t => t.name === reportName)
      console.log('見つかったテンプレート:', template)
      
      if (!template) {
        console.error('テンプレートが見つかりません。reportName:', reportName)
        console.error('利用可能なテンプレート:', reportTemplates.map(t => t.name))
        throw new Error('報告書テンプレートが見つかりません')
      }

      // 添付ファイルのURLを含める
      const allDocumentUrls = [
        ...(documentUrl ? [documentUrl] : []),
        ...fileUrls
      ].filter(Boolean)

      const submissionData = {
        report_id: template.id,
        status: statusMap[selectedAction],
        document_url: allDocumentUrls.length > 0 ? allDocumentUrls.join(',') : undefined,
        message: message || undefined,
        has_question: selectedAction === '質問あり',
        file_urls: fileUrls.length > 0 ? fileUrls : undefined
      }
      console.log('提出データ:', submissionData)

      const submission = await addReportSubmission(submissionData)
      console.log('提出成功:', submission)
      
      // 管理者に通知を送信
      const staffName = user?.staff?.name || user?.email || '匿名ユーザー'
      const notificationMessage = selectedAction === '質問あり' 
        ? `${staffName}さんから「${reportName}」について質問があります。メッセージ: ${message}`
        : `${staffName}さんから「${reportName}」が提出されました（${selectedAction}）`

      addNotification({
        title: selectedAction === '質問あり' ? '❓ 質問が届きました' : '📝 新しい報告書提出',
        message: notificationMessage,
        type: selectedAction === '質問あり' ? 'question' : 'reminder',
        reportName,
        targetUserName: staffName
      })
      
      alert(`${reportName}の${selectedAction}を記録しました！管理者に通知も送信されました。`)
      console.log('提出記録完了:', submission)
      onClose()
    } catch (error) {
      console.error('=== 提出エラー詳細 ===')
      console.error('エラー:', error)
      console.error('エラーメッセージ:', error.message)
      console.error('エラー全体:', JSON.stringify(error, null, 2))
      alert(`提出の記録に失敗しました。エラー: ${error.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{reportName}の提出</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">状況を選択してください：</p>
              
              <button 
                onClick={() => handleActionSelect('提出完了')}
                className="w-full p-6 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="text-lg font-semibold text-green-700">提出完了</div>
                <div className="text-sm text-gray-600 mt-1">報告書の作成・提出が完了しました</div>
              </button>

              <button 
                onClick={() => handleActionSelect('質問あり')}
                className="w-full p-6 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">❓</div>
                <div className="text-lg font-semibold text-yellow-700">質問あり</div>
                <div className="text-sm text-gray-600 mt-1">不明点があります</div>
              </button>

              <button 
                onClick={() => handleActionSelect('一部完了')}
                className="w-full p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">🔄</div>
                <div className="text-lg font-semibold text-blue-700">一部完了</div>
                <div className="text-sm text-gray-600 mt-1">作業中・部分的に完了</div>
              </button>

              <button 
                onClick={() => handleActionSelect('延長希望')}
                className="w-full p-6 bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 rounded-lg transition"
              >
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-lg font-semibold text-purple-700">延長希望</div>
                <div className="text-sm text-gray-600 mt-1">期限の延長を申請します</div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">選択した状態：</p>
                <p className="text-lg font-semibold">{selectedAction}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  報告書URL（任意）
                </label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ（任意）
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="補足説明があれば記入してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  添付ファイル（任意）
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    id="file-upload" 
                    multiple 
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-500">
                      <div className="text-3xl mb-2">📎</div>
                      <p>クリックしてファイルを選択</p>
                      <p className="text-xs mt-1">または、ここにファイルをドラッグ&ドロップ</p>
                      <p className="text-xs">PDF, Excel, Word, 画像など</p>
                    </div>
                  </label>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-sm font-medium text-gray-700 mb-1">選択されたファイル:</p>
                      <ul className="text-sm text-gray-600">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span>📄</span>
                            <span>{file.name}</span>
                            <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? 'アップロード中...' : '送信'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}