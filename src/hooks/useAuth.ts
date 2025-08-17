import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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
    // 認証状態の初期化
    const initializeAuth = async () => {
      try {
        // 開発モード：ローカルストレージからモックユーザーを復元
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

        // 未認証状態
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      } catch (error) {
        console.error('認証初期化エラー:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    initializeAuth()

    // Supabase認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // スタッフ情報を取得
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .eq('email', session.user.email)
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
          localStorage.removeItem('repotomo_user')
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

  // 実データログイン：スタッフIDでログイン（簡易版）
  const loginAsStaff = async (staffId: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      // スタッフ情報を取得
      const { data: staffData, error } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_id', staffId)
        .single()
      
      if (error || !staffData) {
        throw new Error('スタッフが見つかりません')
      }
      
      // 実データでのユーザーオブジェクト作成
      const user: AppUser = {
        id: staffData.id,
        email: staffData.email || `${staffData.staff_id}@repotomo.app`,
        staff: staffData,
        // SupabaseUserの必須プロパティを追加
        aud: 'authenticated',
        created_at: staffData.created_at,
        app_metadata: {},
        user_metadata: {
          staff_role: staffData.role,
          staff_name: staffData.name
        }
      } as AppUser
      
      localStorage.setItem('repotomo_user', JSON.stringify(user))
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      })
    } catch (error) {
      console.error('ログインエラー:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      throw error
    }
  }

  // 本番用のログイン（Supabase認証）
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // 成功時は onAuthStateChange で処理される
    } catch (error) {
      console.error('ログインエラー:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  // サインアップ
  const signUp = async (email: string, password: string, staffData: Partial<Staff>) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: staffData
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('サインアップエラー:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  // ログアウト
  const logout = async () => {
    try {
      localStorage.removeItem('repotomo_user')
      
      // Supabaseからもログアウト
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Supabaseログアウトエラー:', error)
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  // スタッフ情報の更新
  const updateStaffInfo = async (updates: Partial<Staff>) => {
    if (!authState.user?.staff?.id) return

    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', authState.user.staff.id)
        .select()
        .single()

      if (error) throw error

      // ローカル状態を更新
      const updatedUser = {
        ...authState.user,
        staff: data
      }

      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }))

      localStorage.setItem('repotomo_user', JSON.stringify(updatedUser))
      return data
    } catch (error) {
      console.error('スタッフ情報更新エラー:', error)
      throw error
    }
  }

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    loginAsStaff,
    signUp,
    logout,
    updateStaffInfo
  }
}