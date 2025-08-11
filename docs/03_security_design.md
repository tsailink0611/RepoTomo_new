# RepoTomo セキュリティ設計書

## 概要
RepoTomoシステムのセキュリティ設計書です。個人情報保護、認証・認可、データ保護の観点から安全なシステム構築を行います。

## セキュリティ原則

1. **最小権限の原則**: 必要最小限のアクセス権限のみ付与
2. **多層防御**: 複数のセキュリティレイヤーで保護
3. **ゼロトラスト**: すべてのアクセスを検証
4. **暗号化**: 保存時・通信時のデータ暗号化

## 認証・認可

### 認証フロー

```
┌─────────┐      ┌─────────┐      ┌──────────┐      ┌─────────┐
│  User   │─────▶│  LINE   │─────▶│ Supabase │─────▶│   App   │
│         │      │  Login  │      │   Auth   │      │         │
└─────────┘      └─────────┘      └──────────┘      └─────────┘
     │                                   │                  │
     │              OAuth 2.0            │                  │
     └──────────────────────────────────┘                  │
                                         │                  │
                                         ▼                  ▼
                                   ┌──────────┐      ┌─────────┐
                                   │   JWT    │      │ Session │
                                   │  Token   │      │ Storage │
                                   └──────────┘      └─────────┘
```

### JWT構成
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "STAFF",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 認可レベル

| ロール | 権限 |
|--------|------|
| STAFF | 自分のデータの読み書き |
| MANAGER | 全スタッフデータの読み取り、返信 |
| ADMIN | 全データの読み書き、システム設定 |

## Row Level Security (RLS)

### 実装例

```sql
-- スタッフテーブルのRLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- ポリシー: 自分のデータのみ参照可能
CREATE POLICY "own_data_policy" ON staff
  FOR SELECT
  USING (auth.uid() = id);

-- ポリシー: 管理者は全データ参照可能
CREATE POLICY "admin_read_all" ON staff
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ポリシー: 自分のデータのみ更新可能
CREATE POLICY "own_data_update" ON staff
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 提出データのRLS

```sql
-- 提出履歴のRLS
CREATE POLICY "submission_policy" ON submissions
  FOR ALL
  USING (
    -- 自分の提出データ
    auth.uid() = staff_id
    OR
    -- 管理者権限
    EXISTS (
      SELECT 1 FROM staff
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'MANAGER')
    )
  );
```

## データ保護

### 暗号化

1. **通信の暗号化**
   - HTTPS必須（TLS 1.3）
   - HSTS有効化
   - 証明書ピンニング（モバイルアプリ）

2. **保存データの暗号化**
   - Supabase: PostgreSQL透過的暗号化
   - 機密フィールド: アプリケーションレベル暗号化

```typescript
// 機密データの暗号化例
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

### 個人情報管理

1. **収集する個人情報**
   - 氏名（必須）
   - LINE UserID（任意）
   - メールアドレス（任意）

2. **保護対策**
   - 最小限の情報収集
   - 定期的なデータ削除（3ヶ月）
   - アクセスログの記録

## 入力検証とサニタイゼーション

### バックエンド検証

```typescript
// Zodを使用した入力検証
import { z } from 'zod'

const submissionSchema = z.object({
  report_id: z.string().uuid(),
  staff_id: z.string().uuid(),
  answers: z.record(z.any()),
  mood: z.enum(['happy', 'neutral', 'need_help']).optional(),
  has_question: z.boolean(),
  question: z.string().max(1000).optional()
})

export function validateSubmission(data: unknown) {
  return submissionSchema.parse(data)
}
```

### フロントエンド検証

```typescript
// XSS対策
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  })
}

// SQLインジェクション対策（Supabaseが自動処理）
// 追加の対策は不要
```

## セキュリティヘッダー

### Vercelでの設定（vercel.json）

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## アクセス制御

### API レート制限

```typescript
// Rate Limiting実装
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const userLimit = rateLimit.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}
```

### CORS設定

```typescript
// Supabase Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 