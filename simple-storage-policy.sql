-- シンプルなストレージポリシー（テスト用）

-- report-files バケットを作成（既存の場合はスキップ）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-files', 
  'report-files', 
  true, 
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- 一時的に誰でもアップロード可能にする（テスト用）
CREATE POLICY "Allow uploads for testing" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'report-files');

-- 一時的に誰でも閲覧可能にする（テスト用）  
CREATE POLICY "Allow public access for testing" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'report-files');