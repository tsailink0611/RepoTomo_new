# 🎉 RepoTomo - 心理的安全性重視の報告書管理システム

## 📋 概要
RepoTomoは、心理的安全性を重視した報告書管理システムです。LINE Botとの連携により、スタッフが気軽に報告や相談ができる環境を提供します。

## 🌐 デモ環境
- **本番URL**: https://repo-tomo-new.vercel.app/
- **管理者パスワード**: `123456`

## 🚀 即座開発開始！GitHubからクローン後の手順

### **前提条件**
- Node.js 18以降
- Git
- ブラウザ

### **⚡ 3分で開発環境構築**

```bash
# 1. プロジェクトクローン
git clone https://github.com/tsailink0611/RepoTomo_new.git
cd RepoTomo_new

# 2. 依存関係インストール
npm install

# 3. 環境変数設定（自動）
cp .env.example .env.local

# 4. 開発サーバー起動
npm run dev
```

**これだけで完了！** ブラウザで `http://localhost:3000` にアクセス

## 🎯 主な機能

### **管理者機能**
- ✅ **スタッフ管理** - 新規登録・編集・削除・権限設定
- ✅ **LINE通知送信** - システム通知・リマインダー・個別回答
- ✅ **統計ダッシュボード** - アクティブスタッフ数・LINE連携状況
- ✅ **リアルタイム監視** - 提出状況・通知履歴

### **LINE Bot機能**
- ✅ **自動スタッフ連携** - スタッフIDでの簡単連携
- ✅ **双方向通信** - 通知受信・質問送信
- ✅ **3種類の通知**：
  - システム通知（全員一斉配信）
  - リマインダー通知（提出催促）
  - 質問回答（個別対応）

### **スタッフ機能**
- ✅ **LINE連携** - 簡単なスタッフID入力のみ
- ✅ **報告書提出** - 直感的な操作画面
- ✅ **質問・相談** - 匿名での気軽な相談

## 🔧 技術仕様

### **フロントエンド**
- React 18 + TypeScript
- Tailwind CSS (レスポンシブデザイン)
- Vite (高速開発環境)

### **バックエンド**
- Supabase (PostgreSQL + Edge Functions)
- LINE Messaging API
- 認証システム

### **デプロイ**
- Vercel (本番環境)
- GitHub Actions (CI/CD)

## 📱 LINE Bot設定

### **既存設定（変更不要）**
- **Supabase Project**: `imtfvkvbfdizowwpdipt`
- **Webhook URL**: `https://imtfvkvbfdizowwpdipt.supabase.co/functions/v1/line-webhook`
- **Channel Access Token**: 設定済み
- **Channel Secret**: 設定済み

### **新しい開発者が追加設定する場合**
1. LINE Developers Console にアクセス
2. 既存Botチャンネルに開発者として追加
3. 環境変数は `.env.local` に自動設定済み

## 📊 使用方法

### **管理者の操作**
1. https://repo-tomo-new.vercel.app/ にアクセス
2. 「管理者としてログイン」→ パスワード `123456`
3. スタッフ管理・通知送信を実行

### **スタッフの操作**
1. LINE BotのQRコードを管理者から取得
2. 友だち追加後、自分のスタッフIDを送信
3. 自動連携完了・通知受信開始

## 🔄 開発ワークフロー

### **新機能開発**
```bash
# 新機能ブランチ作成
git checkout -b feature/新機能名

# 開発・テスト
npm run dev
npm run build

# コミット・プッシュ
git add .
git commit -m "新機能: 機能説明"
git push origin feature/新機能名
```

### **本番デプロイ**
```bash
# メインブランチにマージ
git checkout main
git merge feature/新機能名
git push origin main
# → Vercel自動デプロイ
```

## 🧩 プロジェクト構造

```
RepoTomo_new/
├── src/
│   ├── components/          # React コンポーネント
│   ├── hooks/              # カスタムhooks
│   ├── lib/                # ライブラリ設定
│   ├── pages/              # ページコンポーネント
│   └── App.tsx             # メインアプリケーション
├── supabase/
│   └── functions/          # Edge Functions
├── .env.example            # 環境変数テンプレート
├── .env.local              # ローカル環境変数（自動生成）
├── VERSION_HISTORY.md      # バージョン履歴
└── README.md              # このファイル
```

## 🔐 環境変数

すべての環境変数は `.env.example` から自動設定されます：

```env
# Supabase接続情報
VITE_SUPABASE_URL=https://imtfvkvbfdizowwpdipt.supabase.co
VITE_SUPABASE_ANON_KEY=（設定済み）

# LINE Bot認証情報
LINE_CHANNEL_ACCESS_TOKEN=（設定済み）
LINE_CHANNEL_SECRET=（設定済み）

# システム設定
JWT_SECRET=repotomo-super-secret-key-2025
ADMIN_PASSWORD=123456
```

## 🚨 トラブルシューティング

### **よくある問題と解決方法**

#### **1. `npm run dev` でエラー**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### **2. Supabase接続エラー**
```bash
# 環境変数を再設定
cp .env.example .env.local
```

#### **3. LINE Bot通知が送信されない**
- LINE Developers Console で webhook URL を確認
- `https://imtfvkvbfdizowwpdipt.supabase.co/functions/v1/line-webhook`

#### **4. 管理画面にアクセスできない**
- パスワード: `123456` を確認
- ブラウザのキャッシュクリア

## 📈 今後の拡張予定

### **Phase 2 - 高度な機能**
- 📊 詳細な分析ダッシュボード
- 📝 カスタム報告書フォーム
- 📱 PWA対応（オフライン機能）
- 🌍 多言語対応

### **Phase 3 - エンタープライズ機能**
- 🔐 SSO・多要素認証
- 🔗 外部システム連携（Slack・Teams）
- 🎯 AI による分析・提案機能
- 📈 高度なレポート機能

## 🤝 貢献方法

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成

## 📄 ライセンス

MIT License

## 👥 開発チーム

- **開発者**: tsailink0611
- **AI アシスタント**: Claude Code
- **バージョン**: v1.0 (第1段階完成版)

---

## ⚡ 新しい開発者へのメッセージ

**このプロジェクトは即座に開発を開始できるように設計されています！**

1. `git clone` でクローン
2. `npm install` で依存関係インストール
3. `cp .env.example .env.local` で環境変数設定
4. `npm run dev` で開発開始

**すべての設定は自動化されているため、追加の設定は不要です。**

質問や問題があれば、Issue または Discussion で気軽にお声かけください！

🚀 **Happy Coding!**
