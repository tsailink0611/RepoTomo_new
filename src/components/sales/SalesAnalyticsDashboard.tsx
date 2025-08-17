// 売上分析ダッシュボードコンポーネント
// 作成日: 2025-08-17

import React, { useState, useEffect } from 'react'
import { useSalesAnalytics } from '../../hooks/useSalesAnalytics'
import { useAuth } from '../../hooks/useAuth'
import type { SalesFilterOptions } from '../../types/sales.types'

// チャートコンポーネント（シンプル版）
const SimpleChart: React.FC<{
  data: { label: string; value: number }[]
  title: string
  type?: 'bar' | 'line'
}> = ({ data, title, type = 'bar' }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-16 text-sm text-gray-600">{item.label}</div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-sm font-medium text-right">
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// アラートカードコンポーネント
const AlertCard: React.FC<{
  alert: any
  onAcknowledge: (alertId: string) => void
}> = ({ alert, onAcknowledge }) => {
  const severityColors = {
    low: 'bg-blue-50 border-blue-200 text-blue-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    high: 'bg-orange-50 border-orange-200 text-orange-800',
    critical: 'bg-red-50 border-red-200 text-red-800'
  }

  const severityIcons = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '🔸',
    critical: '🚨'
  }

  return (
    <div className={`border rounded-lg p-4 ${severityColors[alert.severity as keyof typeof severityColors]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-xl">{severityIcons[alert.severity as keyof typeof severityIcons]}</span>
          <div>
            <h4 className="font-semibold">{alert.title}</h4>
            <p className="text-sm mt-1">{alert.message}</p>
            {alert.percentage_change && (
              <p className="text-xs mt-2">
                変化率: {alert.percentage_change > 0 ? '+' : ''}{alert.percentage_change}%
              </p>
            )}
          </div>
        </div>
        {alert.action_required && !alert.acknowledged_at && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="bg-white bg-opacity-50 hover:bg-opacity-75 px-3 py-1 rounded text-sm transition"
          >
            確認
          </button>
        )}
      </div>
    </div>
  )
}

export const SalesAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth()
  const {
    stores,
    salesData,
    alerts,
    targets,
    isLoading,
    error,
    fetchSalesData,
    acknowledgeAlert,
    calculateSalesSummary,
    clearError
  } = useSalesAnalytics()
  
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 7)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  })
  const [analysisView, setAnalysisView] = useState<'overview' | 'trends' | 'alerts' | 'targets'>('overview')

  // フィルター適用
  useEffect(() => {
    const filters: SalesFilterOptions = {
      date_range: dateRange,
      ...(selectedStore && { store_ids: [selectedStore] })
    }
    fetchSalesData(filters)
  }, [selectedStore, dateRange, fetchSalesData])

  // アラート確認処理
  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!user?.id) return
    try {
      await acknowledgeAlert(alertId, user.id)
    } catch (error) {
      console.error('アラート確認に失敗:', error)
    }
  }

  // 売上サマリーの計算
  const salesSummary = calculateSalesSummary(salesData, `${dateRange.start} 〜 ${dateRange.end}`)

  // 日別売上データの準備
  const dailySalesData = salesData.reduce((acc, item) => {
    const existing = acc.find(d => d.label === item.date)
    if (existing) {
      existing.value += item.revenue
    } else {
      acc.push({ label: item.date, value: item.revenue })
    }
    return acc
  }, [] as { label: string; value: number }[])
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-7) // 最新7日分

  // 時間別売上データの準備
  const hourlySalesData = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 10 // 10時〜21時
    const hourlyData = salesData.filter(item => item.hour_slot === hour)
    const totalRevenue = hourlyData.reduce((sum, item) => sum + item.revenue, 0)
    return {
      label: `${hour}:00`,
      value: totalRevenue
    }
  })

  if (isLoading && salesData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">売上データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 売上分析ダッシュボード</h1>
              <p className="text-gray-600 mt-1">リアルタイム売上データとAI分析</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 店舗選択 */}
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全店舗</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              
              {/* 期間選択 */}
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">〜</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* タブナビゲーション */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: '概要', icon: '📈' },
                { key: 'trends', label: '傾向分析', icon: '📊' },
                { key: 'alerts', label: 'アラート', icon: '🚨' },
                { key: 'targets', label: '目標', icon: '🎯' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setAnalysisView(tab.key as any)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                    analysisView === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {analysisView === 'overview' && (
          <div className="space-y-8">
            {/* サマリーカード */}
            <div className="grid gap-6 md:grid-cols-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">総売上</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ¥{salesSummary.total_revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">🛒</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">取引数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesSummary.total_transactions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">客数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesSummary.total_customers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-orange-600 text-xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">客単価</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ¥{Math.round(salesSummary.average_order_value).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* チャート */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SimpleChart
                data={dailySalesData}
                title="日別売上推移"
                type="line"
              />
              <SimpleChart
                data={hourlySalesData}
                title="時間帯別売上"
                type="bar"
              />
            </div>
          </div>
        )}

        {analysisView === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">売上アラート</h2>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                {alerts.filter(alert => !alert.acknowledged_at).length}件 未確認
              </span>
            </div>
            
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledgeAlert}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <span className="text-4xl mb-4 block">✅</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">アラートはありません</h3>
                <p className="text-gray-600">現在、注意が必要な売上異常は検出されていません。</p>
              </div>
            )}
          </div>
        )}

        {analysisView === 'targets' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">売上目標</h2>
            
            {targets.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {targets.map(target => {
                  const currentRevenue = salesSummary.total_revenue
                  const progress = (currentRevenue / target.revenue_target) * 100
                  
                  return (
                    <div key={target.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {target.target_type === 'monthly' ? '月次目標' : '目標'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-sm ${
                          progress >= 100 ? 'bg-green-100 text-green-800' :
                          progress >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>売上進捗</span>
                            <span>¥{currentRevenue.toLocaleString()} / ¥{target.revenue_target.toLocaleString()}</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                progress >= 100 ? 'bg-green-500' :
                                progress >= 80 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          期間: {target.period_start} 〜 {target.period_end}
                        </div>
                        
                        {target.notes && (
                          <div className="text-sm text-gray-500 bg-gray-50 rounded p-2">
                            {target.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <span className="text-4xl mb-4 block">🎯</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">売上目標が設定されていません</h3>
                <p className="text-gray-600">管理者に売上目標の設定を依頼してください。</p>
              </div>
            )}
          </div>
        )}

        {analysisView === 'trends' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">傾向分析</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">AI分析機能</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-blue-500 text-xl mr-3">🤖</span>
                  <div>
                    <p className="text-blue-700 font-medium">Amazon Bedrock AI分析</p>
                    <p className="text-blue-600 text-sm">
                      この機能は開発中です。AWS Lambda + Bedrock統合により、
                      高度な売上傾向分析と予測機能を提供予定です。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 基本的な傾向分析 */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">ピーク時間分析</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>最も売上の高い時間:</span>
                    <span className="font-medium">{salesSummary.peak_hour}:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最も売上の高い日:</span>
                    <span className="font-medium">{salesSummary.peak_day || 'データなし'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">決済方法分析</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>現金:</span>
                    <span>{Math.round(salesSummary.payment_method_distribution.cash * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>カード:</span>
                    <span>{Math.round(salesSummary.payment_method_distribution.card * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>モバイル:</span>
                    <span>{Math.round(salesSummary.payment_method_distribution.mobile * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}