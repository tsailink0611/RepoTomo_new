import { useState, useEffect } from 'react'
import { supabase, isUsingMockData } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../types/database'

type Notification = Database['public']['Tables']['notifications']['Row']

interface RealtimeNotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth()
  const [state, setState] = useState<RealtimeNotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true
  })

  useEffect(() => {
    if (!isUsingMockData && user) {
      // 初期通知を取得
      fetchNotifications()

      // リアルタイム通知のサブスクリプション設定
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `staff_id=eq.${user.id}`
          },
          (payload) => {
            handleNewNotification(payload.new as Notification)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `staff_id=eq.${user.id}`
          },
          (payload) => {
            handleNotificationUpdate(payload.new as Notification)
          }
        )
        .subscribe()

      // ブラウザ通知の許可を求める
      requestNotificationPermission()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('staff_id', user?.id)
        .order('sent_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const notifications = data || []
      const unreadCount = notifications.filter(n => !n.is_read).length

      setState({
        notifications,
        unreadCount,
        isLoading: false
      })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleNewNotification = (notification: Notification) => {
    setState(prev => ({
      notifications: [notification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
      isLoading: false
    }))

    // ブラウザ通知を表示
    showBrowserNotification(notification)

    // 音を鳴らす（オプション）
    playNotificationSound()
  }

  const handleNotificationUpdate = (updatedNotification: Notification) => {
    setState(prev => {
      const notifications = prev.notifications.map(n =>
        n.id === updatedNotification.id ? updatedNotification : n
      )
      const unreadCount = notifications.filter(n => !n.is_read).length
      
      return {
        ...prev,
        notifications,
        unreadCount
      }
    })
  }

  const markAsRead = async (notificationId: string) => {
    if (isUsingMockData) {
      console.log('Mock: Mark notification as read', notificationId)
      return
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (isUsingMockData) {
      console.log('Mock: Mark all notifications as read')
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }))
      return
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('staff_id', user?.id)
        .eq('is_read', false)

      if (error) throw error

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }))
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const sendNotification = async (
    targetStaffId: string,
    notification: {
      type: 'reminder' | 'question_response' | 'system' | 'achievement' | 'deadline'
      title: string
      message: string
      channel?: 'line' | 'email' | 'push' | 'in_app'
      metadata?: any
    }
  ) => {
    if (isUsingMockData) {
      console.log('Mock: Send notification', { targetStaffId, notification })
      return { success: true }
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          staff_id: targetStaffId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          channel: notification.channel || 'in_app',
          metadata: notification.metadata || {},
          is_read: false
        })

      if (error) throw error

      return { success: true }
    } catch (err: any) {
      console.error('Failed to send notification:', err)
      return { success: false, error: err.message }
    }
  }

  // ブラウザ通知の許可をリクエスト
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      console.log('Notification permission:', permission)
    }
  }

  // ブラウザ通知を表示
  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.type === 'question_response'
      })

      browserNotification.onclick = () => {
        window.focus()
        markAsRead(notification.id)
        browserNotification.close()
      }
    }
  }

  // 通知音を再生
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3')
      audio.volume = 0.5
      audio.play().catch(err => {
        // 音声の自動再生がブロックされた場合は無視
        console.log('Audio playback blocked:', err)
      })
    } catch (err) {
      console.log('Failed to play notification sound:', err)
    }
  }

  // リアルタイムでのシステム全体通知（管理者用）
  const broadcastSystemNotification = async (
    title: string,
    message: string
  ) => {
    if (isUsingMockData) {
      console.log('Mock: Broadcast system notification', { title, message })
      return { success: true }
    }

    try {
      // 全アクティブスタッフを取得
      const { data: activeStaff, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('is_active', true)

      if (staffError) throw staffError

      // 一括で通知を作成
      const notifications = activeStaff.map(staff => ({
        staff_id: staff.id,
        type: 'system' as const,
        title,
        message,
        channel: 'in_app' as const,
        is_read: false
      }))

      const { error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error

      return { success: true, count: notifications.length }
    } catch (err: any) {
      console.error('Failed to broadcast notification:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    markAsRead,
    markAllAsRead,
    sendNotification,
    broadcastSystemNotification,
    refetch: fetchNotifications
  }
}