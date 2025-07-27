// 認証関連の型定義（循環参照を避けるため独立）
export interface User {
  id: string
  email?: string
  staff?: any // 一時的にanyで循環参照を回避
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}