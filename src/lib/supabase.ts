import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// 環境変数の型安全な取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key-for-development'

// モック環境かどうかを判定
export const isUsingMockData = supabaseUrl.includes('dummy') || supabaseAnonKey.includes('dummy')

if (isUsingMockData) {
  console.warn('⚠️ Using mock data - Supabase not configured. See SUPABASE_SETUP_GUIDE.md for setup instructions.')
}

// Supabaseクライアントの作成
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 認証状態の変更を監視するヘルパー
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// セッション取得のヘルパー
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('セッション取得エラー:', error)
    return null
  }
  return session
}

// ユーザー情報取得のヘルパー
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('ユーザー情報取得エラー:', error)
    return null
  }
  return user
}

// 接続テスト関数
export async function testConnection() {
  if (isUsingMockData) {
    console.log('Using mock data - Supabase not configured')
    return false
  }
  
  try {
    const { data, error } = await supabase.from('staff').select('*').limit(1)
    if (error) {
      console.error('Supabase connection failed:', error)
      return false
    }
    console.log('Supabase connection successful')
    return true
  } catch (err) {
    console.error('Supabase connection error:', err)
    return false
  }
}