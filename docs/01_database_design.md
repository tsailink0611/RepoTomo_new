# RepoTomo データベース設計書

## 概要
RepoTomoシステムのPostgreSQLデータベース設計書です。Supabaseを利用し、心理的安全性を重視した報告書管理システムのデータ構造を定義します。

## データベース構成図

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   staff     │────<│   submissions    │>────│report_templates│
│ (スタッフ)   │     │   (提出履歴)      │     │(報告書テンプレート)│
└─────────────┘     └──────────────────┘     └─────────────┘
       │                     │                        │
       │                     │                        │
       ▼                     ▼                        ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│achievements │     │  consultations   │     │  questions  │
│(アチーブメント)│     │  (相談・質問)     │     │  (質問項目)  │
└─────────────┘     └──────────────────┘     └─────────────┘
```

## テーブル定義

### 1. staff（スタッフ）
スタッフの基本情報を管理するテーブル

```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  line_user_id TEXT UNIQUE,
  role TEXT DEFAULT 'STAFF' CHECK (role IN ('STAFF', 'MANAGER', 'ADMIN')),
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  preferred_reminder_time TIME DEFAULT '18:00',
  notification_settings JSONB DEFAULT '{"line": true, "push": true, "email": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_staff_line_user_id ON staff(line_user_id);
CREATE INDEX idx_staff_is_active ON staff(is_active);
```

### 2. report_templates（報告書テンプレート）
報告書の種類とその設定を管理

```sql
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
  due_time TIME DEFAULT '18:00',
  reminder_message TEXT DEFAULT 'お疲れさまです！報告書の提出をお願いします😊',
  is_active BOOLEAN DEFAULT true,
  emoji TEXT DEFAULT '📝',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. questions（質問項目）
報告書テンプレートに含まれる質問項目

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT CHECK (type IN ('TEXT', 'TEXTAREA', 'CHOICE', 'MULTIPLE', 'SCALE_1_TO_5', 'YES_NO')),
  options TEXT[], -- 選択肢（JSON配列）
  is_required BOOLEAN DEFAULT false,
  "order" INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_questions_template_id ON questions(template_id);
```

### 4. submissions（提出履歴）
報告書の提出記録

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES report_templates(id),
  staff_id UUID REFERENCES staff(id),
  answers JSONB,
  mood TEXT CHECK (mood IN ('happy', 'neutral', 'need_help')),
  has_question BOOLEAN DEFAULT false,
  question TEXT,
  is_answered BOOLEAN DEFAULT false,
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_submissions_staff_id ON submissions(staff_id);
CREATE INDEX idx_submissions_report_id ON submissions(report_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX idx_submissions_mood ON submissions(mood) WHERE mood = 'need_help';
```

### 5. consultations（相談・質問）
スタッフからの相談や質問を管理

```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_priority ON consultations(priority);
```

### 6. achievements（アチーブメント）
スタッフの達成記録とバッジ

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- インデックス
CREATE INDEX idx_achievements_staff_id ON achievements(staff_id);
CREATE INDEX idx_achievements_type ON achievements(type);
```

## Row Level Security (RLS) ポリシー

```sql
-- すべてのテーブルでRLSを有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- staffテーブルのポリシー
CREATE POLICY "スタッフは自分のデータを参照可能" ON staff
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "管理者は全スタッフデータを参照可能" ON staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- submissionsテーブルのポリシー
CREATE POLICY "スタッフは自分の提出履歴を参照・作成可能" ON submissions
  FOR ALL USING (auth.uid()::text = staff_id::text);

CREATE POLICY "管理者は全提出履歴を参照可能" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );
```

## 初期データ

```sql
-- 報告書テンプレートのサンプル
INSERT INTO report_templates (title, description, frequency, emoji) VALUES
  ('日報', '今日も一日お疲れさまでした！', 'DAILY', '☀️'),
  ('週報', '今週の振り返りをお願いします', 'WEEKLY', '📅'),
  ('月報', '今月の成果をまとめましょう', 'MONTHLY', '📊');

-- 質問項目のサンプル
INSERT INTO questions (template_id, text, type, is_required, "order") VALUES
  ((SELECT id FROM report_templates WHERE title = '日報'), '今日の業務内容を教えてください', 'TEXTAREA', true, 1),
  ((SELECT id FROM report_templates WHERE title = '日報'), '今日の調子はどうでしたか？', 'SCALE_1_TO_5', false, 2),
  ((SELECT id FROM report_templates WHERE title = '日報'), '困ったことはありましたか？', 'YES_NO', false, 3);
```

## データベース管理

### バックアップ設定
```sql
-- 自動バックアップ（Supabase管理）
-- 手動バックアップコマンド
pg_dump -h db.xxxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

### パフォーマンス最適化
```sql
-- 定期的なVACUUM
VACUUM ANALYZE;

-- インデックスの再構築
REINDEX DATABASE postgres;
```

### 容量管理（3ヶ月以上前のデータ削除）
```sql
-- 古い提出履歴の削除
DELETE FROM submissions 
WHERE submitted_at < NOW() - INTERVAL '3 months'
AND mood != 'need_help';

-- 古いログの削除
DELETE FROM consultations 
WHERE created_at < NOW() - INTERVAL '6 months'
AND status = 'RESOLVED';
```

## 注意事項

1. **無料枠の制限**
   - データベースサイズ: 500MB以内
   - 接続数: 60接続まで
   - 定期的な容量確認が必要

2. **セキュリティ**
   - RLSポリシーは必須
   - 個人情報は最小限に
   - LINE UserIDは暗号化推奨

3. **パフォーマンス**
   - インデックスの適切な設定
   - 大量データ時のページネーション
   - 不要なJSONBデータの削除 