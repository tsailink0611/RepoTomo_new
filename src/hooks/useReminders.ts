import { useState, useEffect } from 'react'
import { useReports } from './useReports'
import { useNotifications } from './useNotifications'

export interface ReminderSettings {
  reportId: string
  reportName: string
  frequency: string
  deadline: string
  reminderDays: number[] // 期限何日前に通知するか [3, 1, 0, -1] (3日前、1日前、当日、翌日)
  isActive: boolean
}

export interface PendingReminder {
  id: string
  reportName: string
  type: 'advance' | 'today' | 'overdue' // 事前通知、当日通知、遅延通知
  daysFromDeadline: number
  scheduledAt: string
  targetUsers?: string[] // 特定ユーザーのみ通知する場合
}

const STORAGE_KEY = 'repotomo_reminders'

// デフォルトのリマインダー設定
const DEFAULT_REMINDER_SETTINGS: ReminderSettings[] = [
  {
    reportId: '1',
    reportName: '日報',
    frequency: 'daily',
    deadline: '毎日 18:00まで',
    reminderDays: [0], // 当日のみ
    isActive: true
  },
  {
    reportId: '2',
    reportName: '週報',
    frequency: 'weekly',
    deadline: '毎週金曜 17:00まで',
    reminderDays: [2, 0, 1], // 2日前、当日、翌日
    isActive: true
  },
  {
    reportId: '3',
    reportName: '月報',
    frequency: 'monthly',
    deadline: '毎月末日 17:00まで',
    reminderDays: [3, 1, 0, 1], // 3日前、1日前、当日、翌日
    isActive: true
  }
]

export const useReminders = () => {
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings[]>([])
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([])
  // const { reportTemplates } = useReports() // 一時的にコメントアウト
  const { sendReportReminder } = useNotifications()

  // 初期化
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setReminderSettings(JSON.parse(saved))
      } else {
        // デフォルト設定を保存
        setReminderSettings(DEFAULT_REMINDER_SETTINGS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REMINDER_SETTINGS))
      }
    } catch (error) {
      console.error('リマインダー設定の読み込みに失敗:', error)
      setReminderSettings(DEFAULT_REMINDER_SETTINGS)
    }
  }, [])

  // 期限チェック（シンプル版）
  const checkDeadlines = () => {
    const now = new Date()
    const today = now.getDay() // 0=日曜, 1=月曜...
    const hour = now.getHours()
    const newReminders: PendingReminder[] = []

    reminderSettings.forEach(setting => {
      if (!setting.isActive) return

      let shouldRemind = false
      let reminderType: 'advance' | 'today' | 'overdue' = 'today'

      // 簡単な期限チェックロジック
      if (setting.frequency === 'daily') {
        // 日報: 毎日18時前に通知
        if (hour >= 16 && hour < 18) {
          shouldRemind = true
          reminderType = 'today'
        } else if (hour >= 18) {
          shouldRemind = true
          reminderType = 'overdue'
        }
      } else if (setting.frequency === 'weekly') {
        // 週報: 金曜日に通知
        if (today === 5) { // 金曜日
          if (hour >= 15 && hour < 17) {
            shouldRemind = true
            reminderType = 'today'
          } else if (hour >= 17) {
            shouldRemind = true
            reminderType = 'overdue'
          }
        } else if (today === 3) { // 水曜日（2日前）
          shouldRemind = true
          reminderType = 'advance'
        }
      } else if (setting.frequency === 'monthly') {
        // 月報: 月末近くに通知
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const currentDay = now.getDate()
        
        if (currentDay >= lastDay - 3) {
          shouldRemind = true
          reminderType = currentDay === lastDay ? 'today' : 'advance'
        }
      }

      if (shouldRemind) {
        newReminders.push({
          id: `${setting.reportId}-${Date.now()}`,
          reportName: setting.reportName,
          type: reminderType,
          daysFromDeadline: 0, // 簡略化
          scheduledAt: now.toISOString()
        })
      }
    })

    setPendingReminders(newReminders)
    return newReminders
  }

  // リマインダーを送信
  const sendReminders = () => {
    const reminders = checkDeadlines()
    
    reminders.forEach(reminder => {
      const message = generateReminderMessage(reminder)
      
      // 実際のLINE通知を送信
      sendReportReminder(reminder.reportName)
      
      console.log('📱 リマインダー送信:', {
        report: reminder.reportName,
        type: reminder.type,
        message
      })
    })

    return reminders.length
  }

  // リマインダーメッセージを生成
  const generateReminderMessage = (reminder: PendingReminder): string => {
    const { reportName, type } = reminder
    
    switch (type) {
      case 'advance':
        return `📅 ${reportName}の期限が近づいています。お時間のある時にご準備をお願いします。`
      case 'today':
        return `📌 本日が${reportName}の提出期限です。お忙しい中恐縮ですが、よろしくお願いします。`
      case 'overdue':
        return `⚠️ ${reportName}の期限を過ぎております。お手すきの際にご対応をお願いします。`
      default:
        return `📋 ${reportName}についてのお知らせです。`
    }
  }

  // 自動リマインダーを開始（デモ用）
  const startAutoReminder = () => {
    // 実際の運用では cron job やサーバーサイドで実行
    const interval = setInterval(() => {
      const count = sendReminders()
      if (count > 0) {
        console.log(`${count}件のリマインダーを送信しました`)
      }
    }, 60000) // 1分ごとにチェック（デモ用）

    return () => clearInterval(interval)
  }

  // 手動でリマインダーテストを送信
  const sendTestReminder = (reportName: string) => {
    sendReportReminder(reportName)
    console.log(`テストリマインダー送信: ${reportName}`)
  }

  return {
    reminderSettings,
    pendingReminders,
    checkDeadlines,
    sendReminders,
    generateReminderMessage,
    startAutoReminder,
    sendTestReminder
  }
}