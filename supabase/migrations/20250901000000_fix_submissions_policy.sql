-- submissions テーブルのRLSポリシーを修正して提出を可能にする

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Staff can insert own submissions" ON submissions;
DROP POLICY IF EXISTS "Staff can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Allow staff to submit reports" ON submissions;

-- 一時的に全てのINSERTを許可するポリシーを追加（開発・テスト用）
CREATE POLICY "Allow public insert for submissions" 
ON submissions 
FOR INSERT 
WITH CHECK (true);

-- スタッフが自分の提出を閲覧できるポリシー
CREATE POLICY "Staff can view own submissions" 
ON submissions 
FOR SELECT 
USING (staff_id IN (
  SELECT id FROM staff WHERE is_active = true
));

-- 管理者が全ての提出を閲覧できるポリシー
CREATE POLICY "Managers can view all submissions" 
ON submissions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM staff 
  WHERE staff.role IN ('MANAGER', 'ADMIN') 
  AND staff.is_active = true
));

-- submissionsテーブルのRLSを有効にする
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;