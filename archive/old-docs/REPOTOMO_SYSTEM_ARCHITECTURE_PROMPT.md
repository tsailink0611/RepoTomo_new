# RepoTomo システムアーキテクチャ分析プロンプト

## システム概要
RepoTomoは心理的安全性を重視した業務管理システムのテンプレートとして、以下の特徴を持つアーキテクチャを実装しています。このシステムは報告書管理から始まり、売上分析、特許管理、機密データ取扱いなど、様々な企業内システムへ横展開可能な設計となっています。

## 技術スタック

### フロントエンド
- **React 19 + TypeScript**: 型安全性とモダンなUI構築
- **Vite**: 高速な開発環境とビルド
- **Tailwind CSS**: ユーティリティファーストのスタイリング
- **PWA対応**: オフライン機能、プッシュ通知、アプリライク体験
- **Zustand**: 軽量な状態管理
- **React Query (TanStack Query)**: サーバー状態の効率的管理

### バックエンド
- **Supabase**: オールインワンBaaS
  - PostgreSQL: リレーショナルデータベース
  - Row Level Security (RLS): 行レベルのセキュリティ
  - Auth: 認証・認可管理
  - Realtime: WebSocketによるリアルタイム通信
  - Edge Functions: サーバーレス関数
  - Storage: ファイルストレージ

### インフラ・デプロイ
- **Vercel**: フロントエンドホスティング（自動デプロイ、エッジ配信）
- **Cloudflare**: CDN、DDoS保護
- **GitHub Actions**: CI/CD自動化

### 外部連携
- **LINE Messaging API**: 通知・リマインダー
- **Google Drive API / Talknote API**: 既存システムとの連携

## コアコンセプトと設計思想

### 1. 心理的安全性ファースト
```
設計ポイント:
- UI/UXの言葉遣い: 威圧的な表現を避け、優しく促す表現を採用
- 段階的通知: プレッシャーレベルを段階的に調整
- 3ボタン式簡易操作: 選択の負担を最小化
- 励ましとゲーミフィケーション: アチーブメント、バッジによる動機付け
```

### 2. 超低コスト運用（月額0円〜数百円）
```
コスト最適化戦略:
- Supabase Free Tier: 500MB DB、50,000 MAU、2GB帯域
- Vercel Hobby Plan: 100GB帯域、自動デプロイ
- Edge Functions: サーバーレスによる従量課金
- キャッシュ戦略: CDN活用、React Query キャッシュ
```

### 3. 既存システムとの共存設計
```
統合アプローチ:
- 既存ツールを置き換えない: 補完的な役割
- API連携: REST/GraphQL対応
- Webhook対応: イベント駆動型連携
- 段階的移行: 部分的導入から全体展開へ
```

### 4. エンタープライズ対応セキュリティ
```
セキュリティレイヤー:
- Row Level Security (RLS): データベースレベルのアクセス制御
- JWT認証: ステートレス認証
- 環境変数管理: 機密情報の分離
- HTTPS強制: 通信の暗号化
- CORS設定: クロスオリジン制御
```

## 横展開可能なシステムパターン

### パターン1: 売上分析ダッシュボード
```typescript
応用例:
- リアルタイム売上モニタリング
- 店舗別・商品別分析
- 予測分析とアラート
- KPIトラッキング

技術的適用:
- Supabase Realtime: リアルタイムデータ更新
- React Query: 効率的なデータフェッチング
- Chart.js/Recharts: データビジュアライゼーション
- Edge Functions: 集計処理の最適化
```

### パターン2: 特許・知的財産管理システム
```typescript
応用例:
- 特許申請ワークフロー管理
- 機密文書のセキュア共有
- 承認フローの自動化
- コンプライアンス監査ログ

技術的適用:
- RLS: 機密レベル別アクセス制御
- Supabase Storage: セキュアファイル管理
- 暗号化: エンドツーエンド暗号化
- 監査ログ: 全操作の追跡記録
```

### パターン3: 社内ナレッジ共有システム
```typescript
応用例:
- FAQ自動応答
- ドキュメント検索
- ベストプラクティス共有
- スキルマップ管理

技術的適用:
- PostgreSQL全文検索: 高速検索
- Vector検索: AI埋め込みによる意味検索
- Realtime: 共同編集機能
- PWA: オフラインアクセス
```

## システム実装のキーポイント

### 1. データベース設計の汎用性
```sql
-- 汎用的なエンティティ設計
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'report', 'sales', 'patent', etc.
  status TEXT NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 柔軟な権限管理
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  resource_type TEXT,
  resource_id UUID,
  actions TEXT[], -- ['read', 'write', 'delete']
  conditions JSONB
);
```

### 2. コンポーネントの再利用性
```typescript
// 汎用的なダッシュボードコンポーネント
interface DashboardConfig {
  title: string;
  metrics: MetricConfig[];
  filters: FilterConfig[];
  actions: ActionConfig[];
}

// 設定駆動型UI
const Dashboard: React.FC<DashboardConfig> = (config) => {
  // 設定に基づいてUIを動的生成
};
```

### 3. API設計の拡張性
```typescript
// 汎用的なCRUD API
interface ResourceAPI<T> {
  list: (filters?: Filter) => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  subscribe: (callback: (data: T) => void) => Unsubscribe;
}
```

### 4. 通知システムの柔軟性
```typescript
// マルチチャネル通知
interface NotificationChannel {
  send: (message: Message) => Promise<void>;
  validateConfig: (config: any) => boolean;
}

class NotificationService {
  channels: Map<string, NotificationChannel> = new Map([
    ['line', new LineChannel()],
    ['email', new EmailChannel()],
    ['slack', new SlackChannel()],
    ['teams', new TeamsChannel()],
  ]);
}
```

## 導入・展開戦略

### フェーズ1: パイロット導入（1-2週間）
1. 最小機能セットの実装
2. 少数ユーザーでのテスト
3. フィードバック収集

### フェーズ2: 段階的展開（1-2ヶ月）
1. 機能追加とカスタマイズ
2. 部門単位での展開
3. 既存システムとの連携構築

### フェーズ3: 全社展開（3-6ヶ月）
1. スケーラビリティ対策
2. 運用自動化
3. 継続的改善プロセス確立

## 成功指標（KPI）

### システム共通KPI
- **採用率**: 対象ユーザーの80%以上が週1回以上利用
- **応答時間**: 95%のリクエストが1秒以内
- **可用性**: 99.9%以上のアップタイム
- **コスト効率**: ユーザー当たり月額100円以下

### ビジネス固有KPI
- **報告書管理**: 提出率90%以上、平均遅延24時間以内
- **売上分析**: データ反映遅延5分以内、予測精度85%以上
- **特許管理**: 申請処理時間50%削減、コンプライアンス100%

## まとめ

RepoTomoアーキテクチャは、以下の強みにより様々な企業内システムへ展開可能：

1. **技術的柔軟性**: モダンな技術スタックによる拡張性
2. **コスト効率**: 無料枠を最大活用した超低コスト運用
3. **セキュリティ**: エンタープライズレベルのセキュリティ機能
4. **ユーザビリティ**: 心理的安全性を考慮したUX設計
5. **統合性**: 既存システムとのシームレスな連携

このアーキテクチャをベースに、売上分析、特許管理、ナレッジ共有など、組織のニーズに応じたシステムを迅速に構築可能です。