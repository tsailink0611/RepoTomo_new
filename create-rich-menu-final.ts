import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!

async function createRichMenu() {
  console.log('🚀 Creating LINE Rich Menu...')
  
  // 既存のリッチメニューを削除（念のため）
  try {
    const existingMenusResponse = await fetch('https://api.line.me/v2/bot/richmenu/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    })
    
    const existingMenus = await existingMenusResponse.json()
    console.log('Existing menus:', existingMenus)
    
    if (existingMenus.richmenus && existingMenus.richmenus.length > 0) {
      for (const menu of existingMenus.richmenus) {
        await fetch(`https://api.line.me/v2/bot/richmenu/${menu.richMenuId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
          }
        })
        console.log(`Deleted existing menu: ${menu.richMenuId}`)
      }
    }
  } catch (error) {
    console.log('No existing menus to delete')
  }

  // 新しいリッチメニューのデータ
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

  console.log('📋 Rich menu data:', JSON.stringify(richMenuData, null, 2))

  // リッチメニューを作成
  const createResponse = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(richMenuData)
  })

  const createResult = await createResponse.json()
  console.log('✅ Rich menu create result:', createResult)

  if (!createResponse.ok) {
    throw new Error(`Failed to create rich menu: ${JSON.stringify(createResult)}`)
  }

  const richMenuId = createResult.richMenuId
  console.log(`🎉 Rich menu created with ID: ${richMenuId}`)

  // シンプルな画像を作成（BASE64エンコード済み）
  // 2500x1686の4分割画像
  const simpleImageBase64 = createSimpleRichMenuImage()
  
  // 画像をアップロード
  const imageBuffer = Uint8Array.from(atob(simpleImageBase64), c => c.charCodeAt(0))
  
  const uploadImageResponse = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'image/png'
    },
    body: imageBuffer
  })

  console.log('📸 Image upload result:', uploadImageResponse.ok)

  if (uploadImageResponse.ok) {
    // リッチメニューをデフォルトに設定
    const setDefaultResponse = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    })

    console.log('🌟 Set as default result:', setDefaultResponse.ok)
    
    return {
      success: true,
      richMenuId: richMenuId,
      imageUploaded: uploadImageResponse.ok,
      setAsDefault: setDefaultResponse.ok,
      message: 'リッチメニューが正常に作成されました！'
    }
  } else {
    // 画像なしでもリッチメニューは機能する
    return {
      success: true,
      richMenuId: richMenuId,
      imageUploaded: false,
      setAsDefault: false,
      message: 'リッチメニューが作成されました（画像は後で設定してください）'
    }
  }
}

// シンプルな4分割画像を作成（BASE64）
function createSimpleRichMenuImage() {
  // 極小の透明PNG（実際の使用では適切な画像を用意）
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
}

serve(async (req) => {
  try {
    console.log('🎯 Rich Menu Creation Started')
    const result = await createRichMenu()
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('❌ Error creating rich menu:', error)
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