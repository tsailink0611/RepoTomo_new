-- 最小限のストレージポリシー設定

-- report-files バケットを作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-files', 'report-files', true)
ON CONFLICT (id) DO NOTHING;

-- 誰でもアップロード可能
CREATE POLICY "Allow all uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report-files');

-- 誰でも閲覧可能  
CREATE POLICY "Allow all access" ON storage.objects
FOR SELECT USING (bucket_id = 'report-files');