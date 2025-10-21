# GitHub Actions CI/CD セットアップガイド

## 📋 概要

このドキュメントは、RepoTomoプロジェクトのGitHub Actions CI/CDパイプラインのセットアップ手順を説明します。

## ✅ 実装済み機能

### 1. コード品質チェック（全ブランチ）
- ✅ 型チェック（TypeScript）
- ✅ ユニットテスト（Vitest）
- ✅ Lintチェック（ESLint）
- ✅ ビルドチェック（Vite）
- ✅ ビルドサイズ分析

### 2. セキュリティチェック
- ✅ npm audit（依存関係の脆弱性スキャン）
- ⚠️ 高レベルの脆弱性のみ検出

### 3. デプロイ自動化
- ✅ **Pull Request**: プレビュー環境（自動）
- ✅ **develop**: 開発環境（自動デプロイ）
- ✅ **main**: 本番環境（自動デプロイ）

## 🔧 必要なGitHub Secrets

### 基本設定（必須ではない）

RepoTomoプロジェクトは**Vercelの自動デプロイ**を使用しているため、GitHub Secretsの設定は**オプション**です。

ただし、以下のケースで必要になる場合があります：

#### 1. Vercel CLI経由でデプロイする場合
```
VERCEL_TOKEN          # Vercelのアクセストークン
VERCEL_ORG_ID         # VercelのOrganization ID
VERCEL_PROJECT_ID     # VercelのProject ID
```

#### 2. 環境変数を設定する場合
```
VITE_SUPABASE_URL     # Supabase URL（.env.exampleを参照）
VITE_SUPABASE_ANON_KEY # Supabase匿名キー
```

## 📦 GitHub Secrets設定手順

### Secretsの追加方法

1. GitHubリポジトリページへ移動
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** をクリック
4. Name と Secret を入力
5. **Add secret** をクリック

### Vercel連携の設定（オプション）

#### Vercel Tokenの取得

1. [Vercel Dashboard](https://vercel.com/account/tokens)にアクセス
2. **Create Token** をクリック
3. トークン名を入力（例: `github-actions`）
4. **Create** をクリック
5. 生成されたトークンをコピーして保存

#### Vercel Project IDの取得

```bash
# プロジェクトディレクトリで実行
cat .vercel/project.json

# 出力例:
# {
#   "projectId": "prj_xxxxxxxxxxxxx",
#   "orgId": "team_xxxxxxxxxxxxx"
# }
```

## 🚀 ワークフローの動作

### トリガー条件

| イベント | ブランチ | 実行ジョブ |
|---------|---------|----------|
| Push | `main` | quality-check → security-check → deploy-production |
| Push | `develop` | quality-check → security-check → deploy-development |
| Pull Request | `main` | quality-check → deploy-preview |
| Manual | すべて | quality-check |

### ワークフロージョブ詳細

#### 1. quality-check（必須）
```yaml
✅ Checkout Code
✅ Setup Node.js 18
✅ Install Dependencies (npm ci)
✅ Type Check (tsc)
✅ Run Tests (vitest)
✅ Lint Check (eslint)
✅ Build Check (vite build)
✅ Build Size Analysis
```

#### 2. security-check（推奨）
```yaml
✅ npm audit（高レベルの脆弱性のみ）
```

#### 3. deploy-preview（PR時）
```yaml
✅ ビルド確認
✅ Vercel自動プレビューデプロイ通知
```

#### 4. deploy-production（mainブランチ）
```yaml
✅ 本番ビルド
✅ Vercel本番デプロイ（自動）
```

#### 5. deploy-development（developブランチ）
```yaml
✅ 開発ビルド
✅ Vercel開発環境デプロイ（自動）
```

## 🔍 動作確認

### 1. ワークフローの実行確認

GitHubリポジトリの **Actions** タブで確認できます。

```
https://github.com/YOUR_USERNAME/RepoTomo_new/actions
```

### 2. 初回実行時のチェックポイント

- ✅ quality-checkジョブが成功すること
- ✅ ビルドが正常に完了すること
- ✅ テストがすべてパスすること
- ⚠️ Lintエラーは警告として扱われる（CI/CD成功）

### 3. デプロイの確認

#### Vercel連携の確認

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. RepoTomoプロジェクトを選択
3. **Settings** → **Git** でGitHub連携を確認

#### デプロイ状況の確認

- **本番環境**: `https://your-project.vercel.app`
- **プレビュー環境**: Pull RequestのコメントにURLが表示される

## 🛠️ トラブルシューティング

### ❌ npm ci が失敗する場合

```bash
# ローカルで確認
npm ci

# package-lock.jsonを再生成
rm package-lock.json
npm install
git add package-lock.json
git commit -m "chore: regenerate package-lock.json"
```

### ❌ ビルドが失敗する場合

```bash
# ローカルでビルド確認
npm run build

# 型エラーを確認
npm run type-check

# Lintエラーを確認
npm run lint
```

### ❌ テストが失敗する場合

```bash
# ローカルでテスト実行
npm run test

# Watch モードで詳細確認
npm run test:watch
```

### ⚠️ Secretsが設定されていない場合

現在のワークフローは**Secretsなしでも動作**します。
Vercelの自動デプロイ機能により、以下が自動実行されます：

- ✅ Pull Requestごとにプレビュー環境を作成
- ✅ mainブランチへのマージで本番デプロイ

## 📊 パフォーマンス指標

### 想定実行時間

- **quality-check**: 約30-60秒
- **security-check**: 約10-20秒
- **deploy-preview**: 約20-30秒
- **パイプライン全体**: 約1-2分

### コスト

- GitHub Actions: 無料枠内（パブリックリポジトリは無制限）
- Vercel: 無料枠内（月100GBまで）

## 🎯 次のステップ

### 推奨設定

1. ✅ **ブランチ保護ルール**の設定
   - Settings → Branches → Add branch protection rule
   - `main`ブランチに適用
   - "Require status checks to pass" を有効化
   - `quality-check` を必須チェックに設定

2. ✅ **Environment設定**
   - Settings → Environments → New environment
   - `production`, `development`, `preview` を作成
   - 承認フローを追加（オプション）

3. ✅ **Dependabot有効化**
   - Settings → Security → Code security and analysis
   - "Dependabot alerts" を有効化
   - "Dependabot security updates" を有効化

### オプション設定

- 📧 通知設定（Slack/Discord連携）
- 📈 カバレッジレポート（Codecov連携）
- 🔍 コード品質モニタリング（SonarCloud連携）

## 📚 関連ドキュメント

- [GitHub Actions公式ドキュメント](https://docs.github.com/actions)
- [Vercelデプロイガイド](https://vercel.com/docs)
- [npm audit ドキュメント](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## 🆘 サポート

問題が発生した場合：

1. Actionsタブでエラーログを確認
2. ローカルで同じコマンドを実行して再現
3. GitHubリポジトリのIssueを作成

---

**作成日**: 2025-10-22
**バージョン**: 1.0.0
**ベース**: sap-project-frontend CI/CD設定
