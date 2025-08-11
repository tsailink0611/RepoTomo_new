import { useState, useEffect } from 'react'

export interface ReportTemplate {
  id: string
  name: string
  description: string
  emoji: string
  frequency: string
  deadline: string
  category: string
  createdAt: string
  isActive: boolean
}

export interface ReportSubmission {
  id: string
  reportId: string
  reportName: string
  userId: string
  userName: string
  status: '提出完了' | '質問あり' | '一部完了' | '延長希望'
  documentUrl?: string
  message?: string
  submittedAt: string
}

const STORAGE_KEYS = {
  REPORT_TEMPLATES: 'repotomo_report_templates',
  REPORT_SUBMISSIONS: 'repotomo_report_submissions'
}

// デフォルトの報告書テンプレート
const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: '1',
    name: '日報',
    description: '今日の業務内容を報告',
    emoji: '📝',
    frequency: 'daily',
    deadline: '毎日 18:00まで',
    category: 'regular',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '2',
    name: '週報',
    description: '今週の振り返り',
    emoji: '📊',
    frequency: 'weekly',
    deadline: '毎週金曜 17:00まで',
    category: 'regular',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '3',
    name: '月報',
    description: '月次業績の報告',
    emoji: '📈',
    frequency: 'monthly',
    deadline: '毎月末日 17:00まで',
    category: 'regular',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '4',
    name: 'ネパール育成週報',
    description: '育成進捗の報告',
    emoji: '🇳🇵',
    frequency: 'weekly',
    deadline: '毎週日曜 20:00まで',
    category: 'training',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '5',
    name: 'MTG議事録',
    description: '会議の記録と共有',
    emoji: '📋',
    frequency: 'custom',
    deadline: '会議後24時間以内',
    category: 'event',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '6',
    name: '衛生チェック報告',
    description: '店舗衛生状況の確認',
    emoji: '🧽',
    frequency: 'daily',
    deadline: '毎日 営業終了時',
    category: 'maintenance',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '7',
    name: 'アルバイト報告',
    description: 'アルバイトの状況報告',
    emoji: '👥',
    frequency: 'monthly',
    deadline: '毎月15日 17:00まで',
    category: 'regular',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '8',
    name: 'シフト確定',
    description: '来月のシフト表提出',
    emoji: '📅',
    frequency: 'monthly',
    deadline: '毎月25日 17:00まで',
    category: 'regular',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '9',
    name: '改善提案',
    description: 'アイデアを共有',
    emoji: '💡',
    frequency: 'custom',
    deadline: '随時受付中',
    category: 'special',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '10',
    name: 'その他・特別報告',
    description: 'イベント・研修・特別業務等',
    emoji: '📋',
    frequency: 'custom',
    deadline: '不定期・管理者指定',
    category: 'special',
    createdAt: '2025-01-01T00:00:00.000Z',
    isActive: true
  }
]

export const useReports = () => {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [reportSubmissions, setReportSubmissions] = useState<ReportSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初期化：ローカルストレージからデータを読み込み
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem(STORAGE_KEYS.REPORT_TEMPLATES)
      const savedSubmissions = localStorage.getItem(STORAGE_KEYS.REPORT_SUBMISSIONS)

      if (savedTemplates) {
        setReportTemplates(JSON.parse(savedTemplates))
      } else {
        // 初回起動時はデフォルトテンプレートを設定
        setReportTemplates(DEFAULT_TEMPLATES)
        localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES))
      }

      if (savedSubmissions) {
        setReportSubmissions(JSON.parse(savedSubmissions))
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error)
      setReportTemplates(DEFAULT_TEMPLATES)
    }
    
    setIsLoading(false)
  }, [])

  // 報告書テンプレートを追加
  const addReportTemplate = (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'isActive'>) => {
    const newTemplate: ReportTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: true
    }
    
    const updatedTemplates = [...reportTemplates, newTemplate]
    setReportTemplates(updatedTemplates)
    localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify(updatedTemplates))
    
    return newTemplate
  }

  // 報告書提出を追加
  const addReportSubmission = (submission: Omit<ReportSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: ReportSubmission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    }
    
    const updatedSubmissions = [...reportSubmissions, newSubmission]
    setReportSubmissions(updatedSubmissions)
    localStorage.setItem(STORAGE_KEYS.REPORT_SUBMISSIONS, JSON.stringify(updatedSubmissions))
    
    return newSubmission
  }

  // 提出状況の統計を取得
  const getSubmissionStats = () => {
    const today = new Date().toDateString()
    const todaySubmissions = reportSubmissions.filter(
      sub => new Date(sub.submittedAt).toDateString() === today
    )

    return {
      todayTotal: todaySubmissions.length,
      todayCompleted: todaySubmissions.filter(sub => sub.status === '提出完了').length,
      todayQuestions: todaySubmissions.filter(sub => sub.status === '質問あり').length,
      todayPartial: todaySubmissions.filter(sub => sub.status === '一部完了').length,
      todayExtension: todaySubmissions.filter(sub => sub.status === '延長希望').length,
      totalSubmissions: reportSubmissions.length
    }
  }

  // 最近の提出履歴を取得
  const getRecentSubmissions = (limit: number = 10) => {
    return reportSubmissions
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, limit)
  }

  return {
    reportTemplates,
    reportSubmissions,
    isLoading,
    addReportTemplate,
    addReportSubmission,
    getSubmissionStats,
    getRecentSubmissions
  }
}