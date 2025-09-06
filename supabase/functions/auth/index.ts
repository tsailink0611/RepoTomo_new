import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, verify } from 'https://deno.land/x/djwt@v2.4/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface LoginRequest {
  username: string
  password: string
}

interface VerifyRequest {
  token: string
}

// パスワードハッシュ化（簡易版）
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// パスワード検証
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}

// JWTトークン生成
async function createJWT(userId: string, username: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )

  const payload = {
    sub: userId,
    username: username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24時間
  }

  return await create({ alg: 'HS256', typ: 'JWT' }, payload, key)
}

// ログイン処理
async function handleLogin(request: LoginRequest) {
  try {
    const { username, password } = request

    // ユーザー認証
    const { data: user } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, is_active')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (!user) {
      return {
        success: false,
        error: 'ユーザー名またはパスワードが正しくありません'
      }
    }

    // パスワード検証
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return {
        success: false,
        error: 'ユーザー名またはパスワードが正しくありません'
      }
    }

    // JWTトークン生成
    const token = await createJWT(user.id, user.username)

    // セッション保存
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await supabase.from('user_sessions').insert({
      user_id: user.id,
      session_token: token,
      expires_at: expiresAt.toISOString()
    })

    return {
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'ログイン処理中にエラーが発生しました'
    }
  }
}

// トークン検証
async function handleVerify(request: VerifyRequest) {
  try {
    const { token } = request

    // データベースでセッション確認
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at, admin_users(id, username, is_active)')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session || !session.admin_users?.is_active) {
      return {
        success: false,
        error: 'セッションが無効です'
      }
    }

    return {
      success: true,
      user: {
        id: session.admin_users.id,
        username: session.admin_users.username
      }
    }
  } catch (error) {
    console.error('Verify error:', error)
    return {
      success: false,
      error: 'トークン検証中にエラーが発生しました'
    }
  }
}

// ログアウト処理
async function handleLogout(token: string) {
  try {
    await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', token)

    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: 'ログアウト処理中にエラーが発生しました'
    }
  }
}

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname

    if (req.method === 'POST' && path.endsWith('/login')) {
      const body: LoginRequest = await req.json()
      const result = await handleLogin(body)
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (req.method === 'POST' && path.endsWith('/verify')) {
      const body: VerifyRequest = await req.json()
      const result = await handleVerify(body)
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (req.method === 'POST' && path.endsWith('/logout')) {
      const body = await req.json()
      const result = await handleLogout(body.token)
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    return new Response('Not Found', { status: 404 })
  } catch (error) {
    console.error('Auth API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'サーバーエラーが発生しました'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})