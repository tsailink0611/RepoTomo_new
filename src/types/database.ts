// データベース型定義（Supabase対応）

// Supabaseの自動生成型に対応するためのベース型
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>
      }
      report_templates: {
        Row: ReportTemplate
        Insert: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>>
      }
      questions: {
        Row: Question
        Insert: Omit<Question, 'id' | 'created_at'>
        Update: Partial<Omit<Question, 'id' | 'created_at'>>
      }
      submissions: {
        Row: Submission
        Insert: Omit<Submission, 'id' | 'created_at'>
        Update: Partial<Omit<Submission, 'id' | 'created_at'>>
      }
      consultations: {
        Row: Consultation
        Insert: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Consultation, 'id' | 'created_at' | 'updated_at'>>
      }
      achievements: {
        Row: Achievement
        Insert: Omit<Achievement, 'id'>
        Update: Partial<Omit<Achievement, 'id'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'sent_at' | 'read_at'>
        Update: Partial<Omit<Notification, 'id' | 'sent_at' | 'read_at'>>
      }
    }
  }
}

export interface Staff {
  id: string
  staff_id: string
  name: string
  email?: string
  line_user_id?: string
  role: 'STAFF' | 'MANAGER' | 'ADMIN'
  is_active: boolean
  preferred_reminder_time?: string
  notification_settings?: Json
  created_at?: string
  updated_at?: string
}

export interface ReportTemplate {
  id: string
  name: string
  description?: string
  emoji?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'biweekly' | 'custom'
  deadline?: string
  category: 'regular' | 'special' | 'training' | 'maintenance' | 'event'
  questions?: Json
  is_active: boolean
  required_roles?: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Question {
  id: string
  report_template_id: string
  question_text: string
  question_type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'time' | 'boolean'
  options?: Json
  is_required: boolean
  order_index: number
  created_at?: string
}

export interface Submission {
  id: string
  staff_id: string
  report_id: string
  status: 'pending' | 'completed' | 'partial' | 'has_question' | 'extension_requested'
  answers?: Json
  mood?: 'happy' | 'neutral' | 'need_help'
  has_question: boolean
  question?: string
  message?: string
  document_url?: string
  attachments?: Json
  submitted_at: string
  due_date?: string
  completed_at?: string
  admin_response?: string
  admin_responded_at?: string
  admin_responded_by?: string
  created_at?: string
}

export interface Consultation {
  id: string
  staff_id: string
  category: string
  subject: string
  content: string
  urgency: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: string
  response?: string
  responded_at?: string
  created_at?: string
  updated_at?: string
}

export interface Achievement {
  id: string
  staff_id: string
  type: string
  title: string
  description?: string
  icon?: string
  points?: number
  earned_at: string
  metadata?: Json
}

export interface Notification {
  id: string
  staff_id: string
  type: 'reminder' | 'question_response' | 'system' | 'achievement' | 'deadline'
  title: string
  message: string
  channel?: 'line' | 'email' | 'push' | 'in_app'
  is_read: boolean
  metadata?: Json
  sent_at: string
  read_at?: string
}