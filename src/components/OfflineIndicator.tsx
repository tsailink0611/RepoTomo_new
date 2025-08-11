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

// オフライン時の表示コンポーネント
export const OfflineIndicator = () => {
  const { isOnline } = useOffline()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" 
          />
        </svg>
        <span className="font-medium">オフラインモード - データは復帰後に同期されます</span>
      </div>
    </div>
  )
}