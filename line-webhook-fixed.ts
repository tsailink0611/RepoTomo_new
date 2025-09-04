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

function createMainMenu() {
  return {
    type: 'flex',
    altText: 'メインメニュー',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🎉 RepoTomo',
            weight: 'bold',
            size: 'xl',
            margin: 'md',
          },
          {
            type: 'text',
            text: '何をしますか？',
            size: 'sm',
            color: '#999999',
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
                  label: '❓ 質問・相談',
                  data: 'action=consultation',
                },
              },
              {
                type: 'button',
                style: 'secondary',
                action: {
                  type: 'postback',
                  label: '⚙️ 通知設定',
                  data: 'action=settings',
                },
              },
            ],
          },
        ],
      },
    },
  }
}

async function createReportMenu(userId: string) {
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('line_user_id', userId)
    .single()

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
      label: `${template.emoji} ${template.name}`,
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
        
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: `${staff.name}さん、登録完了しました！🎉\n\n「メニュー」と入力して操作を開始してください。`,
        }])
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
      await replyMessage(event.replyToken, [createMainMenu()])
    } else if (text === '報告' || text === 'report') {
      const reportMenu = await createReportMenu(userId)
      await replyMessage(event.replyToken, [reportMenu])
    } else if (text === '状況' || text === 'status') {
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
    } else if (text === 'ヘルプ' || text === 'help') {
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: '🔍 使い方ガイド\n\n' +
              '「メニュー」: メインメニューを表示\n' +
              '「報告」: 報告書を提出\n' +
              '「状況」: 提出状況を確認\n' +
              '「ヘルプ」: このメッセージを表示\n\n' +
              '困ったときは管理者にお問い合わせください。',
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
        break

      case 'settings':
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: '⚙️ 通知設定\n\n現在の設定:\nリマインダー: 18:00\n\n設定変更は管理者にお問い合わせください。',
        }])
        break

      default:
        await replyMessage(event.replyToken, [createMainMenu()])
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