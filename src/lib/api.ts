import { supabase } from './supabase'
import { mockStaff, mockReportTemplates } from './simpleMockData'
import { Staff, ReportTemplate, Question, Submission } from '../types/database'

// ApiResponseは循環参照を避けるため直接定義
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// mockQuestionsは一時的に空配列として定義
const mockQuestions: any[] = []

const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development'

// 開発モードでのモックAPI
const mockApi = {
  // スタッフ関連
  async getStaff(): Promise<ApiResponse<Staff[]>> {
    await new Promise(resolve => setTimeout(resolve, 500)) // 遅延をシミュレート
    return { data: mockStaff }
  },

  async getStaffById(id: string): Promise<ApiResponse<Staff>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const staff = mockStaff.find(s => s.id === id)
    if (!staff) {
      return { error: 'スタッフが見つかりません' }
    }
    return { data: staff }
  },

  // 報告書テンプレート関連
  async getReportTemplates(): Promise<ApiResponse<ReportTemplate[]>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { data: mockReportTemplates }
  },

  async getQuestionsByTemplateId(templateId: string): Promise<ApiResponse<Question[]>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const questions = mockQuestions.filter(q => q.template_id === templateId)
    return { data: questions }
  },

  // 提出関連
  async submitReport(data: any): Promise<ApiResponse<Submission>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    const submission: Submission = {
      id: `submission_${Date.now()}`,
      report_id: data.reportId,
      staff_id: data.staffId,
      answers: data.answers,
      mood: data.mood,
      has_question: data.hasQuestion,
      question: data.question,
      is_answered: false,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    return { data: submission, message: '提出が完了しました！お疲れさまでした😊' }
  }
}

// 本番用Supabase API
const productionApi = {
  async getStaff(): Promise<ApiResponse<Staff[]>> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
    
    if (error) return { error: error.message }
    return { data: data || [] }
  },

  async getStaffById(id: string): Promise<ApiResponse<Staff>> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return { error: error.message }
    return { data }
  },

  async getReportTemplates(): Promise<ApiResponse<ReportTemplate[]>> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
    
    if (error) return { error: error.message }
    return { data: data || [] }
  },

  async getQuestionsByTemplateId(templateId: string): Promise<ApiResponse<Question[]>> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('template_id', templateId)
      .order('order', { ascending: true })
    
    if (error) return { error: error.message }
    return { data: data || [] }
  },

  async submitReport(data: any): Promise<ApiResponse<Submission>> {
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        report_id: data.reportId,
        staff_id: data.staffId,
        answers: data.answers,
        mood: data.mood,
        has_question: data.hasQuestion,
        question: data.question
      })
      .select()
      .single()
    
    if (error) return { error: error.message }
    return { data: submission, message: '提出が完了しました！' }
  }
}

// 環境に応じてAPIを切り替え
export const api = isDevelopment ? mockApi : productionApi