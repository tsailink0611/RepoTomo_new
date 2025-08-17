// 売上分析機能のカスタムフック
// 作成日: 2025-08-17

import { useState, useEffect, useCallback } from 'react'
import { supabase, isUsingMockData } from '../lib/supabase'
import type { 
  SalesData, 
  Store, 
  AIAnalysisResult, 
  SalesAlert, 
  SalesTarget,
  SalesSummary,
  SalesFilterOptions,
  ForecastData
} from '../types/sales.types'

// モックデータ
const mockStores: Store[] = [
  {
    id: '1',
    store_code: 'ST001',
    name: '新宿本店',
    address: '東京都新宿区1-1-1',
    region: '関東',
    store_type: 'restaurant',
    timezone: 'Asia/Tokyo',
    business_hours: {
      mon: { open: '09:00', close: '22:00' },
      tue: { open: '09:00', close: '22:00' },
      wed: { open: '09:00', close: '22:00' },
      thu: { open: '09:00', close: '22:00' },
      fri: { open: '09:00', close: '22:00' },
      sat: { open: '09:00', close: '22:00' },
      sun: { open: '09:00', close: '22:00' }
    },
    settings: {},
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const generateMockSalesData = (days = 7): SalesData[] => {
  const data: SalesData[] = []
  const today = new Date()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    for (let hour = 10; hour <= 21; hour++) {
      const baseRevenue = Math.random() * 50000 + 30000
      const transactions = Math.floor(baseRevenue / 2500)
      
      data.push({
        id: `mock-${i}-${hour}`,
        store_id: '1',
        date: date.toISOString().split('T')[0],
        hour_slot: hour,
        revenue: Math.round(baseRevenue),
        transaction_count: transactions,
        customer_count: Math.floor(transactions * 1.2),
        average_order_value: Math.round(baseRevenue / transactions),
        payment_methods: {
          cash: 0.3,
          card: 0.5,
          mobile: 0.2
        },
        category_breakdown: {
          food: 0.7,
          drink: 0.2,
          dessert: 0.1
        },
        special_events: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }
  
  return data
}

export function useSalesAnalytics() {
  const [stores, setStores] = useState<Store[]>([])
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([])
  const [alerts, setAlerts] = useState<SalesAlert[]>([])
  const [targets, setTargets] = useState<SalesTarget[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 店舗データの取得
  const fetchStores = useCallback(async () => {
    if (isUsingMockData) {
      setStores(mockStores)
      return mockStores
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStores(data || [])
      return data || []
    } catch (err) {
      console.error('店舗データの取得に失敗:', err)
      setError(err instanceof Error ? err.message : '店舗データの取得に失敗しました')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 売上データの取得
  const fetchSalesData = useCallback(async (filters?: SalesFilterOptions) => {
    if (isUsingMockData) {
      const mockData = generateMockSalesData(7)
      setSalesData(mockData)
      return mockData
    }

    setIsLoading(true)
    try {
      let query = supabase
        .from('sales_data')
        .select('*')
        .order('date', { ascending: false })
        .order('hour_slot', { ascending: true })

      if (filters?.store_ids && filters.store_ids.length > 0) {
        query = query.in('store_id', filters.store_ids)
      }

      if (filters?.date_range) {
        query = query
          .gte('date', filters.date_range.start)
          .lte('date', filters.date_range.end)
      }

      if (filters?.time_range) {
        query = query
          .gte('hour_slot', filters.time_range.start_hour)
          .lte('hour_slot', filters.time_range.end_hour)
      }

      const { data, error } = await query

      if (error) throw error
      setSalesData(data || [])
      return data || []
    } catch (err) {
      console.error('売上データの取得に失敗:', err)
      setError(err instanceof Error ? err.message : '売上データの取得に失敗しました')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // AI分析結果の取得
  const fetchAnalysisResults = useCallback(async (storeId?: string, analysisType?: string) => {
    if (isUsingMockData) {
      setAnalysisResults([])
      return []
    }

    setIsLoading(true)
    try {
      let query = supabase
        .from('ai_analysis_results')
        .select('*')
        .order('created_at', { ascending: false })

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      if (analysisType) {
        query = query.eq('analysis_type', analysisType)
      }

      const { data, error } = await query

      if (error) throw error
      setAnalysisResults(data || [])
      return data || []
    } catch (err) {
      console.error('AI分析結果の取得に失敗:', err)
      setError(err instanceof Error ? err.message : 'AI分析結果の取得に失敗しました')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // アラートの取得
  const fetchAlerts = useCallback(async (storeId?: string, unreadOnly = false) => {
    if (isUsingMockData) {
      const mockAlerts: SalesAlert[] = [
        {
          id: 'alert-1',
          store_id: '1',
          alert_type: 'revenue_drop',
          severity: 'high',
          title: '売上急落アラート',
          message: '昨日の売上が前日比30%減少しています。',
          threshold_value: 100000,
          actual_value: 70000,
          percentage_change: -30,
          period_compared: '前日同時刻',
          ai_context: {},
          action_required: true,
          created_at: new Date().toISOString()
        }
      ]
      setAlerts(mockAlerts)
      return mockAlerts
    }

    setIsLoading(true)
    try {
      let query = supabase
        .from('sales_alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      if (unreadOnly) {
        query = query.is('acknowledged_at', null)
      }

      const { data, error } = await query

      if (error) throw error
      setAlerts(data || [])
      return data || []
    } catch (err) {
      console.error('アラートの取得に失敗:', err)
      setError(err instanceof Error ? err.message : 'アラートの取得に失敗しました')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 売上目標の取得
  const fetchTargets = useCallback(async (storeId?: string) => {
    if (isUsingMockData) {
      const mockTargets: SalesTarget[] = [
        {
          id: 'target-1',
          store_id: '1',
          target_type: 'monthly',
          period_start: '2025-08-01',
          period_end: '2025-08-31',
          revenue_target: 2500000,
          transaction_target: 1000,
          created_at: new Date().toISOString()
        }
      ]
      setTargets(mockTargets)
      return mockTargets
    }

    setIsLoading(true)
    try {
      let query = supabase
        .from('sales_targets')
        .select('*')
        .order('period_start', { ascending: false })

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      const { data, error } = await query

      if (error) throw error
      setTargets(data || [])
      return data || []
    } catch (err) {
      console.error('売上目標の取得に失敗:', err)
      setError(err instanceof Error ? err.message : '売上目標の取得に失敗しました')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 売上サマリーの計算
  const calculateSalesSummary = useCallback((data: SalesData[], period: string): SalesSummary => {
    if (data.length === 0) {
      return {
        period,
        total_revenue: 0,
        total_transactions: 0,
        total_customers: 0,
        average_order_value: 0,
        revenue_growth: 0,
        transaction_growth: 0,
        peak_day: '',
        peak_hour: 0,
        top_category: '',
        payment_method_distribution: { cash: 0, card: 0, mobile: 0 }
      }
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
    const totalTransactions = data.reduce((sum, item) => sum + item.transaction_count, 0)
    const totalCustomers = data.reduce((sum, item) => sum + item.customer_count, 0)

    // 日別売上を計算してピーク日を特定
    const dailyRevenue = data.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + item.revenue
      return acc
    }, {} as Record<string, number>)

    const peakDay = Object.entries(dailyRevenue)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    // 時間別売上を計算してピーク時間を特定
    const hourlyRevenue = data.reduce((acc, item) => {
      if (item.hour_slot !== undefined) {
        acc[item.hour_slot] = (acc[item.hour_slot] || 0) + item.revenue
      }
      return acc
    }, {} as Record<number, number>)

    const peakHour = Number(Object.entries(hourlyRevenue)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 0)

    return {
      period,
      total_revenue: totalRevenue,
      total_transactions: totalTransactions,
      total_customers: totalCustomers,
      average_order_value: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      revenue_growth: 0, // 前期比は別途計算が必要
      transaction_growth: 0,
      peak_day: peakDay,
      peak_hour: peakHour,
      top_category: 'food', // category_breakdownから計算が必要
      payment_method_distribution: { cash: 0.3, card: 0.5, mobile: 0.2 }
    }
  }, [])

  // 売上データの追加
  const addSalesData = useCallback(async (salesData: Omit<SalesData, 'id' | 'created_at' | 'updated_at'>) => {
    if (isUsingMockData) {
      console.log('モックモード: 売上データ追加をシミュレート', salesData)
      return { id: 'mock-new-id', ...salesData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('sales_data')
        .insert(salesData)
        .select()
        .single()

      if (error) throw error
      
      // ローカル状態を更新
      setSalesData(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('売上データの追加に失敗:', err)
      setError(err instanceof Error ? err.message : '売上データの追加に失敗しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // アラートの確認
  const acknowledgeAlert = useCallback(async (alertId: string, userId: string) => {
    if (isUsingMockData) {
      console.log('モックモード: アラート確認をシミュレート', alertId)
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged_by: userId, acknowledged_at: new Date().toISOString() }
          : alert
      ))
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('sales_alerts')
        .update({ 
          acknowledged_by: userId, 
          acknowledged_at: new Date().toISOString() 
        })
        .eq('id', alertId)

      if (error) throw error
      
      // ローカル状態を更新
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged_by: userId, acknowledged_at: new Date().toISOString() }
          : alert
      ))
    } catch (err) {
      console.error('アラートの確認に失敗:', err)
      setError(err instanceof Error ? err.message : 'アラートの確認に失敗しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初期データ読み込み
  useEffect(() => {
    fetchStores()
    fetchSalesData()
    fetchAlerts()
    fetchTargets()
  }, [fetchStores, fetchSalesData, fetchAlerts, fetchTargets])

  return {
    // データ
    stores,
    salesData,
    analysisResults,
    alerts,
    targets,
    
    // 状態
    isLoading,
    error,
    
    // 関数
    fetchStores,
    fetchSalesData,
    fetchAnalysisResults,
    fetchAlerts,
    fetchTargets,
    addSalesData,
    acknowledgeAlert,
    calculateSalesSummary,
    
    // ユーティリティ
    clearError: () => setError(null)
  }
}