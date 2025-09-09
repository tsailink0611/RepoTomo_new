import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!

async function setRichMenuAsDefault() {
  console.log('Setting existing rich menu as default...')
  
  const listResponse = await fetch('https://api.line.me/v2/bot/richmenu/list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    }
  })
  
  const listResult = await listResponse.json()
  console.log('Existing menus:', listResult)
  
  if (listResult.richmenus && listResult.richmenus.length > 0) {
    const richMenuId = listResult.richmenus[0].richMenuId
    console.log(`Setting menu ${richMenuId} as default`)
    
    const setDefaultResponse = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    })
    
    console.log('Set as default result:', setDefaultResponse.ok)
    
    return {
      success: true,
      richMenuId: richMenuId,
      setAsDefault: setDefaultResponse.ok,
      message: setDefaultResponse.ok ? 
        'Rich menu activated! Please check LINE app.' :
        'Failed to activate rich menu.'
    }
  } else {
    return {
      success: false,
      message: 'No rich menu found to activate.'
    }
  }
}

serve(async (req) => {
  try {
    console.log('🚀 Rich Menu Activation Started')
    const result = await setRichMenuAsDefault()
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})