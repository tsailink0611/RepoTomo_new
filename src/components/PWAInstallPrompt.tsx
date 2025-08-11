import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // PWAがインストール済みかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // インストールプロンプトを表示するタイミングを制御
      // 初回訪問から3秒後に表示
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      setIsInstalled(true)
      console.log('RepoTomo PWA was installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // インストールプロンプトを表示
    deferredPrompt.prompt()

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // 1週間後に再度表示
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // インストール済み、または表示不要の場合は何も表示しない
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl p-4 z-50 animate-slide-up">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            アプリをインストール
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            RepoTomoをホーム画面に追加して、アプリのように使えます
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              インストール
            </button>
            <button
              onClick={handleDismiss}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              後で
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// iOS Safari用のインストール案内
export const IOSInstallGuide = () => {
  const [showGuide, setShowGuide] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // iOSデバイスかどうかをチェック
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent)
    }

    // スタンドアロンモードでない、かつiOSの場合
    const isIOSSafari = checkIOS() && !window.matchMedia('(display-mode: standalone)').matches
    
    if (isIOSSafari) {
      setIsIOS(true)
      // 初回訪問から5秒後に表示
      setTimeout(() => {
        const dismissed = localStorage.getItem('ios-guide-dismissed')
        if (!dismissed) {
          setShowGuide(true)
        }
      }, 5000)
    }
  }, [])

  const handleDismiss = () => {
    setShowGuide(false)
    localStorage.setItem('ios-guide-dismissed', 'true')
  }

  if (!isIOS || !showGuide) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            ホーム画面に追加
          </h3>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">1️⃣</span>
            </div>
            <p className="text-gray-700">
              下部の共有ボタン
              <svg className="inline-block w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 4.026a9.001 9.001 0 009.032 4.026" />
              </svg>
              をタップ
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">2️⃣</span>
            </div>
            <p className="text-gray-700">
              「ホーム画面に追加」を選択
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">3️⃣</span>
            </div>
            <p className="text-gray-700">
              右上の「追加」をタップ
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition"
        >
          わかりました
        </button>
      </div>
    </div>
  )
}