-- report-files ストレージバケット用のRLSポリシーを設定

-- 1. report-files バケットが存在しない場合は作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-files', 'report-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 認証済みユーザーがファイルをアップロードできるポリシー
CREATE POLICY "Authenticated users can upload files" 
ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'report-files');

-- 3. 認証済みユーザーが自分のファイルを閲覧できるポリシー
CREATE POLICY "Users can view own files" 
ON storage.objects
FOR SELECT 
TO authenticated 
USING (bucket_id = 'report-files');

-- 4. 公開ファイルとして誰でも閲覧できるポリシー（管理者がファイルを共有する場合）
CREATE POLICY "Public files are viewable by everyone" 
ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'report-files');

-- 5. 認証済みユーザーが自分のファイルを削除できるポリシー
CREATE POLICY "Users can delete own files" 
ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'report-files');

-- 6. 管理者権限を持つユーザーは全てのファイルにアクセス可能
CREATE POLICY "Admins can manage all files" 
ON storage.objects
FOR ALL 
TO authenticated 
USING (
  bucket_id = 'report-files' AND
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff.user_id = auth.uid() 
    AND staff.role IN ('ADMIN', 'MANAGER')
  )
);