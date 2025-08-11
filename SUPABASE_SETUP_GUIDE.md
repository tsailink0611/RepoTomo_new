# Supabase セットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン
4. 「New project」をクリック
5. 以下の情報を入力：
   - Project name: `repotomo`
   - Database Password: 強力なパスワードを生成して保存
   - Region: `Northeast Asia (Tokyo)`を選択
   - Pricing Plan: `Free tier`を選択

## 2. データベースの初期化

1. Supabaseダッシュボードの左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `supabase/migrations/001_initial_schema.sql`の内容をコピー＆ペースト
4. 「Run」をクリックして実行

## 3. 認証設定

### メール認証の設定
1. Authentication → Providers → Email を有効化
2. 以下を設定：
   - Enable Email Confirmations: OFF（開発時）
   - Enable Email Change Confirmations: OFF（開発時）

### LINE Login設定（後で実装）
1. LINE Developersでチャネル作成
2. Callback URLをSupabaseに設定
3. Channel ID/Secretを取得

## 4. 環境変数の取得と設定

1. Supabaseダッシュボードの「Settings」→「API」へ移動
2. 以下の値をコピー：
   - Project URL
   - anon/public key
   - service_role key（サーバーサイド用）

3. `.env`ファイルを更新：

```env
# Supabase設定
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# サーバーサイド用（Edge Functions使用時）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 5. Row Level Security (RLS) の確認

データベースのセキュリティを確保するため、RLSが有効になっていることを確認：

1. Table Editor → 各テーブルを選択
2. RLS が「Enabled」になっていることを確認
3. Policiesタブでポリシーが適用されていることを確認

## 6. リアルタイム機能の有効化

1. Database → Replication へ移動
2. 以下のテーブルのRealtimeを有効化：
   - submissions
   - notifications
   - report_templates

## 7. Storage バケットの作成

1. Storage → Create a new bucket
2. バケット名：`submissions`
3. Public bucket: OFF
4. File size limit: 10MB
5. Allowed MIME types: 
   - `image/*`
   - `application/pdf`
   - `application/vnd.ms-excel`
   - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## 8. Edge Functions の設定（オプション）

LINE通知やスケジュール処理用：

```bash
# Supabase CLIのインストール
npm install -g supabase

# ログイン
supabase login

# 関数の作成
supabase functions new send-reminder
supabase functions new process-webhook
```

## 9. 接続テスト

```typescript
// src/lib/supabase.ts で接続をテスト
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// テスト関数
export async function testConnection() {
  const { data, error } = await supabase.from('staff').select('*').limit(1)
  if (error) {
    console.error('Connection failed:', error)
    return false
  }
  console.log('Connection successful:', data)
  return true
}
```

## 10. 本番環境へのデプロイ準備

1. Vercelに環境変数を設定
2. GitHub Actionsのシークレットに追加
3. プロダクション用のRLSポリシーを強化

## トラブルシューティング

### よくある問題と解決策

1. **CORS エラー**
   - Supabase Dashboard → Settings → API → CORS でドメインを追加

2. **RLS ポリシーエラー**
   - ポリシーが正しく設定されているか確認
   - service_role keyを使用していないか確認

3. **接続エラー**
   - 環境変数が正しく設定されているか確認
   - ネットワーク接続を確認

## 参考リンク

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [RLS ベストプラクティス](https://supabase.com/docs/guides/auth/row-level-security)