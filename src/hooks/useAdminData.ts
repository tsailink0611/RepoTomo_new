import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface AdminSubmission {
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
  staff?: {
    id: string
    staff_id: string
    name: string
    email?: string
    role: string
  }
  report?: {
    id: string
    name: string
    description: string
    emoji: string
    frequency: string
  }
}

export interface AdminStats {
  totalSubmissions: number
  pendingQuestions: number
  submissionRate: number
  needHelpCount: number
  todaySubmissions: number
  completedSubmissions: number
  totalStaff: number
}

export const useAdminData = () => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalSubmissions: 0,
    pendingQuestions: 0,
    submissionRate: 0,
    needHelpCount: 0,
    todaySubmissions: 0,
    completedSubmissions: 0,
    totalStaff: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 管理者権限チェック
  const isAdmin = user?.staff?.role === 'MANAGER' || user?.staff?.role === 'ADMIN'

  // 全ての提出データを取得
  const fetchSubmissions = async () => {
    if (!isAdmin) return

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          staff:staff_id(
            id,
            staff_id,
            name,
            email,
            role
          ),
          report:report_id(
            id,
            name,
            description,
            emoji,
            frequency
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      console.error('提出データ取得エラー:', err)
      setError('提出データの取得に失敗しました')
    }
  }

  // 統計データを計算
  const calculateStats = async () => {
    if (!isAdmin) return

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // 今日の提出数
      const { count: todayCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      // 総提出数
      const { count: totalCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })

      // 未回答の質問数
      const { count: pendingCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('has_question', true)
        .is('admin_response', null)

      // 要サポート数
      const { count: helpCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('mood', 'need_help')
        .gte('created_at', `${today}T00:00:00.000Z`)

      // 完了提出数
      const { count: completedCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // 総スタッフ数
      const { count: staffCount } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // 提出率計算（今日の提出数 / アクティブスタッフ数）
      const submissionRate = staffCount && staffCount > 0 
        ? Math.round(((todayCount || 0) / staffCount) * 100)
        : 0

      setStats({
        totalSubmissions: totalCount || 0,
        pendingQuestions: pendingCount || 0,
        submissionRate,
        needHelpCount: helpCount || 0,
        todaySubmissions: todayCount || 0,
        completedSubmissions: completedCount || 0,
        totalStaff: staffCount || 0
      })
    } catch (err) {
      console.error('統計データ計算エラー:', err)
      setError('統計データの計算に失敗しました')
    }
  }

  // 管理者返信を更新
  const respondToSubmission = async (submissionId: string, response: string) => {
    if (!isAdmin || !user?.staff?.id) {
      throw new Error('管理者権限が必要です')
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          admin_response: response,
          admin_responded_at: new Date().toISOString(),
          admin_responded_by: user.staff.id
        })
        .eq('id', submissionId)
        .select(`
          *,
          staff:staff_id(
            id,
            staff_id,
            name,
            email,
            role
          ),
          report:report_id(
            id,
            name,
            description,
            emoji,
            frequency
          )
        `)
        .single()

      if (error) throw error

      // ローカル状態を更新
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId ? data : sub
        )
      )

      // 統計を再計算
      await calculateStats()

      return data
    } catch (err) {
      console.error('返信更新エラー:', err)
      throw new Error('返信の更新に失敗しました')
    }
  }

  // データの初期化
  useEffect(() => {
    const initializeData = async () => {
      if (!isAdmin) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        await Promise.all([
          fetchSubmissions(),
          calculateStats()
        ])
      } catch (err) {
        console.error('管理者データ初期化エラー:', err)
        setError('データの初期化に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [isAdmin, user?.staff?.id])

  // データの再取得
  const refetch = async () => {
    if (!isAdmin) return

    setIsLoading(true)
    setError(null)

    try {
      await Promise.all([
        fetchSubmissions(),
        calculateStats()
      ])
    } catch (err) {
      console.error('管理者データ再取得エラー:', err)
      setError('データの再取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    submissions,
    stats,
    isLoading,
    error,
    isAdmin,
    respondToSubmission,
    refetch
  }
}