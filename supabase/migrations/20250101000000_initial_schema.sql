-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- スタッフテーブル
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  line_user_id TEXT UNIQUE,
  role TEXT DEFAULT 'STAFF' CHECK (role IN ('STAFF', 'MANAGER', 'ADMIN')),
  is_active BOOLEAN DEFAULT true,
  preferred_reminder_time TIME DEFAULT '18:00',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 報告書テンプレートテーブル
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📝',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'biweekly', 'custom')),
  deadline TEXT,
  category TEXT DEFAULT 'regular' CHECK (category IN ('regular', 'special', 'training', 'maintenance', 'event')),
  questions JSONB,
  is_active BOOLEAN DEFAULT true,
  required_roles TEXT[],
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 質問テーブル
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'number', 'select', 'multiselect', 'date', 'time', 'boolean')),
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 提出テーブル
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  report_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'partial', 'has_question', 'extension_requested')),
  answers JSONB,
  mood TEXT CHECK (mood IN ('happy', 'neutral', 'need_help')),
  has_question BOOLEAN DEFAULT false,
  question TEXT,
  message TEXT,
  document_url TEXT,
  attachments JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  admin_response TEXT,
  admin_responded_at TIMESTAMP WITH TIME ZONE,
  admin_responded_by UUID REFERENCES staff(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 相談テーブル
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES staff(id),
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 実績テーブル
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 通知テーブル
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'reminder' CHECK (type IN ('reminder', 'question_response', 'system', 'achievement', 'deadline')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('line', 'email', 'push', 'in_app')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_staff_staff_id ON staff(staff_id);
CREATE INDEX idx_staff_line_user_id ON staff(line_user_id);
CREATE INDEX idx_submissions_staff_id ON submissions(staff_id);
CREATE INDEX idx_submissions_report_id ON submissions(report_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_notifications_staff_id ON notifications(staff_id);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- 更新時刻の自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻の自動更新トリガー
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- サンプルデータの挿入
INSERT INTO staff (staff_id, name, email, role) VALUES
('1', '田中太郎', 'tanaka@example.com', 'STAFF'),
('2', '管理者', 'admin@example.com', 'ADMIN'),
('3', '佐藤花子', 'sato@example.com', 'STAFF'),
('4', 'マネージャー', 'manager@example.com', 'MANAGER');

-- サンプル報告書テンプレート
INSERT INTO report_templates (name, description, emoji, frequency, deadline, category) VALUES
('日報', '1日の業務内容を報告してください', '📝', 'daily', '毎日 18:00まで', 'regular'),
('週報', '1週間の成果と課題をまとめてください', '📊', 'weekly', '毎週金曜 17:00まで', 'regular'),
('月報', '月次の実績と来月の目標を設定してください', '📈', 'monthly', '毎月末日 17:00まで', 'regular'),
('品質管理報告', '品質管理の状況を報告してください', '🔧', 'daily', '毎日 16:00まで', 'maintenance'),
('安全点検報告', '安全点検の結果を報告してください', '🛡️', 'weekly', '毎週月曜 10:00まで', 'maintenance');

-- Row Level Security (RLS) を有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー
-- スタッフは自分の情報のみ閲覧・更新可能
CREATE POLICY "Staff can view own data" ON staff FOR SELECT USING (auth.uid()::text = staff_id OR EXISTS (
  SELECT 1 FROM staff WHERE staff_id = auth.uid()::text AND role IN ('ADMIN', 'MANAGER')
));

CREATE POLICY "Staff can update own data" ON staff FOR UPDATE USING (auth.uid()::text = staff_id);

-- 提出は作成者本人と管理者が閲覧可能
CREATE POLICY "Staff can view own submissions" ON submissions FOR SELECT USING (
  staff_id = (SELECT id FROM staff WHERE staff_id = auth.uid()::text) OR
  EXISTS (SELECT 1 FROM staff WHERE staff_id = auth.uid()::text AND role IN ('ADMIN', 'MANAGER'))
);

CREATE POLICY "Staff can create submissions" ON submissions FOR INSERT WITH CHECK (
  staff_id = (SELECT id FROM staff WHERE staff_id = auth.uid()::text)
);

CREATE POLICY "Staff can update own submissions" ON submissions FOR UPDATE USING (
  staff_id = (SELECT id FROM staff WHERE staff_id = auth.uid()::text) OR
  EXISTS (SELECT 1 FROM staff WHERE staff_id = auth.uid()::text AND role IN ('ADMIN', 'MANAGER'))
);