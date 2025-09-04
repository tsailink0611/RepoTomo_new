-- LINE連携のためのスタッフデータ修正スクリプト
-- このスクリプトをSupabase SQL Editorで実行してください

-- 1. まず既存のスタッフテーブルの構造を確認
-- (実行前にテーブルの内容を確認)

-- 2. 既存スタッフにLINE User IDを設定（テスト用）
UPDATE staff 
SET line_user_id = 'U' || substr(md5(random()::text), 1, 32)
WHERE id IN (
    SELECT id FROM staff 
    WHERE line_user_id IS NULL 
    LIMIT 1
);

-- 3. テスト用スタッフがいない場合は作成
INSERT INTO staff (staff_id, name, email, role, is_active, line_user_id)
SELECT '999', 'テストユーザー', 'test@example.com', 'STAFF', true, 'U' || substr(md5(random()::text), 1, 32)
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = '999');

-- 4. 現在のスタッフ状況を確認
SELECT 
    id,
    staff_id,
    name,
    email,
    role,
    is_active,
    line_user_id,
    CASE 
        WHEN line_user_id IS NOT NULL THEN 'LINE連携済み'
        ELSE 'LINE未連携'
    END as line_status
FROM staff
ORDER BY created_at DESC;

-- 5. LINE連携統計を確認
SELECT 
    COUNT(*) as total_staff,
    COUNT(line_user_id) as line_connected_staff,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_staff,
    COUNT(CASE WHEN is_active = true AND line_user_id IS NOT NULL THEN 1 END) as active_line_connected
FROM staff;