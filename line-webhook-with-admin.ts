import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!
const LINE_CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface LineWebhookEvent {
  type: string
  message?: {
    type: string
    text: string
  }
  postback?: {
    data: string
  }
  source: {
    userId: string
  }
  replyToken: string
}

// ロール・テーマ設定
const ROLE_THEMES = {
  admin: { 
    color: '#DC2626', 
    bgColor: '#FEF3C7', 
    emoji: '👑', 
    title: 'ADMIN MODE',
    textColor: '#92400E'
  },
  staff: { 
    color: '#2563EB', 
    bgColor: '#EBF8FF', 
    emoji: '👤', 
    title: 'STAFF MODE',
    textColor: '#1D4ED8'
  }
}

async function replyMessage(replyToken: string, messages: any[]) {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  })
  
  if (!response.ok) {
    console.error('LINE reply failed:', await response.text())
  }
}

export async function pushMessage(userId: string, messages: any[]) {
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
    console.error('LINE push failed:', await response.text())
  }
}

// 管理者用統計データ取得
async function getAdminStats() {
  const today = new Date().toISOString().split('T')[0]
  
  const [
    { data: totalStaff },
    { data: todaySubmissions },
    { data: pendingQuestions }
  ] = await Promise.all([
    supabase.from('staff').select('id', { count: 'exact' }),
    supabase.from('submissions').select('staff_id').gte('submitted_at', today + 'T00:00:00'),
    supabase.from('submissions').select('id').eq('status', 'has_question')
  ])

  return {
    totalStaff: totalStaff?.length || 0,
    todaySubmissions: todaySubmissions?.length || 0,
    pendingQuestions: pendingQuestions?.length || 0
  }
}

// ウェルカムメッセージ（権限別）
async function createWelcomeMessage(staff: any) {
  const theme = staff.is_admin ? ROLE_THEMES.admin : ROLE_THEMES.staff
  const stats = staff.is_admin ? await getAdminStats() : null
  
  const contents = [
    {
      type: 'text',
      text: `${theme.emoji} ${theme.title}`,
      size: 'xl',
      weight: 'bold',
      color: theme.textColor,
    },
    {
      type: 'text',
      text: `${staff.name}さん、${staff.is_admin ? '管理者権限で' : ''}ログインしました`,
      margin: 'md',
      size: 'sm'
    }
  ]

  if (staff.is_admin && stats) {
    contents.push(
      {
        type: 'separator',
        margin: 'xl',
      },
      {
        type: 'text',
        text: '📊 本日の状況',
        weight: 'bold',
        margin: 'xl',
      },
      {
        type: 'text',
        text: `提出済み: ${stats.todaySubmissions}名 / 全スタッフ: ${stats.totalStaff}名`,
        margin: 'sm',
        size: 'sm'
      },
      {
        type: 'text',
        text: `質問待ち: ${stats.pendingQuestions}件`,
        margin: 'xs',
        size: 'sm'
      }
    )
  }

  return {
    type: 'flex',
    altText: `${theme.emoji} ${theme.title}で起動しました`,
    contents: {
      type: 'bubble',
      styles: {
        body: {
          backgroundColor: theme.bgColor,
        },
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: contents,
      },
    },
  }
}

// スタッフ用メインメニュー
function createStaffMenu() {
  return {
    type: 'flex',
    altText: 'メインメニュー',
    contents: {
      type: 'bubble',
      styles: {
        body: { backgroundColor: ROLE_THEMES.staff.bgColor },
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '👤 RepoTomo スタッフ',
            weight: 'bold',
            size: 'xl',
            margin: 'md',
            color: ROLE_THEMES.staff.textColor,
          },
          {
            type: 'text',
            text: '何をしますか？',
            size: 'sm',
            color: '#666666',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                color: '#ea580c',
                action: {
                  type: 'postback',
                  label: '📝 報告書を提出',
                  data: 'action=submit_report',
                },
              },
              {
                type: 'button',
                style: 'primary',
                color: '#f97316',
                action: {
                  type: 'postback',
                  label: '📊 提出状況を確認',
                  data: 'action=check_status',
                },
              },
              {
                type: 'button',
                style: 'secondary',
                action: {
                  type: 'postback',
                  label: '❓ ヘルプ',
                  data: 'action=help',
                },
              },
            ],
          },
        ],
      },
    },
  }
}

// 管理者用メインメニュー
function createAdminMenu() {
  return {
    type: 'flex',
    altText: '👑 管理者メニュー',
    contents: {
      type: 'bubble',
      styles: {
        body: { backgroundColor: ROLE_THEMES.admin.bgColor },
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '👑 RepoTomo 管理者',
            weight: 'bold',
            size: 'xl',
            margin: 'md',
            color: ROLE_THEMES.admin.textColor,
          },
          {
            type: 'text',
            text: '管理機能を選択してください',
            size: 'sm',
            color: '#666666',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                color: '#DC2626',
                action: {
                  type: 'postback',
                  label: '📊 全体状況確認',
                  data: 'action=admin_overview',
                },
              },
              {
                type: 'button',
                style: 'primary',
                color: '#7C2D12',
                action: {
                  type: 'postback',
                  label: '🔔 一斉通知送信',
                  data: 'action=admin_broadcast',
                },
              },
              {
                type: 'button',
                style: 'secondary',
                action: {
                  type: 'postback',
                  label: '📝 個人モードで報告',
                  data: 'action=switch_to_staff',
                },
              },
              {
                type: 'button',
                style: 'secondary',
                action: {
                  type: 'postback',
                  label: '❓ 管理者ヘルプ',
                  data: 'action=admin_help',
                },
              },
            ],
          },
        ],
      },
    },
  }
}

// 報告書選択メニュー
async function createReportMenu(userId: string) {
  const { data: templates } = await supabase
    .from('report_templates')
    .select('*')
    .eq('is_active', true)

  if (!templates || templates.length === 0) {
    return {
      type: 'text',
      text: '現在提出可能な報告書がありません。',
    }
  }

  const buttons = templates.slice(0, 4).map(template => ({
    type: 'button',
    style: 'primary',
    action: {
      type: 'postback',
      label: `${template.emoji || '📄'} ${template.name}`,
      data: `action=select_report&report_id=${template.id}`,
    },
  }))

  return {
    type: 'flex',
    altText: '報告書を選択',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📋 報告書を選択',
            weight: 'bold',
            size: 'lg',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: buttons,
          },
        ],
      },
    },
  }
}

function createSubmissionForm(reportName: string, reportId: string) {
  return {
    type: 'flex',
    altText: `${reportName}の提出`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: reportName,
            weight: 'bold',
            size: 'lg',
          },
          {
            type: 'text',
            text: '状況を選択してください：',
            size: 'sm',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                color: '#16a34a',
                action: {
                  type: 'postback',
                  label: '✅ 提出完了',
                  data: `action=submit&report_id=${reportId}&status=completed`,
                },
              },
              {
                type: 'button',
                style: 'primary',
                color: '#eab308',
                action: {
                  type: 'postback',
                  label: '❓ 質問あり',
                  data: `action=submit&report_id=${reportId}&status=has_question`,
                },
              },
              {
                type: 'button',
                style: 'secondary',
                action: {
                  type: 'postback',
                  label: '🔄 一部完了',
                  data: `action=submit&report_id=${reportId}&status=partial`,
                },
              },
              {
                type: 'button',
                style: 'secondary',
                action: {
                  type: 'postback',
                  label: '⏰ 延長希望',
                  data: `action=submit&report_id=${reportId}&status=extension_requested`,
                },
              },
            ],
          },
        ],
      },
    },
  }
}

// 管理者用全体状況確認
async function createAdminOverview() {
  const stats = await getAdminStats()
  
  // 未提出者一覧
  const { data: nonSubmittedStaff } = await supabase
    .from('staff')
    .select('name')
    .not('id', 'in', `(SELECT staff_id FROM submissions WHERE submitted_at >= '${new Date().toISOString().split('T')[0]}T00:00:00')`)
    .limit(5)

  const nonSubmittedNames = nonSubmittedStaff?.map(s => s.name).join('、') || 'なし'

  return {
    type: 'flex',
    altText: '📊 全体状況',
    contents: {
      type: 'bubble',
      styles: {
        body: { backgroundColor: ROLE_THEMES.admin.bgColor },
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📊 本日の全体状況',
            weight: 'bold',
            size: 'lg',
            color: ROLE_THEMES.admin.textColor,
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'md',
            contents: [
              {
                type: 'text',
                text: `✅ 提出完了: ${stats.todaySubmissions}名`,
                size: 'sm',
              },
              {
                type: 'text',
                text: `👥 全スタッフ: ${stats.totalStaff}名`,
                size: 'sm',
              },
              {
                type: 'text',
                text: `❓ 質問待ち: ${stats.pendingQuestions}件`,
                size: 'sm',
              },
              {
                type: 'separator',
                margin: 'md',
              },
              {
                type: 'text',
                text: '⚠️ 未提出者:',
                weight: 'bold',
                size: 'sm',
                margin: 'md',
              },
              {
                type: 'text',
                text: nonSubmittedNames,
                size: 'xs',
                wrap: true,
              },
            ],
          },
        ],
      },
    },
  }
}

async function handleEvent(event: LineWebhookEvent) {
  const userId = event.source.userId
  
  const { data: existingStaff } = await supabase
    .from('staff')
    .select('*')
    .eq('line_user_id', userId)
    .single()

  if (!existingStaff && event.type === 'message') {
    const text = event.message?.text
    if (text && /^[0-9]+$/.test(text)) {
      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_id', text)
        .single()
      
      if (staff) {
        await supabase
          .from('staff')
          .update({ line_user_id: userId })
          .eq('id', staff.id)
        
        const welcomeMessage = await createWelcomeMessage(staff)
        
        await replyMessage(event.replyToken, [
          welcomeMessage,
          {
            type: 'text',
            text: `「メニュー」と入力して操作を開始してください。`,
          }
        ])
        return
      } else {
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: 'スタッフIDが見つかりませんでした。正しいIDを入力してください。',
        }])
        return
      }
    } else {
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: 'はじめまして！RepoTomoへようこそ🎉\n\nスタッフIDを教えてください。',
      }])
      return
    }
  }

  if (event.type === 'message' && event.message?.type === 'text') {
    const text = event.message.text

    if (text === 'メニュー' || text === 'menu') {
      const menu = existingStaff.is_admin ? createAdminMenu() : createStaffMenu()
      await replyMessage(event.replyToken, [menu])
    } else if (text === '報告' || text === 'report') {
      const reportMenu = await createReportMenu(userId)
      await replyMessage(event.replyToken, [reportMenu])
    } else if (text === '状況' || text === 'status') {
      if (existingStaff.is_admin) {
        const overview = await createAdminOverview()
        await replyMessage(event.replyToken, [overview])
      } else {
        // スタッフ個人の状況確認
        const { data: submissions } = await supabase
          .from('submissions')
          .select('*, report_templates(name)')
          .eq('staff_id', existingStaff.id)
          .order('submitted_at', { ascending: false })
          .limit(5)

        let statusText = '📊 最近の提出状況\n\n'
        if (submissions && submissions.length > 0) {
          submissions.forEach(sub => {
            const date = new Date(sub.submitted_at).toLocaleDateString('ja-JP')
            statusText += `${date} ${sub.report_templates.name}: ${sub.status}\n`
          })
        } else {
          statusText += '提出履歴がありません。'
        }

        await replyMessage(event.replyToken, [{
          type: 'text',
          text: statusText,
        }])
      }
    } else if (text === 'ヘルプ' || text === 'help') {
      const helpText = existingStaff.is_admin 
        ? '👑 管理者コマンド\n\n「メニュー」: 管理者メニュー\n「状況」: 全体状況確認\n「報告」: 個人で報告書提出'
        : '👤 スタッフコマンド\n\n「メニュー」: メインメニュー\n「報告」: 報告書提出\n「状況」: 提出状況確認'
      
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: helpText,
      }])
    } else {
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: `メッセージありがとうございます。\n「メニュー」と入力すると操作メニューが表示されます。`,
      }])
    }
  }

  if (event.type === 'postback' && event.postback) {
    const params = new URLSearchParams(event.postback.data)
    const action = params.get('action')

    switch (action) {
      case 'submit_report':
        const reportMenu = await createReportMenu(userId)
        await replyMessage(event.replyToken, [reportMenu])
        break

      case 'select_report':
        const reportId = params.get('report_id')
        const { data: template } = await supabase
          .from('report_templates')
          .select('*')
          .eq('id', reportId)
          .single()
        
        if (template) {
          const form = createSubmissionForm(template.name, reportId!)
          await replyMessage(event.replyToken, [form])
        }
        break

      case 'submit':
        const submissionReportId = params.get('report_id')
        const status = params.get('status')
        
        const { error: insertError } = await supabase.from('submissions').insert({
          staff_id: existingStaff.id,
          report_id: submissionReportId,
          status: status,
          submitted_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error('Submission insert error:', insertError)
          await replyMessage(event.replyToken, [{
            type: 'text',
            text: '申し訳ございません。提出の保存に失敗しました。もう一度お試しください。',
          }])
          return
        }

        await replyMessage(event.replyToken, [{
          type: 'text',
          text: '✅ 報告書を受け付けました！\nお疲れさまでした。',
        }])
        break

      case 'check_status':
        if (existingStaff.is_admin) {
          const overview = await createAdminOverview()
          await replyMessage(event.replyToken, [overview])
        } else {
          const { data: submissions } = await supabase
            .from('submissions')
            .select('*, report_templates(name)')
            .eq('staff_id', existingStaff.id)
            .order('submitted_at', { ascending: false })
            .limit(5)

          let statusText = '📊 最近の提出状況\n\n'
          if (submissions && submissions.length > 0) {
            submissions.forEach(sub => {
              const date = new Date(sub.submitted_at).toLocaleDateString('ja-JP')
              statusText += `${date} ${sub.report_templates.name}: ${sub.status}\n`
            })
          } else {
            statusText += '提出履歴がありません。'
          }

          await replyMessage(event.replyToken, [{
            type: 'text',
            text: statusText,
          }])
        }
        break

      case 'admin_overview':
        const overview = await createAdminOverview()
        await replyMessage(event.replyToken, [overview])
        break

      case 'admin_broadcast':
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: '🔔 一斉通知機能\n\n現在実装中です。\nWebダッシュボードから送信可能です。',
        }])
        break

      case 'switch_to_staff':
        const staffMenu = createStaffMenu()
        await replyMessage(event.replyToken, [staffMenu])
        break

      case 'help':
      case 'admin_help':
        const isAdmin = existingStaff.is_admin
        const helpText = isAdmin 
          ? '👑 管理者機能ガイド\n\n📊 全体状況確認: スタッフの提出状況\n🔔 一斉通知: 全員への通知送信\n📝 個人モード: 個人として報告書提出'
          : '👤 スタッフ機能ガイド\n\n📝 報告書提出: 各種報告書の提出\n📊 提出状況: 個人の提出履歴確認'
        
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: helpText,
        }])
        break

      default:
        const defaultMenu = existingStaff.is_admin ? createAdminMenu() : createStaffMenu()
        await replyMessage(event.replyToken, [defaultMenu])
    }
  }
}

serve(async (req) => {
  try {
    const body = await req.json()
    
    if (body.events && body.events.length === 0) {
      return new Response('OK', { status: 200 })
    }

    const events = body.events || []
    await Promise.all(events.map(handleEvent))

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})