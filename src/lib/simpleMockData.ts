// Question型を使わないシンプルなモックデータ
export const mockStaff = [
  {
    id: '1',
    staff_id: 'staff001',
    name: '田中太郎',
    line_user_id: 'line_001',
    role: 'STAFF' as const,
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
    role: 'MANAGER' as const,
    department: 'マネージメント', 
    is_active: true,
    preferred_reminder_time: '17:00',
    notification_settings: { line: true, push: true, email: true },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
]

export const mockReportTemplates = [
  {
    id: 'template_1',
    title: '日報',
    description: '今日も一日お疲れさまでした！',
    frequency: 'DAILY' as const,
    due_time: '18:00',
    reminder_message: '優しく、お疲れさまです！今日の振り返りをお願いします😊',
    is_active: true,
    emoji: '☀️',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
]

export const mockSubmissions = []