-- 新規作成された報告書テンプレートを確認
SELECT 
    id,
    name,
    description,
    emoji,
    frequency,
    deadline,
    category,
    is_active,
    created_at
FROM report_templates 
ORDER BY created_at DESC
LIMIT 10;