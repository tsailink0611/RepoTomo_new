# RepoTomo ゼロから構築ロードマップ

## 🎯 プロジェクト構築の全体像

### 開発期間：4週間（1ヶ月）
- **Week 1**: 環境構築とプロジェクト基盤
- **Week 2**: コア機能実装（MVP）
- **Week 3**: PWA化と高度機能
- **Week 4**: テスト・最適化・デプロイ

## 📅 Week 1: 環境構築とプロジェクト基盤（Day 1-7）

### Day 1: Windows開発環境セットアップ
```bash
# 1. 必須ソフトウェアインストール
- Git for Windows (https://git-scm.com/download/win)
- Node.js 18 LTS (https://nodejs.org/)
- Visual Studio Code (https://code.visualstudio.com/)
- Google Chrome (開発者ツール用)

# 2. VS Code拡張機能インストール
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- GitLens
- Thunder Client (API テスト用)
```

### Day 2: プロジェクト初期化
```bash
# 1. プロジェクトディレクトリ作成
mkdir C:\Projects\RepoTomo
cd C:\Projects\RepoTomo

# 2. Gitリポジトリ初期化
git init
git branch -M main

# 3. React + Vite プロジェクト作成
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# 4. 基本的な依存関係インストール
npm install @supabase/supabase-js zustand @tanstack/react-query
npm install react-router-dom react-hot-toast
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom

# 5. Tailwind CSS設定
npx tailwindcss init -p
```

### Day 3: Supabaseプロジェクト設定
```bash
# 1. Supabaseアカウント作成
# https://supabase.com にアクセス

# 2. 新規プロジェクト作成（Web UI）
- Project name: repotomo-prod
- Database Password: 強力なパスワード生成
- Region: Asia Northeast (Tokyo)

# 3. 環境変数取得・設定
# frontend/.env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# 4. データベーススキーマ作成
# Supabase Dashboard → SQL Editor で実行
```

### Day 4: プロジェクト構造構築
```
RepoTomo/
├── frontend/                    # Reactアプリケーション
│   ├── src/
│   │   ├── components/         # UIコンポーネント
│   │   │   ├── common/        # 共通コンポーネント
│   │   │   ├── staff/         # スタッフ向け
│   │   │   └── admin/         # 管理者向け
│   │   ├── pages/             # ページコンポーネント
│   │   ├── hooks/             # カスタムフック
│   │   ├── lib/               # Supabase設定
│   │   ├── types/             # TypeScript型定義
│   │   ├── utils/             # ユーティリティ
│   │   └── styles/            # グローバルスタイル
│   ├── public/                # 静的ファイル
│   └── package.json
├── supabase/                   # Supabase設定
│   ├── migrations/            # DBマイグレーション
│   └── functions/             # Edge Functions
└── docs/                       # ドキュメント
```

### Day 5: 型定義とAPI層実装
```typescript
// 1. データベース型定義作成
// src/types/database.ts
export interface Staff {
  id: string
  staffId: string
  name: string
  lineUserId?: string
  role: 'STAFF' | 'MANAGER' | 'ADMIN'
  isActive: boolean
}

// 2. Supabaseクライアント設定
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 3. API層実装
// src/lib/api.ts
export const api = {
  auth: { /* 認証関連 */ },
  staff: { /* スタッフ管理 */ },
  submissions: { /* 報告書管理 */ }
}
```

### Day 6: 基本UIコンポーネント作成
```typescript
// 1. デザインシステム定義
// src/styles/theme.ts
export const theme = {
  colors: {
    primary: '#FF8C69',
    secondary: '#FFE5CC',
    // ...
  }
}

// 2. 基本コンポーネント作成
- GentleButton (優しいボタン)
- Card (カードコンポーネント)
- LoadingSpinner (ローディング)
- ErrorMessage (エラー表示)
```

### Day 7: Git設定と初回コミット
```bash
# 1. .gitignore作成
node_modules/
.env
.env.local
dist/
*.log

# 2. 初回コミット
git add .
git commit -m "初期プロジェクト構築"

# 3. GitHubリポジトリ作成・プッシュ
git remote add origin https://github.com/yourusername/RepoTomo.git
git push -u origin main
```

## 📅 Week 2: コア機能実装（Day 8-14）

### Day 8-9: 認証システム実装
```typescript
// 1. 認証フック作成
// src/hooks/useAuth.ts

// 2. ログインページ実装
// src/pages/Login.tsx

// 3. 認証ガード実装
// src/components/ProtectedRoute.tsx
```

### Day 10-11: スタッフ向け機能
```typescript
// 1. ダッシュボード
// src/pages/staff/Dashboard.tsx

// 2. 報告書提出フォーム
// src/pages/staff/ReportForm.tsx

// 3. 提出完了画面
// src/pages/staff/Complete.tsx
```

### Day 12-13: 管理者向け機能
```typescript
// 1. 管理者ダッシュボード
// src/pages/admin/Dashboard.tsx

// 2. スタッフ一覧・管理
// src/pages/admin/StaffList.tsx

// 3. レポート分析
// src/pages/admin/Analytics.tsx
```

### Day 14: データ連携とテスト
```bash
# 1. モックデータ作成
# src/mocks/mockData.ts

# 2. 基本的な動作確認
# 3. バグ修正
```

## 📅 Week 3: PWA化と高度機能（Day 15-21）

### Day 15-16: PWA実装
```typescript
// 1. PWAプラグイン導入
npm install -D vite-plugin-pwa

// 2. Service Worker設定
// vite.config.ts

// 3. オフライン対応
// src/hooks/useOfflineSync.ts
```

### Day 17-18: リアルタイム機能
```typescript
// 1. Realtimeサブスクリプション
// src/hooks/useRealtime.ts

// 2. 通知システム
// src/components/NotificationSystem.tsx
```

### Day 19-20: アチーブメントシステム
```typescript
// 1. アチーブメント管理
// src/hooks/useAchievements.ts

// 2. バッジ表示UI
// src/components/AchievementBadge.tsx
```

### Day 21: LINE連携準備
```typescript
// 1. LINE Login設定
// 2. Webhook準備
// 3. Edge Functions作成
```

## 📅 Week 4: テスト・最適化・デプロイ（Day 22-28）

### Day 22-23: テスト実装
```bash
# 1. テストセットアップ
npm install -D vitest @testing-library/react

# 2. ユニットテスト作成
# 3. 統合テスト作成
```

### Day 24-25: パフォーマンス最適化
```typescript
// 1. バンドルサイズ最適化
// 2. 画像最適化
// 3. キャッシュ戦略実装
```

### Day 26: セキュリティ強化
```typescript
// 1. RLSポリシー確認
// 2. 環境変数管理
// 3. セキュリティヘッダー設定
```

### Day 27: デプロイ準備
```bash
# 1. Vercelアカウント作成
# 2. プロジェクト連携
# 3. 環境変数設定
# 4. ビルド確認
npm run build
```

### Day 28: 本番デプロイ
```bash
# 1. 最終チェック
- [ ] すべての機能が動作
- [ ] モバイル対応確認
- [ ] 無料枠内での動作確認

# 2. デプロイ実行
vercel --prod

# 3. 動作確認
# 4. ドキュメント整備
```

## 🚀 各フェーズの成果物

### Phase 1 (Week 1) 完了時
- ✅ 開発環境構築完了
- ✅ プロジェクト基本構造
- ✅ Supabase接続確認
- ✅ 基本UIコンポーネント

### Phase 2 (Week 2) 完了時
- ✅ 認証システム
- ✅ 報告書提出機能
- ✅ 管理者ダッシュボード
- ✅ 基本的なCRUD操作

### Phase 3 (Week 3) 完了時
- ✅ PWA対応
- ✅ オフライン機能
- ✅ リアルタイム通知
- ✅ アチーブメントシステム

### Phase 4 (Week 4) 完了時
- ✅ テスト完了
- ✅ 本番環境デプロイ
- ✅ ドキュメント完成
- ✅ 月額0円での運用開始

## 💡 開発のコツ

### 1. 段階的に進める
- 一度に全機能を作らない
- MVPから始めて徐々に機能追加

### 2. こまめにコミット
```bash
git add .
git commit -m "feat: 機能の説明"
```

### 3. 動作確認を頻繁に
- 各機能実装後に必ずテスト
- ブラウザの開発者ツールを活用

### 4. ドキュメントを書く
- 実装した機能の使い方
- 今後の課題や改善点

## 🎯 成功の鍵

1. **心理的安全性を忘れない**
   - 常に優しい表現を心がける
   - エラーも前向きに表示

2. **コストを意識する**
   - 無料枠の制限を常に確認
   - 効率的なデータ管理

3. **ユーザー目線で考える**
   - スタッフが使いやすいか？
   - 管理者が見やすいか？

4. **継続的な改善**
   - フィードバックを集める
   - 定期的にアップデート

---

このロードマップに従って進めれば、4週間でRepoTomoの基本システムが完成します。各ステップは調整可能ですが、順序を守ることで効率的に開発できます。 