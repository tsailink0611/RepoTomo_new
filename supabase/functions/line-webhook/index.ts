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

// LINEへのメッセージ送信
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

// プッシュメッセージ送信
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

// リッチメニューの作成
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

// 報告書選択メニュー
async function createReportMenu(userId: string) {
  // ユーザー情報取得
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('line_user_id', userId)
    .single()

  // アクティブな報告書テンプレート取得
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

// 報告書提出フォーム
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

// イベント処理
async function handleEvent(event: LineWebhookEvent) {
  const userId = event.source.userId
  
  // ユーザー登録確認
  const { data: existingStaff } = await supabase
    .from('staff')
    .select('*')
    .eq('line_user_id', userId)
    .single()

  if (!existingStaff && event.type === 'message') {
    // 新規ユーザー登録フロー - スタッフIDでの紐付け
    const text = event.message?.text
    if (text && /^[0-9]+$/.test(text)) {
      // 数字のメッセージをスタッフIDとして処理
      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_id', text)
        .single()
      
      if (staff) {
        // スタッフが見つかった場合、LINE User IDを更新
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
      // 初回メッセージ
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: 'はじめまして！RepoTomoへようこそ🎉\n\nスタッフIDを教えてください。',
      }])
      return
    }
  }

  // メッセージイベント処理
  if (event.type === 'message' && event.message?.type === 'text') {
    const text = event.message.text

    // コマンド処理
    if (text === 'メニュー' || text === 'menu') {
      await replyMessage(event.replyToken, [createMainMenu()])
    } else if (text === '報告' || text === 'report') {
      const reportMenu = await createReportMenu(userId)
      await replyMessage(event.replyToken, [reportMenu])
    } else if (text === '状況' || text === 'status') {
      // 提出状況確認
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
    } else if (text === '日報' || text === 'daily') {
      // 日報テンプレートを探して提出画面を表示
      const { data: template } = await supabase
        .from('report_templates')
        .select('*')
        .eq('name', '日報')
        .eq('is_active', true)
        .single()

      if (template) {
        const form = createSubmissionForm(template.name, template.id)
        await replyMessage(event.replyToken, [form])
      } else {
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: '日報テンプレートが見つかりません。\n「報告」コマンドから利用可能な報告書を確認してください。',
        }])
      }
    } else if (text === '月報' || text === 'monthly') {
      // 月報テンプレートを探して提出画面を表示
      const { data: template } = await supabase
        .from('report_templates')
        .select('*')
        .eq('name', '月報')
        .eq('is_active', true)
        .single()

      if (template) {
        const form = createSubmissionForm(template.name, template.id)
        await replyMessage(event.replyToken, [form])
      } else {
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: '月報テンプレートが見つかりません。\n「報告」コマンドから利用可能な報告書を確認してください。',
        }])
      }
    } else if (text === 'ヘルプ' || text === 'help') {
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: '🔍 使い方ガイド\n\n' +
              '「メニュー」: メインメニューを表示\n' +
              '「報告」: 報告書を提出\n' +
              '「状況」: 提出状況を確認\n' +
              '「日報」: 日報を直接提出\n' +
              '「月報」: 月報を直接提出\n' +
              '「ヘルプ」: このメッセージを表示\n\n' +
              '困ったときは管理者にお問い合わせください。',
      }])
    } else {
      // 通常のメッセージ対応
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: `メッセージありがとうございます。\n「メニュー」と入力すると操作メニューが表示されます。`,
      }])
    }
  }

  // ポストバックイベント処理
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
        
        // 提出記録
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
        // 提出状況確認
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

// 管理者からの送信リクエスト処理
async function handleAdminNotification(body: any) {
  const { action, title, message, targetUserId, reportId } = body

  if (action === 'send_system_notification') {
    // システム通知送信
    const { data: staff } = await supabase
      .from('staff')
      .select('line_user_id, name')
      .eq('is_active', true)
      .not('line_user_id', 'is', null)

    const results = { sent: 0, failed: 0, details: [] }
    
    for (const staffMember of staff || []) {
      try {
        await pushMessage(staffMember.line_user_id, [{
          type: 'text',
          text: `📢 ${title}\n\n${message}`
        }])
        results.sent++
        results.details.push({ name: staffMember.name, status: 'success' })
      } catch (error) {
        results.failed++
        results.details.push({ name: staffMember.name, status: 'failed', error: error.message })
      }
    }

    return results
  }

  if (action === 'send_reminder') {
    // リマインダー送信
    const { data: staff } = await supabase
      .from('staff')
      .select('line_user_id, name')
      .eq('is_active', true)
      .not('line_user_id', 'is', null)

    const results = { summary: { sent: 0, skipped: 0 }, details: [] }
    
    for (const staffMember of staff || []) {
      try {
        await pushMessage(staffMember.line_user_id, [{
          type: 'text',
          text: `⏰ リマインダー\n\n報告書の提出をお忘れなく！\n\n期限内での提出にご協力お願いします。`
        }])
        results.summary.sent++
        results.details.push({ name: staffMember.name, status: 'sent' })
      } catch (error) {
        results.summary.skipped++
        results.details.push({ name: staffMember.name, status: 'skipped', error: error.message })
      }
    }

    return results
  }

  if (action === 'send_question_response') {
    // 質問回答送信
    const { targetUserId, reportName, response } = body
    
    try {
      await pushMessage(targetUserId, [{
        type: 'text',
        text: `💬 ${reportName}への回答\n\n${response}`
      }])
      
      return { success: true, message: '質問回答を送信しました' }
    } catch (error) {
      throw new Error(`質問回答の送信に失敗しました: ${error.message}`)
    }
  }

  throw new Error('Unknown action')
}

// LINE署名検証
async function verifySignature(body: string, signature: string): Promise<boolean> {
  const secretKey = LINE_CHANNEL_SECRET
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secretKey)
  const bodyData = encoder.encode(body)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, bodyData)
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
  
  return signature === expectedSignature
}

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Line-Signature',
      }
    })
  }

  // Edge Function認証をスキップ（Webhook用）
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    const requestText = await req.text()
    const body = JSON.parse(requestText)
    
    // LINE Platform からのリクエストをチェック
    const signature = req.headers.get('X-Line-Signature')
    const isLineRequest = signature !== null
    
    console.log('Request type:', isLineRequest ? 'LINE Platform' : 'Admin Dashboard')
    console.log('Signature present:', !!signature)
    console.log('Body:', JSON.stringify(body))
    
    // 管理者からの送信リクエスト（署名なし）
    if (!isLineRequest && body.action) {
      console.log('Processing admin notification request')
      const result = await handleAdminNotification(body)
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // LINE Platform からのWebhookリクエストの署名検証
    if (isLineRequest && signature) {
      console.log('Verifying LINE webhook signature')
      const isValidSignature = await verifySignature(requestText, signature)
      
      if (!isValidSignature) {
        console.error('Invalid LINE signature')
        return new Response('Invalid signature', { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
      console.log('LINE signature verification passed')
    }

    // 通常のLINE Webhook処理
    // Webhook検証（LINE Developer Consoleからの確認）
    if (body.events && body.events.length === 0) {
      return new Response('OK', { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // 各イベントを処理
    const events = body.events || []
    await Promise.all(events.map(handleEvent))

    return new Response('OK', { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('LINE Function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})