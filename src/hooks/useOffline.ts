import { useState, useEffect } from 'react'

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // オフラインから復帰した場合の処理
        console.log('Connection restored')
        // データの同期を試みる
        syncOfflineData()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      console.log('Connection lost - entering offline mode')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  // オフライン時のデータをローカルストレージに保存
  const saveOfflineData = (key: string, data: any) => {
    const offlineData = JSON.parse(localStorage.getItem('offline-queue') || '[]')
    offlineData.push({
      key,
      data,
      timestamp: Date.now()
    })
    localStorage.setItem('offline-queue', JSON.stringify(offlineData))
  }

  // オンライン復帰時にデータを同期
  const syncOfflineData = async () => {
    const offlineData = JSON.parse(localStorage.getItem('offline-queue') || '[]')
    
    if (offlineData.length === 0) return

    console.log(`Syncing ${offlineData.length} offline items...`)

    for (const item of offlineData) {
      try {
        // ここで実際のAPI呼び出しを行う
        console.log('Syncing item:', item)
        // await syncItem(item)
      } catch (error) {
        console.error('Failed to sync item:', error)
      }
    }

    // 同期完了後、キューをクリア
    localStorage.removeItem('offline-queue')
  }

  return {
    isOnline,
    wasOffline,
    saveOfflineData,
    syncOfflineData
  }
}