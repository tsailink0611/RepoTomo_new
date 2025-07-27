import { Staff, ReportTemplate, Submission, Question } from '../types/database'

// モックスタッフデータ
export const mockStaff: Staff[] = [
  {
    id: '1',
    staff_id: 'staff001',
    name: '田中太郎',
    line_user_id: 'line_001',
    role: 'STAFF',
    department: 'ホール',
    is_active: true,
    preferred_reminder_time: '18:00',
    notification_settings: { line: true, push: true, email: false },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    staff_id: 'manager001',
    name: '佐藤花子',
    role: 'MANAGER',
    department: 'マネージメント',
    is_active: true,
    preferred_reminder_time: '17:00',
    notification_settings: { line: true, push: true, email: true },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
]

// モック報告書テンプレート
export const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'template_1',
    title: '日報',
    description: '今日も一日お疲れさまでした！',
    frequency: 'DAILY',
    due_time: '18:00',
    reminder_message: '優しく、お疲れさまです！今日の振り返りをお願いします😊',
    is_active: true,
    emoji: '☀️',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'template_2',
    title: '週報',
    description: '今週の振り返りをお願いします',
    frequency: 'WEEKLY',
    due_time: '17:00',
    reminder_message: 'お疲れさまです！今週はいかがでしたか？😊',
    is_active: true,
    emoji: '📅',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
]

// モック質問項目
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    template_id: 'template_1',
    text: '今日の業務内容を教えてください',
    type: 'TEXTAREA',
    is_required: true,
    order: 1,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'q2',
    template_id: 'template_1',
    text: '今日の調子はどうでしたか？',
    type: 'SCALE_1_TO_5',
    is_required: false,
    order: 2,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'q3',
    template_id: 'template_1',
    text: '困ったことはありましたか？',
    type: 'YES_NO',
    is_required: false,
    order: 3,
    created_at: '2025-01-01T00:00:00Z'
  }
]