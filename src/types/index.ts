export * from './database'

import { Staff } from './database'

// 認証関連の型
export interface User {
  id: string
  email?: string
  staff?: Staff
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// UI関連の型
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// フォーム関連の型
export interface ReportFormData {
  reportId: string
  answers: Record<string, any>
  mood: 'happy' | 'neutral' | 'need_help'
  hasQuestion: boolean
  question?: string
}

export interface ConsultationFormData {
  title: string
  content: string
  isAnonymous: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

// API レスポンス型
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// 統計情報型
export interface Statistics {
  submissionRate: number
  averageResponseTime: number
  moodDistribution: {
    happy: number
    neutral: number
    needHelp: number
  }
  totalSubmissions: number
  pendingConsultations: number
}