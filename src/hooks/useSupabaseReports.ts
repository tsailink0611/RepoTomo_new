import { useState, useEffect } from 'react'
import { supabase, isUsingMockData } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../types/database'

type ReportTemplate = Database['public']['Tables']['report_templates']['Row']
type Submission = Database['public']['Tables']['submissions']['Row']

interface SubmissionWithDetails extends Submission {
  staff?: Database['public']['Tables']['staff']['Row']
  report_template?: ReportTemplate
}

export const useSupabaseReports = () => {
  const { user } = useAuth()
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 報告書テンプレート取得
  useEffect(() => {
    if (!isUsingMockData) {
      fetchReportTemplates()
    }
  }, [])

  // 提出履歴取得
  useEffect(() => {
    if (!isUsingMockData && user) {
      fetchSubmissions()
      
      // リアルタイム更新のサブスクリプション
      const channel = supabase
        .channel('submissions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'submissions'
          },
          (payload) => {
            handleRealtimeUpdate(payload)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const fetchReportTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReportTemplates(data || [])
    } catch (err: any) {
      console.error('Failed to fetch report templates:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          staff:staff_id (*),
          report_template:report_id (*)
        `)
        .order('submitted_at', { ascending: false })

      // スタッフは自分の提出のみ、管理者は全て見れる
      if (user?.staff?.role === 'STAFF') {
        query = query.eq('staff_id', user.id)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error

      setSubmissions(data || [])
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err)
      setError(err.message)
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        setSubmissions(prev => [newRecord, ...prev])
        break
      case 'UPDATE':
        setSubmissions(prev => 
          prev.map(sub => sub.id === newRecord.id ? newRecord : sub)
        )
        break
      case 'DELETE':
        setSubmissions(prev => 
          prev.filter(sub => sub.id !== oldRecord.id)
        )
        break
    }
  }

  // 報告書提出
  const submitReport = async (
    reportId: string,
    data: {
      status: 'completed' | 'partial' | 'has_question' | 'extension_requested'
      answers?: any
      message?: string
      document_url?: string
      mood?: 'happy' | 'neutral' | 'need_help'
      has_question?: boolean
      question?: string
    }
  ) => {
    if (isUsingMockData) {
      console.log('Mock: Report submission', { reportId, data })
      return { success: true, id: 'mock-id' }
    }

    try {
      const { data: submission, error } = await supabase
        .from('submissions')
        .insert({
          staff_id: user?.id,
          report_id: reportId,
          status: data.status,
          answers: data.answers || {},
          message: data.message,
          document_url: data.document_url,
          mood: data.mood,
          has_question: data.has_question || false,
          question: data.question,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // アチーブメント処理（連続提出など）
      await checkAndGrantAchievements(submission.id)

      return { success: true, id: submission.id }
    } catch (err: any) {
      console.error('Failed to submit report:', err)
      return { success: false, error: err.message }
    }
  }

  // 報告書テンプレート作成（管理者用）
  const createReportTemplate = async (template: {
    name: string
    description?: string
    emoji?: string
    frequency?: string
    deadline?: string
    category?: string
    questions?: any[]
  }) => {
    if (isUsingMockData) {
      console.log('Mock: Create report template', template)
      return { success: true, id: 'mock-template-id' }
    }

    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          ...template,
          created_by: user?.id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setReportTemplates(prev => [data, ...prev])
      return { success: true, id: data.id }
    } catch (err: any) {
      console.error('Failed to create report template:', err)
      return { success: false, error: err.message }
    }
  }

  // 統計情報取得
  const getSubmissionStats = async () => {
    if (isUsingMockData) {
      return {
        todayTotal: 5,
        todayCompleted: 3,
        todayQuestions: 1,
        todayExtensions: 1,
        weekTotal: 25,
        monthTotal: 100
      }
    }

    try {
      const { data, error } = await supabase
        .from('submission_stats')
        .select('*')
        .single()

      if (error) throw error

      return data
    } catch (err: any) {
      console.error('Failed to fetch stats:', err)
      return null
    }
  }

  // アチーブメント確認
  const checkAndGrantAchievements = async (submissionId: string) => {
    // 連続提出日数の確認
    const { data: recentSubmissions } = await supabase
      .from('submissions')
      .select('submitted_at')
      .eq('staff_id', user?.id)
      .order('submitted_at', { ascending: false })
      .limit(7)

    if (recentSubmissions && recentSubmissions.length >= 7) {
      // 7日連続提出のアチーブメント
      const { error } = await supabase
        .from('achievements')
        .insert({
          staff_id: user?.id,
          type: 'streak_7',
          title: '7日連続提出',
          description: '7日間連続で報告書を提出しました',
          icon: '🔥',
          points: 100
        })

      if (!error) {
        console.log('Achievement unlocked: 7日連続提出!')
      }
    }
  }

  // 質問への回答（管理者用）
  const respondToQuestion = async (
    submissionId: string,
    response: string
  ) => {
    if (isUsingMockData) {
      console.log('Mock: Respond to question', { submissionId, response })
      return { success: true }
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          admin_response: response,
          admin_responded_at: new Date().toISOString(),
          admin_responded_by: user?.id
        })
        .eq('id', submissionId)

      if (error) throw error

      // 通知を送信
      await supabase
        .from('notifications')
        .insert({
          staff_id: (await supabase
            .from('submissions')
            .select('staff_id')
            .eq('id', submissionId)
            .single()).data?.staff_id,
          type: 'question_response',
          title: '質問への回答があります',
          message: response,
          channel: 'in_app'
        })

      return { success: true }
    } catch (err: any) {
      console.error('Failed to respond to question:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    reportTemplates,
    submissions,
    isLoading,
    error,
    submitReport,
    createReportTemplate,
    getSubmissionStats,
    respondToQuestion,
    refetch: {
      templates: fetchReportTemplates,
      submissions: fetchSubmissions
    }
  }
}