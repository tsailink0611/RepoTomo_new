// データベース型定義
export interface Staff {
  id: string
  staff_id: string
  name: string
  line_user_id?: string
  role: 'STAFF' | 'MANAGER' | 'ADMIN'
  department?: string
  is_active: boolean
  preferred_reminder_time: string
  notification_settings: {
    line: boolean
    push: boolean
    email: boolean
  }
  created_at: string
  updated_at: string
}

export interface ReportTemplate {
  id: string
  title: string
  description?: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  due_time: string
  reminder_message: string
  is_active: boolean
  emoji: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  template_id: string
  text: string
  type: 'TEXT' | 'TEXTAREA' | 'CHOICE' | 'MULTIPLE' | 'SCALE_1_TO_5' | 'YES_NO'
  options?: string[]
  is_required: boolean
  order: number
  created_at: string
}

export interface Submission {
  id: string
  report_id: string
  staff_id: string
  answers: Record<string, any>
  mood: 'happy' | 'neutral' | 'need_help'
  has_question: boolean
  question?: string
  is_answered: boolean
  admin_reply?: string
  replied_at?: string
  submitted_at: string
  created_at: string
}

export interface Consultation {
  id: string
  submission_id?: string
  staff_id: string
  title: string
  content: string
  is_anonymous: boolean
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  admin_reply?: string
  replied_at?: string
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  staff_id: string
  type: string
  title: string
  description?: string
  icon?: string
  earned_at: string
  metadata?: Record<string, any>
}