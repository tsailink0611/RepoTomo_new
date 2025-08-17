import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// LINE プッシュメッセージ送信
async function sendLineMessage(userId: string, messages: any[]) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('LINE push failed:', error)
    throw new Error(`LINE API error: ${error}`)
  }

  return response
}

// リマインダーメッセージ作成
function createReminderMessage(reportName: string, deadline: string, emoji: string = '📝') {
  return {
    type: 'flex',
    altText: `リマインダー: ${reportName}の提出`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#ea580c',
        contents: [
          {
            type: 'text',
            text: '📢 リマインダー',
            color: '#ffffff',
            weight: 'bold',
            size: 'sm',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${emoji} ${reportName}`,
            weight: 'bold',
            size: 'lg',
            margin: 'md',
          },
          {
            type: 'text',
            text: deadline,
            size: 'sm',
            color: '#999999',
            margin: 'sm',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'text',
            text: 'お疲れさまです！',
            size: 'sm',
            margin: 'lg',
          },
          {
            type: 'text',
            text: '報告書の提出をお願いします。',
            size: 'sm',
            wrap: true,
          },
          {
            type: 'text',
            text: '※期限は目安です。余裕があるときに提出してください。',
            size: 'xs',
            color: '#666666',
            margin: 'md',
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#ea580c',
            action: {
              type: 'message',
              label: '報告書を提出',
              text: '報告',
            },
          },
          {
            type: 'button',
            style: 'link',
            action: {
              type: 'message',
              label: '後で通知',
              text: '後で',
            },
          },
        ],
      },
    },
  }
}

serve(async (req) => {
  try {
    const { reportId, reportType, targetStaffId } = await req.json()

    // 報告書テンプレート情報取得
    let template
    if (reportId) {
      // reportIdが指定された場合
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', reportId)
        .single()
      
      if (error || !data) {
        throw new Error('Report template not found')
      }
      template = data
    } else if (reportType) {
      // reportTypeが指定された場合、対応する報告書を検索
      let reportName
      switch (reportType) {
        case 'daily':
          reportName = '日報'
          break
        case 'weekly':
          reportName = '週報'
          break
        case 'monthly':
          reportName = '月報'
          break
        case 'nepal_training':
          reportName = 'ネパール育成週報'
          break
        default:
          throw new Error(`Unknown report type: ${reportType}`)
      }
      
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('name', reportName)
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        throw new Error(`Report template not found for type: ${reportType}`)
      }
      template = data
    } else {
      throw new Error('Either reportId or reportType must be provided')
    }

    // 送信対象のスタッフを取得
    let staffQuery = supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .not('line_user_id', 'is', null)

    if (targetStaffId) {
      staffQuery = staffQuery.eq('id', targetStaffId)
    }

    const { data: staffList, error: staffError } = await staffQuery

    if (staffError || !staffList || staffList.length === 0) {
      throw new Error('No staff found for reminder')
    }

    // 各スタッフにリマインダー送信
    const results = await Promise.allSettled(
      staffList.map(async (staff) => {
        // 本日の提出状況確認
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: submission } = await supabase
          .from('submissions')
          .select('*')
          .eq('staff_id', staff.id)
          .eq('report_id', template.id)
          .gte('submitted_at', today.toISOString())
          .single()

        // 既に提出済みの場合はスキップ
        if (submission && submission.status === 'completed') {
          console.log(`Staff ${staff.name} already submitted report ${template.name}`)
          return { status: 'skipped', staff: staff.name }
        }

        // リマインダー送信
        const message = createReminderMessage(
          template.name,
          template.deadline || '本日中',
          template.emoji
        )

        await sendLineMessage(staff.line_user_id, [message])

        // 通知記録
        await supabase.from('notifications').insert({
          staff_id: staff.id,
          type: 'reminder',
          title: `${template.name}のリマインダー`,
          message: `${template.name}の提出時間です。`,
          channel: 'line',
          sent_at: new Date().toISOString(),
        })

        return { status: 'sent', staff: staff.name }
      })
    )

    // 結果集計
    const summary = {
      total: results.length,
      sent: results.filter(r => r.status === 'fulfilled' && r.value?.status === 'sent').length,
      skipped: results.filter(r => r.status === 'fulfilled' && r.value?.status === 'skipped').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results,
    }

    console.log('Reminder summary:', summary)

    return new Response(
      JSON.stringify({
        success: true,
        summary,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Send reminder error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})