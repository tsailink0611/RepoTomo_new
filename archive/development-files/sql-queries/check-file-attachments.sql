-- ファイル添付データを確認
SELECT 
    s.id,
    st.name as スタッフ名,
    rt.name as 報告書名,
    s.status as 状態,
    s.document_url as ファイルURL,
    s.message as メッセージ,
    s.submitted_at as 提出時刻
FROM submissions s
LEFT JOIN staff st ON s.staff_id = st.id
LEFT JOIN report_templates rt ON s.report_id = rt.id
ORDER BY s.submitted_at DESC;