# RepoTomo完全デプロイメントガイド

## 📋 概要

RepoTomoは心理的安全性を重視した報告書管理システムです。React + TypeScript + Supabase + Vercelで構築されており、PWA対応でオフライン機能も備えています。

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS + Custom Components
- **状態管理**: Zustand + React Query
- **バックエンド**: Supabase (PostgreSQL + Auth + Edge Functions)
- **ホスティング**: Vercel
- **PWA**: Vite PWA Plugin + Workbox

## 🚀 デプロイメント手順

### 1. Supabaseプロジェクトセットアップ

#### 1.1 新規プロジェクト作成
```bash
# Supabaseにサインアップ
https://supabase.com

# 新規プロジェクト作成
- Project Name: RepoTomo
- Database Password: 強力なパスワードを設定
- Region: Northeast Asia (ap-northeast-1)
```

#### 1.2 データベースセットアップ
```bash
# SQL Editorで実行
supabase/migrations/20250101000000_initial_schema.sql
```

#### 1.3 認証設定
```bash
# Authentication > Settings
- Enable email confirmations: true
- Enable phone confirmations: false
- Secure email change: true
- Enable manual email confirmation: false
```

#### 1.4 API Keys取得
```bash
# Settings > API
- Project URL: https://[PROJECT_ID].supabase.co
- anon public key: [ANON_KEY]
- service_role key: [SERVICE_ROLE_KEY] (サーバーサイドのみ)
```

### 2. 環境変数設定

#### 2.1 ローカル開発用 (.env.local)
```env
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

#### 2.2 本番環境用 (Vercel設定)
```bash
# Vercel Dashboard > Environment Variables
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

### 3. Vercelデプロイメント

#### 3.1 プロジェクト準備
```bash
# 依存関係インストール
npm install

# ビルドテスト
npm run build

# ローカル確認
npm run preview
```

#### 3.2 Vercelセットアップ
```bash
# Vercelアカウント作成
https://vercel.com

# GitHubリポジトリ連携
1. Vercel Dashboard > New Project
2. Import Git Repository
3. Select: RepoTomo_new

# ビルド設定
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install
```

#### 3.3 カスタムドメイン設定（オプション）
```bash
# Vercel Dashboard > Project > Settings > Domains
- Add Domain: your-domain.com
- Configure DNS: CNAME record to alias.vercel.app
```

## 🔧 設定詳細

### PWA設定

PWAは自動的に設定済みです：

```typescript
// vite.config.ts で設定済み
- Service Worker: 自動更新
- マニフェスト: /public/manifest.json
- オフラインキャッシュ: Workbox
- アップデート通知: 自動
```

### Supabase Row Level Security

データベースアクセスはRLSで保護されています：

```sql
-- スタッフは自分のデータのみアクセス可能
-- 管理者は全データアクセス可能
-- 詳細は migration ファイルを参照
```

### 環境別設定

```typescript
// src/lib/supabase.ts
- 本番: 実際のSupabaseに接続
- 開発: モックデータまたは開発用DB
- 環境変数未設定時: 自動的にモックデータモード
```

## 📱 モバイル対応

### PWAインストール

1. **Android Chrome**:
   - ブラウザメニュー > アプリをインストール

2. **iOS Safari**:
   - 共有ボタン > ホーム画面に追加

3. **Desktop**:
   - アドレスバーのインストールアイコン

### オフライン機能

- 報告書の閲覧（キャッシュ済み）
- フォームの下書き保存
- 接続復旧時の自動同期
- オフライン状態の通知

## 🔍 監視とメンテナンス

### パフォーマンス監視

```bash
# Vercel Analytics（自動有効）
- ページ読み込み速度
- Core Web Vitals
- ユーザー数

# Lighthouse監査
npm run build
lighthouse dist/index.html --view
```

### データベース監視

```bash
# Supabase Dashboard
- Database > Logs
- API > Logs
- Auth > Logs

# アラート設定
- Database size (500MB上限)
- Monthly Active Users (50,000上限)
- API Requests
```

### コスト監視

#### 無料枠
- **Supabase**: 500MB DB + 2GB Transfer
- **Vercel**: 100GB Transfer + 6000分ビルド時間

#### 監視項目
```bash
# 月次チェック
- データベースサイズ
- 帯域幅使用量
- ビルド時間
- アクティブユーザー数
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. ビルドエラー
```bash
# TypeScriptエラー
npm run type-check

# ESLintエラー
npm run lint:fix

# 依存関係の問題
rm -rf node_modules package-lock.json
npm install
```

#### 2. Supabase接続エラー
```bash
# 環境変数確認
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# APIキー再生成
Supabase Dashboard > Settings > API > Generate new key
```

#### 3. PWAが動作しない
```bash
# HTTPS必須（本番環境）
# Service Worker登録確認
Developer Tools > Application > Service Workers

# キャッシュクリア
Developer Tools > Application > Storage > Clear site data
```

#### 4. 認証エラー
```bash
# RLS設定確認
Supabase Dashboard > Authentication > Policies

# ユーザーデータ確認
Supabase Dashboard > Authentication > Users
```

### デバッグコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド + プレビュー
npm run build && npm run preview

# 型チェック
npm run type-check

# Lint
npm run lint
```

## 📈 スケーリング計画

### フェーズ1: 基本運用（0-100ユーザー）
- 現在の構成で運用
- 無料枠内での運用監視

### フェーズ2: 拡張（100-1000ユーザー）
- Supabase Pro ($25/月)
- Vercel Pro ($20/月)
- CDN活用検討

### フェーズ3: エンタープライズ（1000+ユーザー）
- Supabase Team ($599/月)
- 複数リージョン展開
- 専用データベース検討

## 📞 サポート

### 開発チーム連絡先
- GitHub Issues: [リポジトリURL]/issues
- 緊急時: [連絡先設定]

### 外部サポート
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- React: https://react.dev/

---

**最終更新**: 2025年1月
**バージョン**: 1.0.0
**作成者**: Claude Code Assistant