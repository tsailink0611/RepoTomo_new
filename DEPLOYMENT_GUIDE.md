# RepoTomo デプロイメントガイド

## 前提条件

- Supabaseプロジェクトが設定済み（SUPABASE_SETUP_GUIDE.md参照）
- Vercelアカウント作成済み
- GitHubリポジトリ作成済み

## 1. GitHub リポジトリの準備

```bash
# リポジトリを初期化
git init
git add .
git commit -m "Initial commit"

# GitHubにプッシュ
git remote add origin https://github.com/your-username/repotomo.git
git branch -M main
git push -u origin main
```

## 2. Vercel へのデプロイ

### 2.1 Vercelプロジェクトの作成

1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリをインポート
4. プロジェクト名：`repotomo`を設定

### 2.2 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=RepoTomo
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### 2.3 ビルド設定

```json
{
  "buildCommand": "cd repotomo && npm run build",
  "outputDirectory": "repotomo/dist",
  "installCommand": "cd repotomo && npm install"
}
```

### 2.4 デプロイ

「Deploy」ボタンをクリックして自動デプロイを開始

## 3. カスタムドメインの設定

### 3.1 Cloudflare DNS設定

1. Cloudflareダッシュボードにログイン
2. DNSレコードを追加：
   - Type: CNAME
   - Name: @ (または www)
   - Target: cname.vercel-dns.com

### 3.2 Vercelでドメイン追加

1. Vercelプロジェクト設定 → Domains
2. カスタムドメインを追加：`repotomo.app`
3. SSL証明書が自動発行される

## 4. PWA設定

### 4.1 manifest.json の確認

```json
{
  "name": "RepoTomo",
  "short_name": "RepoTomo",
  "description": "心理的安全性重視の報告書管理システム",
  "theme_color": "#f97316",
  "background_color": "#fff7ed",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4.2 Service Worker の設定

vite-plugin-pwaが自動生成

## 5. セキュリティ設定

### 5.1 Content Security Policy

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://supabase.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 5.2 環境変数の保護

- Vercelの環境変数は暗号化される
- VITE_プレフィックスの変数のみクライアントに公開
- service_role_keyは絶対にクライアントに公開しない

## 6. モニタリング設定

### 6.1 Vercel Analytics

1. Vercelダッシュボード → Analytics
2. 有効化してパフォーマンスを監視

### 6.2 エラートラッキング（オプション）

Sentryを使用する場合：

```bash
npm install @sentry/react
```

```javascript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
});
```

## 7. CI/CD設定

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd repotomo
          npm ci
          
      - name: Run tests
        run: |
          cd repotomo
          npm test
          
      - name: Build
        run: |
          cd repotomo
          npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## 8. 本番環境チェックリスト

- [ ] Supabase RLSポリシーが正しく設定されている
- [ ] 環境変数が本番用に設定されている
- [ ] SSL証明書が有効
- [ ] PWAが正しくインストール可能
- [ ] CSPヘッダーが設定されている
- [ ] エラートラッキングが有効
- [ ] バックアップ戦略が確立されている
- [ ] ロールバック手順が文書化されている

## 9. トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
cd repotomo
npm run build
npm run preview
```

### 環境変数が読み込まれない

- Vercelダッシュボードで再デプロイ
- 環境変数名がVITE_で始まることを確認

### CORS エラー

Supabaseダッシュボードで許可オリジンを追加：
- https://repotomo.app
- https://www.repotomo.app
- https://repotomo.vercel.app

## 10. パフォーマンス最適化

### Lighthouse スコア目標

- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100

### 最適化手法

1. 画像の最適化（WebP形式）
2. コード分割（React.lazy）
3. CDN活用（Vercel Edge Network）
4. Service Workerキャッシング

## サポート

問題が発生した場合：
1. Vercelステータスページを確認
2. Supabaseステータスページを確認
3. GitHubイシューで報告