import { useState } from 'react'
import { supabase } from '../lib/supabase'

export interface LINENotification {
  id: string
  staff_id: string
  type: 'reminder' | 'response' | 'system'
  title: string
  message: string
  channel: 'line'
  sent_at: string
  staff?: any
}

export const useLINE = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Supabase Edge FunctionのURL
  const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL?.replace('/rest/v1', '') || 'https://your-project.supabase.co'

  // LINEリマインダーを送信（Edge Function経由）
  const sendLINEReminder = async (reportId?: string, reportType?: string, targetStaffId?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('send-reminder', {
        body: {
          reportId,
          reportType,
          targetStaffId
        }
      })

      if (functionError) {
        console.error('Edge Function エラー:', functionError)
        throw new Error(`リマインダー送信に失敗しました: ${functionError.message}`)
      }

      console.log('リマインダー送信結果:', functionData)
      return functionData
    } catch (err: any) {
      console.error('LINEリマインダー送信エラー:', err)
      setError(err.message || 'リマインダーの送信に失敗しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // システム通知をLINEで一斉送信
  const sendSystemNotificationToLINE = async (title: string, message: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // アクティブかつLINE連携済みのスタッフを取得
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('is_active', true)
        .not('line_user_id', 'is', null)

      if (staffError) throw staffError
      if (!staff || staff.length === 0) {
        throw new Error('LINE連携済みのアクティブなスタッフが見つかりません')
      }

      // 各スタッフに通知を送信
      const results = []
      for (const staffMember of staff) {
        try {
          // Edge Function経由でLINE通知を送信
          const response = await fetch(`${SUPABASE_FUNCTION_URL}/functions/v1/line-webhook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`,
            },
            body: JSON.stringify({
              events: [{
                type: 'system_notification',
                userId: staffMember.line_user_id,
                title,
                message
              }]
            })
          })

          if (response.ok) {
            results.push({ staff: staffMember.name, status: 'sent' })
            
            // 通知記録をデータベースに保存
            await supabase.from('notifications').insert({
              staff_id: staffMember.id,
              type: 'system',
              title,
              message,
              channel: 'line',
              sent_at: new Date().toISOString()
            })
          } else {
            console.error(`${staffMember.name}への送信に失敗:`, response.statusText)
            results.push({ staff: staffMember.name, status: 'failed' })
          }
        } catch (err) {
          console.error(`${staffMember.name}への送信エラー:`, err)
          results.push({ staff: staffMember.name, status: 'failed' })
        }
      }

      return {
        total: staff.length,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length,
        details: results
      }
    } catch (err: any) {
      console.error('システム通知送信エラー:', err)
      setError(err.message || 'システム通知の送信に失敗しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 質問回答をLINEで送信
  const sendQuestionResponseToLINE = async (staffId: string, reportName: string, response: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // スタッフ情報を取得
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single()

      if (staffError || !staff) throw new Error('スタッフが見つかりません')
      if (!staff.line_user_id) throw new Error('スタッフのLINE連携が設定されていません')

      // Edge Function経由でLINE通知を送信
      const lineResponse = await fetch(`${SUPABASE_FUNCTION_URL}/functions/v1/line-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          events: [{
            type: 'question_response',
            userId: staff.line_user_id,
            reportName,
            response
          }]
        })
      })

      if (!lineResponse.ok) {
        throw new Error('質問回答の送信に失敗しました')
      }

      // 通知記録をデータベースに保存
      await supabase.from('notifications').insert({
        staff_id: staff.id,
        type: 'response',
        title: `${reportName}への回答`,
        message: response,
        channel: 'line',
        sent_at: new Date().toISOString()
      })

      return { success: true, staff: staff.name }
    } catch (err: any) {
      console.error('質問回答送信エラー:', err)
      setError(err.message || '質問回答の送信に失敗しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // LINE通知履歴を取得
  const getLINENotificationHistory = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          staff:staff_id (
            name,
            email
          )
        `)
        .eq('channel', 'line')
        .order('sent_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as LINENotification[]
    } catch (err: any) {
      console.error('LINE通知履歴取得エラー:', err)
      setError(err.message || 'LINE通知履歴の取得に失敗しました')
      return []
    }
  }

  // LINE連携統計を取得
  const getLINEStats = async () => {
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('line_user_id, is_active')

      if (staffError) throw staffError

      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('channel', 'line')

      if (notifError) throw notifError

      // 今日の通知数
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayNotifications = notifications?.filter(n => 
        new Date(n.sent_at) >= today
      ).length || 0

      return {
        totalStaff: staff?.length || 0,
        connectedStaff: staff?.filter(s => s.line_user_id).length || 0,
        activeConnectedStaff: staff?.filter(s => s.line_user_id && s.is_active).length || 0,
        totalNotifications: notifications?.length || 0,
        todayNotifications
      }
    } catch (err: any) {
      console.error('LINE統計取得エラー:', err)
      setError(err.message || 'LINE統計の取得に失敗しました')
      return {
        totalStaff: 0,
        connectedStaff: 0,
        activeConnectedStaff: 0,
        totalNotifications: 0,
        todayNotifications: 0
      }
    }
  }

  return {
    isLoading,
    error,
    sendLINEReminder,
    sendSystemNotificationToLINE,
    sendQuestionResponseToLINE,
    getLINENotificationHistory,
    getLINEStats
  }
}