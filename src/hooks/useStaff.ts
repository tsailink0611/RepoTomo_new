import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Staff {
  id: string
  staff_id: string
  name: string
  email: string
  role: 'STAFF' | 'MANAGER' | 'ADMIN'
  department?: string
  position?: string
  line_user_id?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // スタッフ一覧を取得
  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setStaff(data || [])
      setError(null)
    } catch (err: any) {
      console.error('スタッフデータ取得エラー:', err)
      setError('スタッフデータの取得に失敗しました')
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      await fetchStaff()
      setIsLoading(false)
    }

    initializeData()
  }, [])

  // スタッフを追加
  const addStaff = async (staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          ...staffData,
          is_active: staffData.is_active ?? true
        })
        .select()
        .single()

      if (error) throw error

      setStaff(prev => [data, ...prev])
      return data
    } catch (err: any) {
      console.error('スタッフ追加エラー:', err)
      throw new Error('スタッフの追加に失敗しました')
    }
  }

  // スタッフを更新
  const updateStaff = async (staffId: string, updates: Partial<Staff>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffId)
        .select()
        .single()

      if (error) throw error

      setStaff(prev => 
        prev.map(s => 
          s.id === staffId ? { ...s, ...data } : s
        )
      )
      return data
    } catch (err: any) {
      console.error('スタッフ更新エラー:', err)
      throw new Error('スタッフの更新に失敗しました')
    }
  }

  // スタッフを削除
  const deleteStaff = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId)

      if (error) throw error

      setStaff(prev => prev.filter(s => s.id !== staffId))
    } catch (err: any) {
      console.error('スタッフ削除エラー:', err)
      throw new Error('スタッフの削除に失敗しました')
    }
  }

  // スタッフの有効/無効を切り替え
  const toggleStaffActive = async (staffId: string) => {
    const currentStaff = staff.find(s => s.id === staffId)
    if (!currentStaff) return

    try {
      await updateStaff(staffId, { is_active: !currentStaff.is_active })
    } catch (err: any) {
      throw new Error('スタッフの状態変更に失敗しました')
    }
  }

  // データ再取得
  const refetch = async () => {
    setIsLoading(true)
    await fetchStaff()
    setIsLoading(false)
  }

  // 統計情報
  const getStaffStats = () => {
    return {
      total: staff.length,
      active: staff.filter(s => s.is_active).length,
      managers: staff.filter(s => s.role === 'MANAGER').length,
      admins: staff.filter(s => s.role === 'ADMIN').length,
      withLine: staff.filter(s => s.line_user_id).length,
    }
  }

  return {
    staff,
    isLoading,
    error,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffActive,
    refetch,
    getStaffStats
  }
}