#!/bin/bash

# ==========================================
# RepoTomo 自動セットアップスクリプト
# ==========================================

echo "🎉 RepoTomo セットアップを開始します..."
echo ""

# 1. 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install に失敗しました。Node.jsがインストールされているか確認してください。"
    exit 1
fi

# 2. 環境変数ファイルのコピー
echo ""
echo "🔧 環境変数を設定中..."

if [ -f ".env.local" ]; then
    echo "⚠️  .env.local が既に存在します。バックアップを作成します..."
    cp .env.local .env.local.backup
fi

cp .env.example .env.local

if [ $? -eq 0 ]; then
    echo "✅ 環境変数ファイル (.env.local) を作成しました"
else
    echo "❌ 環境変数ファイルの作成に失敗しました"
    exit 1
fi

# 3. プロジェクト構造の確認
echo ""
echo "📁 プロジェクト構造を確認中..."

if [ -d "src" ] && [ -d "supabase" ]; then
    echo "✅ プロジェクト構造が正常です"
else
    echo "❌ プロジェクト構造に問題があります"
    exit 1
fi

# 4. ビルドテスト
echo ""
echo "🔨 ビルドテストを実行中..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ ビルドテストが成功しました"
else
    echo "❌ ビルドテストに失敗しました"
    exit 1
fi

# 5. セットアップ完了
echo ""
echo "🎉 セットアップが完了しました！"
echo ""
echo "次のコマンドで開発サーバーを起動できます："
echo "  npm run dev"
echo ""
echo "管理画面URL: http://localhost:3000/admin/dashboard"
echo "管理者パスワード: 123456"
echo ""
echo "🚀 Happy Coding!"