# 🛡️ RepoTomo 安全開発ガイド

## 🚀 開発開始前の手順

```bash
# 1. 現在のブランチ確認
git status
git branch --show-current

# 2. 新しいブランチで作業 (超低コスト構成)
git checkout -b feature/supabase-implementation-$(date +%Y%m%d)

# 3. 環境変数の安全確認
echo "環境変数ファイル（.env）は絶対にコミットしない"
```

## 🆘 緊急時の復旧手順

### レベル1: コード変更の取り消し
```bash
git reset --soft HEAD~1  # 直前のコミットに戻す
```

### レベル2: 作業中の変更破棄
```bash
git reset --hard HEAD    # 作業中の変更を破棄
git clean -fd            # 未追跡ファイル削除
```

### レベル3: Supabase/Vercel設定問題
```bash
# Supabaseプロジェクトリセット
supabase db reset

# Vercel設定確認
vercel env ls
vercel logs
```

### レベル4: 完全復旧
```bash
# 安定版ブランチに戻る
git checkout main
git pull origin main
```

## 📋 AIエージェント開発時の安全ルール

```markdown
重要な安全ルール:
1. メインブランチ(main)は絶対に直接編集しない
2. 環境変数(.env, API KEY等)は絶対にコミットしない
3. Supabase・Vercelの本番設定は慎重に扱う
4. 作業は feature/* ブランチで行う
5. 無料枠の制限を超えないよう注意
6. 問題が発生したら即座に作業を停止
7. コスト発生の可能性がある操作は事前確認
```

## 💰 コスト安全対策

```bash
# 無料枠監視コマンド
# Supabase使用量確認
supabase projects usage

# Vercel使用量確認  
vercel inspect

# データベースサイズ確認
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

## 🔍 定期チェックコマンド

```bash
# 現在の状況確認
git status
git branch --show-current

# 最近の変更確認  
git log --oneline -5

# リモートとの同期確認
git fetch origin
git status

# 環境変数確認（機密情報漏洩チェック）
grep -r "SUPABASE\|LINE\|SECRET" . --exclude-dir=node_modules --exclude-dir=.git

# 無料枠使用量確認
echo "Supabase DB使用量: $(supabase projects usage 2>/dev/null || echo '確認できませんでした')"
echo "Vercel使用量確認: vercel inspect で手動確認してください"
```

## 📞 トラブル時の対応

### リポジトリ情報
- **Repository**: https://github.com/tsailink0611/RepoTomo.git
- **メインブランチ**: main
- **開発ブランチ**: feature/supabase-implementation-*

### 主要サービス
- **Supabase**: [プロジェクトダッシュボード](https://supabase.com/dashboard)
- **Vercel**: [プロジェクトダッシュボード](https://vercel.com/dashboard)
- **Cloudflare**: [ダッシュボード](https://dash.cloudflare.com/)
- **LINE Developer**: [コンソール](https://developers.line.biz/console/)

### 緊急時チェックリスト
- [ ] git status で現在の状態確認
- [ ] 環境変数ファイルがコミットされていないか確認
- [ ] Supabase/Vercel の使用量確認
- [ ] エラーログの確認（Vercel Functions, Supabase Logs）
- [ ] 必要に応じて安定版ブランチに戻す

### 技術サポート文書
- `docs/01_database_design.md` - データベース設計
- `docs/02_api_specification.md` - API仕様
- `docs/03_security_design.md` - セキュリティ設計
- `docs/04_environment_setup.md` - 環境構築
- `docs/05_deployment_architecture.md` - デプロイ設計

## 🔒 セキュリティチェックリスト

### 開発前
- [ ] .gitignore に .env が含まれている
- [ ] 新しいブランチで作業している
- [ ] Supabase/Vercel の使用量を確認した

### コミット前
- [ ] 機密情報が含まれていないか確認
- [ ] 不要なファイルが含まれていないか確認
- [ ] コミットメッセージが適切

### デプロイ前
- [ ] 環境変数が正しく設定されている
- [ ] 無料枠の制限内である
- [ ] セキュリティ設定が適切

## 🚨 よくある問題と対処法

### 1. 環境変数が読み込めない
```bash
# .env ファイルの確認
cat .env

# 環境変数の再読み込み
source .env
```

### 2. Supabase接続エラー
```bash
# Supabase状態確認
supabase status

# 再接続
supabase db reset
supabase start
```

### 3. Git関連のエラー
```bash
# リモートとの同期
git fetch --all
git reset --hard origin/main
```

---

**重要**: このガイドは定期的に更新してください。問題が発生した場合は、まずこのガイドを参照し、解決できない場合はチームに相談してください。 