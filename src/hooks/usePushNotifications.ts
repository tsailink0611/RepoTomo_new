import { useState, useEffect } from 'react'
import { supabase, isUsingMockData } from '../lib/supabase'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // プッシュ通知がサポートされているかチェック
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      // 既存のサブスクリプションを取得
      getExistingSubscription()
    }
  }, [])

  // 既存のプッシュ通知サブスクリプションを取得
  const getExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        const subscriptionJSON = existingSubscription.toJSON()
        setSubscription({
          endpoint: subscriptionJSON.endpoint!,
          keys: {
            p256dh: subscriptionJSON.keys!.p256dh as string,
            auth: subscriptionJSON.keys!.auth as string
          }
        })
      }
    } catch (error) {
      console.error('Failed to get existing subscription:', error)
    }
  }

  // プッシュ通知の許可をリクエスト
  const requestPermission = async () => {
    if (!isSupported) {
      console.log('Push notifications are not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        // サブスクリプションを作成
        await subscribeToPush()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  // プッシュ通知をサブスクライブ
  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // VAPID公開鍵（実際の実装では環境変数から取得）
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'dummy-key'
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      const subscriptionJSON = pushSubscription.toJSON()
      const newSubscription = {
        endpoint: subscriptionJSON.endpoint!,
        keys: {
          p256dh: subscriptionJSON.keys!.p256dh as string,
          auth: subscriptionJSON.keys!.auth as string
        }
      }

      setSubscription(newSubscription)

      // サーバーにサブスクリプションを保存
      await saveSubscriptionToServer(newSubscription)

      return newSubscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  // プッシュ通知のサブスクリプションを解除
  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()

      if (pushSubscription) {
        await pushSubscription.unsubscribe()
        setSubscription(null)
        
        // サーバーからサブスクリプションを削除
        await removeSubscriptionFromServer()
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
    }
  }

  // サーバーにサブスクリプションを保存
  const saveSubscriptionToServer = async (sub: PushSubscription) => {
    if (isUsingMockData) {
      console.log('Mock: Saving push subscription', sub)
      localStorage.setItem('push-subscription', JSON.stringify(sub))
      return
    }

    try {
      // Supabase Edge Functionを呼び出す（実装予定）
      const { error } = await supabase.functions.invoke('save-push-subscription', {
        body: { subscription: sub }
      })

      if (error) throw error
    } catch (error) {
      console.error('Failed to save subscription to server:', error)
    }
  }

  // サーバーからサブスクリプションを削除
  const removeSubscriptionFromServer = async () => {
    if (isUsingMockData) {
      console.log('Mock: Removing push subscription')
      localStorage.removeItem('push-subscription')
      return
    }

    try {
      // Supabase Edge Functionを呼び出す（実装予定）
      const { error } = await supabase.functions.invoke('remove-push-subscription')

      if (error) throw error
    } catch (error) {
      console.error('Failed to remove subscription from server:', error)
    }
  }

  // ローカル通知を表示（テスト用）
  const showLocalNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.log('Notification permission not granted')
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'repotomo-notification',
        requireInteraction: false,
        ...options
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  // テストプッシュ通知を送信
  const sendTestNotification = async () => {
    if (!subscription) {
      console.log('No push subscription available')
      return false
    }

    try {
      // サーバーにテスト通知の送信をリクエスト
      if (isUsingMockData) {
        // モックモードではローカル通知を表示
        showLocalNotification('テスト通知', {
          body: 'プッシュ通知が正常に動作しています！',
          data: { test: true }
        })
        return true
      }

      const { error } = await supabase.functions.invoke('send-test-notification')
      if (error) throw error

      return true
    } catch (error) {
      console.error('Failed to send test notification:', error)
      return false
    }
  }

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribeToPush,
    unsubscribe,
    showLocalNotification,
    sendTestNotification
  }
}

// VAPID鍵をUint8Arrayに変換するヘルパー関数
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}