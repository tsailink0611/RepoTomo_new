import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!

serve(async () => {
  try {
    const richMenuId = 'richmenu-99e8bac2dad0e7f17b73ea0a0bc18948'
    
    const response = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    })
    
    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      richMenuId: richMenuId,
      message: response.ok ? 'Default rich menu set successfully!' : 'Failed to set default'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
})