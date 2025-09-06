import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!

serve(async () => {
  try {
    // リッチメニュー一覧取得
    const listResponse = await fetch('https://api.line.me/v2/bot/richmenu/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    })
    
    const listResult = await listResponse.json()
    
    // デフォルトリッチメニュー取得
    const defaultResponse = await fetch('https://api.line.me/v2/bot/user/all/richmenu', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    })
    
    const defaultResult = await defaultResponse.json()
    
    const result = {
      richMenus: listResult,
      defaultRichMenu: defaultResult,
      hasRichMenus: listResult.richmenus && listResult.richmenus.length > 0,
      hasDefault: defaultResponse.ok && defaultResult.richMenuId
    }
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})