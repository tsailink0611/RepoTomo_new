# LINE BOT 完全セットアップガイド

## 📱 LINE BOT機能概要

RepoTomoのLINE BOT機能により、スタッフは以下の操作が可能です：

### 主な機能
- 📝 **報告書提出**: LINEから直接報告書を提出
- 📢 **自動リマインダー**: 設定時刻に自動でリマインダー送信
- 📊 **提出状況確認**: 自分の提出履歴を確認
- ❓ **質問・相談**: 管理者への質問送信
- 🔔 **リアルタイム通知**: 管理者からの回答を即座に受信

## 🔧 セットアップ手順

### 1. LINE Developers Console設定

#### 1.1 アカウント作成
```bash
1. https://developers.line.biz/ja/ にアクセス
2. LINEアカウントでログイン
3. 「プロバイダー作成」をクリック
   - プロバイダー名: RepoTomo
```

#### 1.2 Messaging APIチャンネル作成
```bash
1. 「新規チャンネル作成」
2. チャンネルタイプ: Messaging API
3. 必要情報入力:
   - チャンネル名: RepoTomo Bot
   - チャンネル説明: 報告書管理システム
   - 大業種: その他
   - 小業種: その他
```

#### 1.3 チャンネル設定
```bash
# Messaging API設定
1. 「Messaging API」タブを開く
2. Webhook URL:
   https://[YOUR-PROJECT-ID].supabase.co/functions/v1/line-webhook
   
3. Webhook: ON
4. 応答メッセージ: OFF
5. あいさつメッセージ: ON
```

#### 1.4 アクセストークン取得
```bash
# チャンネルアクセストークン
1. 「Messaging API」タブ
2. 「チャンネルアクセストークン」セクション
3. 「発行」をクリック
4. トークンをコピー
```

### 2. Supabase Edge Functions設定

#### 2.1 環境変数設定
```bash
# Supabase Dashboard > Project Settings > Edge Functions
LINE_CHANNEL_ACCESS_TOKEN=[取得したアクセストークン]
LINE_CHANNEL_SECRET=[チャンネルシークレット]
```

#### 2.2 Edge Functionsデプロイ
```bash
# Supabase CLIインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトリンク
supabase link --project-ref [PROJECT_ID]

# Functions デプロイ
supabase functions deploy line-webhook
supabase functions deploy send-reminder
```

### 3. リッチメニュー設定

#### 3.1 リッチメニュー画像作成
- サイズ: 2500x1686px または 2500x843px
- 形式: PNG/JPEG
- ファイルサイズ: 1MB以下

#### 3.2 LINE Official Account Manager設定
```bash
1. https://manager.line.biz/ にアクセス
2. アカウントを選択
3. 「リッチメニュー」 > 「作成」

設定内容:
- タイトル: メインメニュー
- 表示期間: 期間なし
- メニューバーのテキスト: メニュー
- メニューのデフォルト表示: ON
```

#### 3.3 タップ領域設定
```bash
領域1: 報告書提出
- タイプ: テキスト
- テキスト: 報告

領域2: 提出状況
- タイプ: テキスト  
- テキスト: 状況

領域3: ヘルプ
- タイプ: テキスト
- テキスト: ヘルプ

領域4: 設定
- タイプ: テキスト
- テキスト: 設定
```

### 4. 定期実行設定（Cronジョブ）

#### 4.1 Supabase Cron設定
```sql
-- supabase/migrations/20250102000000_cron_jobs.sql

-- pg_cron拡張を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 毎日18:00にリマインダー送信（日報）
SELECT cron.schedule(
  'daily-reminder',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT_ID].supabase.co/functions/v1/send-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'reportId', (SELECT id FROM report_templates WHERE name = '日報' LIMIT 1)
    )
  );
  $$
);

-- 毎週金曜17:00にリマインダー送信（週報）
SELECT cron.schedule(
  'weekly-reminder',
  '0 17 * * 5',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT_ID].supabase.co/functions/v1/send-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'reportId', (SELECT id FROM report_templates WHERE name = '週報' LIMIT 1)
    )
  );
  $$
);
```

### 5. LINE BOT動作テスト

#### 5.1 友だち追加
```bash
1. LINE Developers Console
2. 「Messaging API」タブ
3. QRコードをスキャン
4. 友だち追加
```

#### 5.2 動作確認チェックリスト
- [ ] 友だち追加時のあいさつメッセージ
- [ ] 「メニュー」コマンドでメニュー表示
- [ ] 「報告」コマンドで報告書一覧表示
- [ ] 報告書選択→状態選択→提出完了
- [ ] 「状況」コマンドで履歴確認
- [ ] リマインダー受信（設定時刻）

### 6. ユーザー登録フロー

#### 6.1 スタッフのLINE連携
```sql
-- 管理画面から実行、またはSQLで直接更新
UPDATE staff 
SET line_user_id = '[LINE_USER_ID]'
WHERE staff_id = '[STAFF_ID]';
```

#### 6.2 初回メッセージ対応
```typescript
// 初回メッセージ時の自動登録
// line-webhook/index.ts で実装済み
// スタッフIDを送信すると自動的に紐付け
```

## 📊 LINE BOT管理

### 利用状況モニタリング
```bash
# LINE Developers Console
1. 「統計情報」タブ
2. 確認項目:
   - メッセージ送信数
   - 友だち数
   - ブロック数
```

### メッセージ配信数管理
```bash
# 無料枠: 月1000通
# 監視項目:
- Push API使用数
- Reply API使用数（無制限）
- Multicast API使用数
```

### エラー監視
```bash
# Supabase Dashboard
1. Edge Functions > Logs
2. エラーログ確認
3. 実行時間監視
```

## 🚨 トラブルシューティング

### Webhookが動作しない
```bash
1. Webhook URLが正しいか確認
2. Supabase Edge Functionがデプロイされているか確認
3. LINE Developers ConsoleでWebhook検証
4. SSL証明書の確認（HTTPS必須）
```

### リマインダーが送信されない
```bash
1. Cronジョブが登録されているか確認
SELECT * FROM cron.job;

2. Edge Function実行ログ確認
3. LINE_CHANNEL_ACCESS_TOKENの有効期限確認
4. スタッフのline_user_idが設定されているか確認
```

### メッセージが文字化けする
```bash
1. UTF-8エンコーディング確認
2. Content-Type: application/json 確認
3. 絵文字の使用を確認
```

## 📱 ユーザー向け使い方ガイド

### 基本コマンド
```
メニュー : メインメニューを表示
報告    : 報告書提出画面
状況    : 提出履歴確認
ヘルプ  : 使い方ガイド
```

### 報告書提出の流れ
```
1. 「報告」と送信
2. 報告書を選択
3. 状態を選択（完了/質問/一部/延長）
4. 確認メッセージ受信
```

### 通知設定
```
現在の通知時刻: 18:00（デフォルト）
変更希望の場合は管理者に連絡
```

## 🔒 セキュリティ注意事項

1. **アクセストークンの管理**
   - 環境変数で管理
   - GitHubにコミットしない
   - 定期的に再発行

2. **Webhook署名検証**
   - LINE_CHANNEL_SECRETで検証
   - 不正なリクエストを拒否

3. **Rate Limiting**
   - 1ユーザー1分間に10メッセージまで
   - DDoS対策実装

---

**最終更新**: 2025年1月
**バージョン**: 1.0.0
**作成者**: Claude Code Assistant