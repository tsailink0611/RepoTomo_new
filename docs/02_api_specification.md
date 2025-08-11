# RepoTomo API仕様書

> ⚠️ このAPI仕様書は未完成の部分があります。プロジェクト進行中に不具合や不足があれば、適宜修正・更新してください。このメッセージも仕様書の一部として残します。

## 概要
RepoTomoシステムのAPI仕様書です。Supabaseの自動生成REST APIとカスタムEdge Functionsを組み合わせて実装します。

## 基本情報

### ベースURL
```
開発環境: http://localhost:54321
本番環境: https://[project-id].supabase.co
```

### 認証
- Supabase Auth (JWT Bearer Token)
- LINE Login OAuth連携

### レスポンス形式
- Content-Type: application/json
- 文字コード: UTF-8

## 認証API

### LINE Login
```
POST /auth/v1/token?grant_type=password
```

**リクエスト例:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**レスポンス例:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here"
}
```

### ユーザー情報取得
```
GET /auth/v1/user
Authorization: Bearer {access_token}
```

## REST API（自動生成）

### スタッフ管理

#### スタッフ一覧取得
```
GET /rest/v1/staff
Authorization: Bearer {access_token}
```

**クエリパラメータ:**
- `is_active=eq.true` - アクティブなスタッフのみ
- `select=id,name,role` - 取得フィールド指定
- `order=name.asc` - 名前順でソート

**レスポンス例:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "山田太郎",
    "role": "STAFF",
    "is_active": true
  }
]
```

#### スタッフ詳細取得
```
GET /rest/v1/staff?id=eq.{staff_id}
Authorization: Bearer {access_token}
```

### 報告書テンプレート

#### テンプレート一覧取得
```
GET /rest/v1/report_templates?is_active=eq.true
Authorization: Bearer {access_token}
```

**レスポンス例:**
```json
[
  {
    "id": "template-uuid",
    "title": "日報",
    "description": "今日も一日お疲れさまでした！",
    "frequency": "DAILY",
    "emoji": "☀️"
  }
]
```

#### 質問項目付きテンプレート取得
```
GET /rest/v1/report_templates?select=*,questions(*)
Authorization: Bearer {access_token}
```

### 提出管理

#### 報告書提出
```
POST /rest/v1/submissions
Authorization: Bearer {access_token}
Content-Type: application/json
```

**リクエスト例:**
```json
{
  "report_id": "template-uuid",
  "staff_id": "staff-uuid",
  "answers": {
    "q1": "今日の業務内容...",
    "q2": 4,
    "q3": false
  },
  "mood": "happy",
  "has_question": false
}
```

#### 提出履歴取得
```
GET /rest/v1/submissions?staff_id=eq.{staff_id}&order=submitted_at.desc
Authorization: Bearer {access_token}
```

### 相談・質問

#### 相談投稿
```
POST /rest/v1/consultations
Authorization: Bearer {access_token}
Content-Type: application/json
```

**リクエスト例:**
```json
{
  "staff_id": "staff-uuid",
  "title": "シフトについて相談があります",
  "content": "来週のシフトなのですが...",
  "is_anonymous": false,
  "priority": "MEDIUM"
}
```

#### 管理者返信
```
PATCH /rest/v1/consultations?id=eq.{consultation_id}
Authorization: Bearer {access_token}
Content-Type: application/json
```

**リクエスト例:**
```json
{
  "admin_reply": "ご相談ありがとうございます。シフトについては...",
  "status": "RESOLVED",
  "replied_at": "2025-01-23T10:00:00Z"
}
```

## Edge Functions（カスタムAPI）

### リマインダー送信
```
POST /functions/v1/send-reminder
Authorization: Bearer {service_role_key}
Content-Type: application/json
```

**リクエスト例:**
```json
{
  "template_id": "template-uuid",
  "staff_ids": ["staff-uuid-1", "staff-uuid-2"],
  "message": "優しいリマインダーメッセージ"
}
```

### LINE Webhook
```
POST /functions/v1/line-webhook
X-Line-Signature: {signature}
Content-Type: application/json
```

**リクエスト例（LINE形式）:**
```json
{
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "text": "提出完了"
      },
      "source": {
        "userId": "line-user-id"
      },
      "replyToken": "reply-token"
    }
  ]
}
```

### 統計情報取得
```
GET /functions/v1/statistics?period=week
Authorization: Bearer {access_token}
```

**レスポンス例:**
```json
{
  "submission_rate": 0.92,
  "average_response_time": 120,
  "mood_distribution": {
    "happy": 65,
    "neutral": 30,
    "need_help": 5
  }
}
```

## リアルタイムAPI（WebSocket）

### 接続
```javascript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(url, key)

// リアルタイム接続
const channel = supabase
  .channel('submissions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'submissions' },
    (payload) => {
      console.log('新しい提出:', payload.new)
    }
  )
  .subscribe()
```

### イベントタイプ
- `INSERT` - 新規作成
- `UPDATE` - 更新
- `DELETE` - 削除

## エラーレスポンス

### エラー形式
```json
{
  "code": "23505",
  "details": "Key (staff_id)=(xxx) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint"
}
```

### 主なエラーコード
- `400` - Bad Request（リクエスト不正）
- `401` - Unauthorized（認証エラー）
- `403` - Forbidden（権限エラー）
- `404` - Not Found（リソース不在）
- `429` - Too Many Requests（レート制限）
- `500` - Internal Server Error（サーバーエラー）

## レート制限

### 無料プラン制限
- API呼び出し: 500回/時間
- データベース接続: 60接続
- ストレージ: 1GB
- 帯域幅: 2GB/月

### 制限回避策
- React Queryでキャッシュ管理
- バッチ処理の活用
- 不要なリアルタイム接続の削除

## 使用例

### TypeScriptでの実装例
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 報告書提出
async function submitReport(data: ReportSubmission) {
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({
      report_id: data.reportId,
      staff_id: data.staffId,
      answers: data.answers,
      mood: data.mood
    })
    .select()
    .single()

  if (error) throw error
  return submission
}

// リアルタイム監視
function watchSubmissions(callback: (submission: any) => void) {
  return supabase
    .channel('admin-submissions')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'submissions' },
      (payload) => callback(payload.new)
    )
    .subscribe()
}
```

## セキュリティ考慮事項

1. **Row Level Security (RLS)**
   - すべてのテーブルでRLS有効化
   - ユーザーは自分のデータのみアクセス可能

2. **API Key管理**
   - `anon key`: フロントエンドで使用
   - `service_role key`: サーバーサイドのみ

3. **CORS設定**
   - 本番環境では特定のドメインのみ許可

4. **入力検証**
   - SQLインジェクション対策（Supabase自動対応）
   - XSS対策（フロントエンドで実装） 