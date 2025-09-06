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
        // 管理者トークンの確認
        const adminToken = localStorage.getItem('repotomo_admin_token')
        if (adminToken) {
          try {
            // トークンの検証
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({ token: adminToken })
            })

            const result = await response.json()

            if (result.success) {
              // 有効な管理者トークン
              const adminUser: AppUser = {
                id: result.user.id,
                email: `${result.user.username}@repotomo.admin`,
                aud: 'authenticated',
                created_at: new Date().toISOString(),
                app_metadata: { role: 'admin' },
                user_metadata: {
                  username: result.user.username,
                  is_admin: true
                }
              } as AppUser

              localStorage.setItem('repotomo_user', JSON.stringify(adminUser))
              setAuthState({
                user: adminUser,
                isLoading: false,
                isAuthenticated: true
              })
              return
            } else {
              // 無効なトークン - 削除
              localStorage.removeItem('repotomo_admin_token')
              localStorage.removeItem('repotomo_user')
            }
          } catch (error) {
            console.error('トークン検証エラー:', error)
            localStorage.removeItem('repotomo_admin_token')
            localStorage.removeItem('repotomo_user')
          }
        }

        // 開発モード：ローカルストレージからモックユーザーを復元
        const savedUser = localStorage.getItem('repotomo_user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          // 管理者でない場合のみ復元
          if (!user.user_metadata?.is_admin) {
            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: true
            })
            return
          }
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

  // 管理者ログイン（新認証API使用）
  const login = async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      // 新しい認証APIを使用
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'ログインに失敗しました')
      }

      // トークンをローカルストレージに保存
      localStorage.setItem('repotomo_admin_token', result.token)

      // 管理者ユーザーオブジェクトを作成
      const adminUser: AppUser = {
        id: result.user.id,
        email: `${result.user.username}@repotomo.admin`,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: { role: 'admin' },
        user_metadata: {
          username: result.user.username,
          is_admin: true
        }
      } as AppUser

      localStorage.setItem('repotomo_user', JSON.stringify(adminUser))
      setAuthState({
        user: adminUser,
        isLoading: false,
        isAuthenticated: true
      })
    } catch (error) {
      console.error('ログインエラー:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  // 従来のSupabase認証も保持
  const loginWithSupabase = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // 成功時は onAuthStateChange で処理される
    } catch (error) {
      console.error('Supabaseログインエラー:', error)
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
      const adminToken = localStorage.getItem('repotomo_admin_token')
      
      // 管理者トークンがある場合は、サーバー側のセッションも削除
      if (adminToken) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ token: adminToken })
          })
        } catch (error) {
          console.error('サーバー側ログアウトエラー:', error)
        }
        localStorage.removeItem('repotomo_admin_token')
      }
      
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
    loginWithSupabase,
    loginAsStaff,
    signUp,
    logout,
    updateStaffInfo
  }
}