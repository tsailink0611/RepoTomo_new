-- LINE通知テスト用のスクリプト
-- 事前にfix-line-integration.sqlを実行してからこのスクリプトを実行してください

-- 1. 通知テーブルの確認（存在しない場合は作成）
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES staff(id),
    type TEXT NOT NULL CHECK (type IN ('reminder', 'response', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT DEFAULT 'line',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. テスト通知データを挿入
INSERT INTO notifications (staff_id, type, title, message, channel)
SELECT 
    id as staff_id,
    'system' as type,
    'テスト通知' as title,
    'LINE連携のテスト通知です。正常に動作しています。' as message,
    'line' as channel
FROM staff 
WHERE line_user_id IS NOT NULL
LIMIT 1;

-- 3. 通知履歴の確認
SELECT 
    n.id,
    s.name as staff_name,
    n.type,
    n.title,
    n.message,
    n.sent_at,
    n.is_read
FROM notifications n
JOIN staff s ON n.staff_id = s.id
ORDER BY n.sent_at DESC
LIMIT 10;

-- 4. LINE連携統計の最新状況
SELECT 
    'スタッフ統計' as category,
    COUNT(*) as total_staff,
    COUNT(CASE WHEN line_user_id IS NOT NULL THEN 1 END) as line_connected,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_staff,
    COUNT(CASE WHEN is_active = true AND line_user_id IS NOT NULL THEN 1 END) as active_line_connected
FROM staff

UNION ALL

SELECT 
    '通知統計' as category,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN channel = 'line' THEN 1 END) as line_notifications,
    COUNT(CASE WHEN sent_at::date = CURRENT_DATE THEN 1 END) as today_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications
FROM notifications;