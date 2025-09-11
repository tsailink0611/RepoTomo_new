import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SupabaseConnectionTest } from '../common/SupabaseConnectionTest'

export function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
      console.log('PWA install prompt captured')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log('Install prompt outcome:', outcome)
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="max-w-4xl w-full px-4">
        {/* インストールボタン（テスト用） */}
        {showInstallButton && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <button onClick={handleInstallClick} className="font-semibold">
              📱 アプリをインストール
            </button>
          </div>
        )}

        {/* メインタイトル */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-600 mb-4">
            🎉 RepoTomo
          </h1>
          <p className="text-xl text-gray-600">
            心理的安全性重視の報告書管理システム
          </p>
          
          {/* PWA情報表示（デバッグ用） */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Service Worker: {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? '✅ サポート' : '❌ 未サポート'}</p>
            <p>PWA Installable: {showInstallButton ? '✅ インストール可能' : '⏳ 待機中'}</p>
          </div>
          
          {/* 手動インストールボタン（テスト用） */}
          <div className="mt-6">
            <button 
              onClick={() => {
                if (deferredPrompt) {
                  handleInstallClick()
                } else {
                  alert('この機能はHTTPS環境または対応ブラウザで利用できます。\n\n手動でインストール:\n1. ブラウザメニュー（︙）\n2. 「アプリをインストール」または「ホーム画面に追加」')
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              📱 PWAアプリをインストール
            </button>
          </div>
        </div>

        {/* 入り口選択 */}
        <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
          {/* スタッフ用入り口 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-orange-600 mb-3">
                スタッフの方
              </h2>
              <p className="text-gray-600 mb-6">
                報告書の提出はこちらから<br/>
                お疲れさまです！
              </p>
              <Link 
                to="/staff"
                className="block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                報告書を提出する
              </Link>
            </div>
          </div>

          {/* 管理者用入り口 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-center">
              <div className="text-6xl mb-4">🛡️</div>
              <h2 className="text-2xl font-bold text-purple-600 mb-3">
                管理者の方
              </h2>
              <p className="text-gray-600 mb-6">
                管理ダッシュボード<br/>
                パスワードが必要です
              </p>
              <Link 
                to="/admin"
                className="block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                管理者ログイン
              </Link>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-12 text-gray-500">
          <p>困ったときはお気軽にお声がけください</p>
        </div>

        {/* Supabase接続テスト */}
        <SupabaseConnectionTest />
      </div>
    </div>
  )
}