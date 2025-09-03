import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface ReportTemplate {
  id: string
  name: string
  description: string
  emoji: string
  frequency: string
  deadline: string
  category: string
  created_at: string
  is_active: boolean
}

export interface ReportSubmission {
  id: string
  staff_id: string
  report_id: string
  status: 'pending' | 'completed' | 'partial' | 'has_question' | 'extension_requested'
  answers?: any
  mood?: 'happy' | 'neutral' | 'need_help'
  has_question: boolean
  question?: string
  message?: string
  document_url?: string
  attachments?: any
  submitted_at: string
  due_date?: string
  completed_at?: string
  admin_response?: string
  admin_responded_at?: string
  admin_responded_by?: string
  created_at: string
  // リレーション
  staff?: any
  report?: ReportTemplate
}


export const useReports = () => {
  const { user } = useAuth()
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [reportSubmissions, setReportSubmissions] = useState<ReportSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 報告書テンプレートを取得
  const fetchReportTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReportTemplates(data || [])
    } catch (err) {
      console.error('報告書テンプレート取得エラー:', err)
      setError('報告書テンプレートの取得に失敗しました')
    }
  }

  // 報告書提出履歴を取得
  const fetchReportSubmissions = async () => {
    if (!user?.staff?.id) return

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          staff:staff_id(*),
          report:report_id(*)
        `)
        .eq('staff_id', user.staff.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReportSubmissions(data || [])
    } catch (err) {
      console.error('報告書提出履歴取得エラー:', err)
      setError('報告書提出履歴の取得に失敗しました')
    }
  }

  // 初期化：Supabaseからデータを読み込み
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        await Promise.all([
          fetchReportTemplates(),
          fetchReportSubmissions()
        ])
      } catch (err) {
        console.error('データ初期化エラー:', err)
        setError('データの初期化に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [user?.staff?.id])

  // 報告書テンプレートを追加
  const addReportTemplate = async (template: Omit<ReportTemplate, 'id' | 'created_at' | 'is_active'>) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          ...template,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      // ローカル状態を更新
      setReportTemplates(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('報告書テンプレート追加エラー:', err)
      throw new Error('報告書テンプレートの追加に失敗しました')
    }
  }

  // 報告書提出を追加
  const addReportSubmission = async (submission: Omit<ReportSubmission, 'id' | 'submitted_at' | 'created_at'>) => {
    console.log('=== addReportSubmission開始 ===')
    console.log('user:', user)
    console.log('user?.staff:', user?.staff)
    console.log('user?.staff?.id:', user?.staff?.id)
    
    // テスト用: ユーザー認証が未実装の場合はダミーのスタッフレコードを検索
    let staffId = user?.staff?.id
    if (!staffId) {
      console.warn('スタッフIDが見つかりません。既存のテストスタッフを検索します。')
      
      try {
        // 既存のスタッフレコードを検索
        const { data: existingStaff } = await supabase
          .from('staff')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .single()
        
        if (existingStaff) {
          staffId = existingStaff.id
          console.log('既存スタッフIDを使用:', staffId)
        } else {
          // スタッフレコードが存在しない場合は新しく作成（テスト用）
          const { data: newStaff } = await supabase
            .from('staff')
            .insert({
              staff_id: 'temp-staff-001',
              name: 'テストユーザー',
              role: 'STAFF',
              is_active: true
            })
            .select('id')
            .single()
          
          staffId = newStaff?.id
          console.log('新しいテストスタッフを作成:', staffId)
        }
      } catch (staffError) {
        console.error('スタッフID取得エラー:', staffError)
        throw new Error('スタッフIDの取得に失敗しました。管理者にお問い合わせください。')
      }
    }

    const insertData = {
      ...submission,
      staff_id: staffId,
      submitted_at: new Date().toISOString()
    }
    
    console.log('Supabaseに挿入するデータ:', insertData)

    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert(insertData)
        .select(`
          *,
          staff:staff_id(*),
          report:report_id(*)
        `)
        .single()

      console.log('Supabaseレスポンス:', { data, error })

      if (error) {
        console.error('Supabaseエラー詳細:', error)
        throw error
      }

      // ローカル状態を更新
      setReportSubmissions(prev => [data, ...prev])
      console.log('提出成功、ローカル状態更新完了')
      return data
    } catch (err) {
      console.error('=== 報告書提出エラー詳細 ===')
      console.error('エラーオブジェクト:', err)
      console.error('エラーメッセージ:', err.message)
      console.error('エラーコード:', err.code)
      console.error('エラー詳細:', err.details)
      console.error('エラーヒント:', err.hint)
      throw new Error(`報告書の提出に失敗しました: ${err.message}`)
    }
  }

  // 提出状況の統計を取得
  const getSubmissionStats = () => {
    const today = new Date().toDateString()
    const todaySubmissions = reportSubmissions.filter(
      sub => new Date(sub.submitted_at).toDateString() === today
    )

    return {
      todayTotal: todaySubmissions.length,
      todayCompleted: todaySubmissions.filter(sub => sub.status === 'completed').length,
      todayQuestions: todaySubmissions.filter(sub => sub.status === 'has_question').length,
      todayPartial: todaySubmissions.filter(sub => sub.status === 'partial').length,
      todayExtension: todaySubmissions.filter(sub => sub.status === 'extension_requested').length,
      totalSubmissions: reportSubmissions.length
    }
  }

  // 最近の提出履歴を取得
  const getRecentSubmissions = (limit: number = 10) => {
    return reportSubmissions
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, limit)
  }

  // 報告書提出を更新
  const updateReportSubmission = async (id: string, updates: Partial<ReportSubmission>) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          staff:staff_id(*),
          report:report_id(*)
        `)
        .single()

      if (error) throw error

      // ローカル状態を更新
      setReportSubmissions(prev => 
        prev.map(submission => 
          submission.id === id ? data : submission
        )
      )
      return data
    } catch (err) {
      console.error('報告書更新エラー:', err)
      throw new Error('報告書の更新に失敗しました')
    }
  }

  // データを再取得
  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        fetchReportTemplates(),
        fetchReportSubmissions()
      ])
    } catch (err) {
      console.error('データ再取得エラー:', err)
      setError('データの再取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 報告書テンプレートを更新
  const updateReportTemplate = async (templateId: string, updates: Partial<ReportTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single()

      if (error) throw error

      // ローカル状態を更新
      setReportTemplates(prev => 
        prev.map(template => 
          template.id === templateId ? { ...template, ...data } : template
        )
      )
      return data
    } catch (err) {
      console.error('報告書テンプレート更新エラー:', err)
      throw new Error('報告書テンプレートの更新に失敗しました')
    }
  }

  // 報告書テンプレートを削除
  const deleteReportTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      // ローカル状態を更新
      setReportTemplates(prev => prev.filter(template => template.id !== templateId))
    } catch (err) {
      console.error('報告書テンプレート削除エラー:', err)
      throw new Error('報告書テンプレートの削除に失敗しました')
    }
  }

  return {
    reportTemplates,
    reportSubmissions,
    isLoading,
    error,
    addReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    addReportSubmission,
    updateReportSubmission,
    getSubmissionStats,
    getRecentSubmissions,
    refetch
  }
}