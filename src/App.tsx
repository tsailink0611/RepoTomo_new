import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import React from 'react'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OfflineIndicator } from './components/OfflineIndicator'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { IOSInstallGuide } from './components/IOSInstallGuide'
import { SimpleStaffDashboard } from './components/pages/SimpleStaffDashboard'
import { SimpleStaffPage } from './components/pages/SimpleStaffPage'
import { SimpleAdminDashboard } from './components/pages/SimpleAdminDashboard'
import { HomePage } from './components/pages/HomePage'
import { LoginPage } from './components/pages/LoginPage'
import { TestPage } from './components/pages/TestPage'
import { AdminLoginPage } from './components/pages/AdminLoginPage'

function DashboardPage() {
  const { user } = useAuth()
  const isManager = user?.staff?.role === 'MANAGER' || user?.staff?.role === 'ADMIN'
  
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          ダッシュボード
        </h2>
        <p className="text-gray-600 mb-4">
          ようこそ、{user?.staff?.name || user?.email} さん
        </p>
        <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded mb-6">
          🛡️ このページは認証が必要です
        </div>
        <p className="text-gray-600 mb-6">
          役職: {user?.staff?.role || 'STAFF'}
        </p>
        <div className="space-y-3">
          {isManager ? (
            <a 
              href="/admin/dashboard" 
              className="block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition"
            >
              管理者ダッシュボードへ
            </a>
          ) : (
            <a 
              href="/staff/dashboard" 
              className="block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
            >
              スタッフダッシュボードへ
            </a>
          )}
          <a 
            href="/" 
            className="block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div>
        <OfflineIndicator />
        <PWAInstallPrompt />
        <IOSInstallGuide />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/dashboard" 
            element={
              <ProtectedRoute>
                <SimpleStaffDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requireRole="MANAGER">
                <SimpleAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff" 
            element={<SimpleStaffPage />} 
          />
          <Route 
            path="/admin" 
            element={<AdminLoginPage />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App