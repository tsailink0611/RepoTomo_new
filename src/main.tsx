import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// PWA Service Workerの登録
const updateSW = registerSW({
  onNeedRefresh() {
    // 新しいバージョンが利用可能な場合
    if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log('オフラインで使用する準備ができました')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
