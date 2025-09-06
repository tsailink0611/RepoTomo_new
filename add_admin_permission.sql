-- スタッフテーブルに管理者フラグを追加
ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 管理者権限の設定（例: スタッフID 999 を管理者に設定）
UPDATE staff SET is_admin = TRUE WHERE staff_id = '999';

-- 確認用: staffテーブルの構造確認
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'staff' 
ORDER BY ordinal_position;

-- テストデータ確認
SELECT id, staff_id, name, is_admin FROM staff;