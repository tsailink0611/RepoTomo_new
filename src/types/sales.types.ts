// 売上分析関連の型定義
// 作成日: 2025-08-17

// 店舗情報の型
export interface Store {
  id: string
  store_code: string
  name: string
  address?: string
  manager_id?: string
  region?: string
  store_type: 'restaurant' | 'cafe' | 'retail'
  timezone: string
  business_hours: BusinessHours
  settings: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

// 営業時間の型
export interface BusinessHours {
  [key: string]: {
    open: string
    close: string
  }
}

// 売上データの型
export interface SalesData {
  id: string
  store_id: string
  date: string
  hour_slot?: number
  revenue: number
  transaction_count: number
  customer_count: number
  average_order_value: number
  payment_methods: PaymentMethods
  category_breakdown: CategoryBreakdown
  weather_condition?: string
  special_events: string[]
  recorded_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

// 決済方法の型
export interface PaymentMethods {
  cash: number
  card: number
  mobile: number
  [key: string]: number
}

// カテゴリ別売上の型
export interface CategoryBreakdown {
  food: number
  drink: number
  dessert: number
  [key: string]: number
}

// AI分析結果の型
export interface AIAnalysisResult {
  id: string
  store_id: string
  analysis_type: 'daily' | 'weekly' | 'monthly' | 'forecast' | 'anomaly' | 'correlation'
  period_start: string
  period_end: string
  input_data: Record<string, any>
  bedrock_model: string
  analysis_prompt?: string
  raw_response?: string
  structured_insights: InsightItem[]
  recommendations: RecommendationItem[]
  confidence_score?: number
  triggered_by: 'scheduled' | 'manual' | 'alert' | 'report'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  processing_time_ms?: number
  created_at: string
}

// 洞察アイテムの型
export interface InsightItem {
  type: 'trend' | 'anomaly' | 'correlation' | 'pattern'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  data_points: any[]
  confidence?: number
}

// 推奨アクションの型
export interface RecommendationItem {
  priority: 'high' | 'medium' | 'low'
  action: string
  rationale: string
  expected_impact: string
  timeline: string
  category?: 'operation' | 'marketing' | 'staffing' | 'inventory'
}

// 売上アラートの型
export interface SalesAlert {
  id: string
  store_id: string
  alert_type: 'revenue_drop' | 'unusual_pattern' | 'forecast_warning' | 'target_miss' | 'peak_opportunity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  threshold_value?: number
  actual_value?: number
  percentage_change?: number
  period_compared?: string
  ai_context: Record<string, any>
  action_required: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  resolved_at?: string
  created_at: string
}

// 売上目標の型
export interface SalesTarget {
  id: string
  store_id: string
  target_type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  period_start: string
  period_end: string
  revenue_target: number
  transaction_target?: number
  customer_target?: number
  notes?: string
  set_by?: string
  created_at: string
}

// レポート・売上相関の型
export interface ReportSalesCorrelation {
  id: string
  store_id: string
  analysis_date: string
  report_metrics: ReportMetrics
  sales_metrics: SalesMetrics
  correlation_coefficients: CorrelationCoefficients
  insights: InsightItem[]
  ai_analysis_id?: string
  created_at: string
}

// 報告書メトリクスの型
export interface ReportMetrics {
  submission_rate: number
  question_count: number
  mood_distribution: {
    happy: number
    neutral: number
    need_help: number
  }
  average_response_time: number
  [key: string]: any
}

// 売上メトリクスの型
export interface SalesMetrics {
  total_revenue: number
  transaction_count: number
  customer_count: number
  average_order_value: number
  peak_hour: number
  revenue_growth: number
  [key: string]: any
}

// 相関係数の型
export interface CorrelationCoefficients {
  submission_rate_revenue: number
  mood_score_revenue: number
  question_count_revenue: number
  response_time_efficiency: number
  [key: string]: number
}

// 売上分析ダッシュボードのプロップス型
export interface SalesAnalyticsDashboardProps {
  storeId?: string
  dateRange?: {
    start: string
    end: string
  }
  analysisType?: 'daily' | 'weekly' | 'monthly'
  showReportCorrelation?: boolean
}

// チャートデータの型
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

// 売上統計サマリーの型
export interface SalesSummary {
  period: string
  total_revenue: number
  total_transactions: number
  total_customers: number
  average_order_value: number
  revenue_growth: number
  transaction_growth: number
  peak_day: string
  peak_hour: number
  top_category: string
  payment_method_distribution: PaymentMethods
}

// 予測データの型
export interface ForecastData {
  period: string
  predicted_revenue: number
  confidence_interval: {
    lower: number
    upper: number
  }
  confidence_score: number
  factors: string[]
  recommendations: RecommendationItem[]
}

// API レスポンスの型
export interface SalesAnalyticsAPIResponse<T = any> {
  data: T
  error?: string
  message?: string
  timestamp: string
}

// フィルターオプションの型
export interface SalesFilterOptions {
  store_ids?: string[]
  date_range: {
    start: string
    end: string
  }
  time_range?: {
    start_hour: number
    end_hour: number
  }
  categories?: string[]
  payment_methods?: string[]
  min_revenue?: number
  max_revenue?: number
  weather_conditions?: string[]
  special_events?: boolean
}