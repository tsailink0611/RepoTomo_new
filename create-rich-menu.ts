// LINE リッチメニュー作成スクリプト
// Supabase Edge Function として実行可能

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!

async function createRichMenu() {
  // リッチメニューの作成
  const richMenuData = {
    size: {
      width: 2500,
      height: 1686
    },
    selected: false,
    name: "RepoTomo メインメニュー",
    chatBarText: "メニュー",
    areas: [
      {
        bounds: { x: 0, y: 0, width: 1250, height: 843 },
        action: { type: "message", text: "メニュー" }
      },
      {
        bounds: { x: 1250, y: 0, width: 1250, height: 843 },
        action: { type: "message", text: "報告" }
      },
      {
        bounds: { x: 0, y: 843, width: 1250, height: 843 },
        action: { type: "message", text: "状況" }
      },
      {
        bounds: { x: 1250, y: 843, width: 1250, height: 843 },
        action: { type: "message", text: "ヘルプ" }
      }
    ]
  }

  // リッチメニューを作成
  const response = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(richMenuData)
  })

  const result = await response.json()
  console.log('Rich menu created:', result)
  
  if (result.richMenuId) {
    // リッチメニューをデフォルトに設定
    const setDefaultResponse = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${result.richMenuId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    })
    
    console.log('Set as default:', setDefaultResponse.ok)
  }

  return result
}

serve(async () => {
  try {
    const result = await createRichMenu()
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})