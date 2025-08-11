import { useState, useEffect } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'reminder' | 'question' | 'response' | 'system'
  targetUserId?: string
  targetUserName?: string
  reportName?: string
  isRead: boolean
  createdAt: string
}

const STORAGE_KEY = 'repotomo_notifications'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初期化：ローカルストレージからデータを読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setNotifications(JSON.parse(saved))
      }
    } catch (error) {
      console.error('通知データの読み込みに失敗しました:', error)
    }
    setIsLoading(false)
  }, [])

  // 通知を追加
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    }

    const updatedNotifications = [newNotification, ...notifications]
    setNotifications(updatedNotifications)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications))

    // 模擬LINE通知（実際のプロダクションではLINE APIを使用）
    if (typeof window !== 'undefined') {
      console.log('📱 模擬LINE通知:', {
        to: notification.targetUserName || '全スタッフ',
        title: notification.title,
        message: notification.message
      })
      
      // デモ用のブラウザ通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    }

    return newNotification
  }

  // 通知を既読にする
  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    )
    setNotifications(updatedNotifications)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications))
  }

  // 全て既読にする
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }))
    setNotifications(updatedNotifications)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications))
  }

  // 未読数を取得
  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length
  }

  // 特定ユーザーの通知を取得
  const getUserNotifications = (userId: string) => {
    return notifications.filter(n => !n.targetUserId || n.targetUserId === userId)
  }

  // 報告書リマインダーを送信（模擬）
  const sendReportReminder = (reportName: string, targetUserId?: string, targetUserName?: string) => {
    const messages = [
      `📅 ${reportName}の期限が近づいています。お時間のある時にご提出をお願いします。`,
      `📌 本日が${reportName}の期限です。お忙しい中恐縮ですが、ご確認をお願いします。`,
      `⏰ ${reportName}の期限を過ぎております。お手すきの際にご対応をお願いします。`
    ]

    return addNotification({
      title: `${reportName}のリマインダー`,
      message: messages[Math.floor(Math.random() * messages.length)],
      type: 'reminder',
      reportName,
      targetUserId,
      targetUserName
    })
  }

  // 質問回答通知を送信（模擬）
  const sendQuestionResponse = (reportName: string, response: string, targetUserId: string, targetUserName: string) => {
    return addNotification({
      title: `${reportName}についてのご回答`,
      message: `お疲れさまです！${reportName}についてのご質問にお答えします：${response}`,
      type: 'response',
      reportName,
      targetUserId,
      targetUserName
    })
  }

  // システム通知を送信
  const sendSystemNotification = (title: string, message: string) => {
    return addNotification({
      title,
      message,
      type: 'system'
    })
  }

  // ブラウザ通知の許可を要求
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  return {
    notifications,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getUserNotifications,
    sendReportReminder,
    sendQuestionResponse,
    sendSystemNotification,
    requestNotificationPermission
  }
}