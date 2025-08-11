import { useState, useEffect } from 'react'
import { supabase, getSession, getUser } from '../lib/supabase'
import { mockStaff } from '../lib/simpleMockData'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Staff } from '../types/database'

// アプリケーション固有のユーザー型
interface AppUser extends SupabaseUser {
  staff?: Staff
}

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    // 開発モード：ローカルストレージからモックユーザーを復元
    const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development'
    
    if (isDevelopment) {
      const savedUser = localStorage.getItem('repotomo_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
        return
      }
    }

    // 本番モード：Supabaseセッションを確認
    const initializeAuth = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          // スタッフ情報を取得
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const appUser: AppUser = {
            ...session.user,
            staff: staffData || undefined
          }

          setAuthState({
            user: appUser,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('認証初期化エラー:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    if (!isDevelopment) {
      initializeAuth()
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }

    // Supabase認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const appUser: AppUser = {
            ...session.user,
            staff: staffData || undefined
          }

          setAuthState({
            user: appUser,
            isLoading: false,
            isAuthenticated: true
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 開発モード用のログイン（モックデータ使用）
  const loginAsStaff = async (staffId: string) => {
    const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development'
    
    if (isDevelopment) {
      const staff = mockStaff.find(s => s.id === staffId)
      if (staff) {
        const user: AppUser = {
          id: staff.id,
          email: `${staff.staff_id}@demo.com`,
          staff,
          // SupabaseUserの必須プロパティを追加
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {}
        } as AppUser
        
        localStorage.setItem('repotomo_user', JSON.stringify(user))
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
      }
    }
  }

  // 本番用のログイン（Supabase認証）
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      // 認証状態の変更は onAuthStateChange で自動処理される
    } catch (error) {
      console.error('ログインエラー:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  // LINEログイン（将来実装）
  const loginWithLine = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('LINEログインエラー:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development'
    
    if (isDevelopment) {
      localStorage.removeItem('repotomo_user')
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
    } else {
      await supabase.auth.signOut()
    }
    
    // ログアウト後はホームページに強制遷移
    window.location.href = '/'
  }

  return {
    ...authState,
    login,
    logout,
    loginAsStaff,
    loginWithLine
  }
}