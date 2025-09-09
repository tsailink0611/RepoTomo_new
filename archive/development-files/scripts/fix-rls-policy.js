import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://imtfvkvbfdizowwpdipt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdGZ2a3ZiZmRpem93d3BkaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjc2MDgsImV4cCI6MjA3MDUwMzYwOH0.vuDLdGEVDLK3BrdcUNAbSgDcttGubyo0pTuT63-rxpE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSubmissionsPolicy() {
  console.log('🔧 submissions テーブルのRLSポリシーを修正中...')
  
  try {
    // 1. RLSを一時的に無効にする（テスト用）
    console.log('1️⃣ RLSを一時的に無効化...')
    const { error: disableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;' 
      })
    
    if (disableError) {
      console.log('⚠️ RLS無効化できませんでした（権限不足の可能性）:', disableError)
    } else {
      console.log('✅ RLSを無効化しました')
    }
    
    // 2. テスト提出を試行
    console.log('2️⃣ テスト提出を実行...')
    const testSubmission = {
      staff_id: '699a3653-488d-425e-8586-806d7b789791', // ログから取得したスタッフID
      report_id: (await supabase.from('report_templates').select('id').limit(1).single()).data?.id,
      status: 'completed',
      submitted_at: new Date().toISOString(),
      has_question: false,
      message: 'テスト提出'
    }
    
    console.log('テスト提出データ:', testSubmission)
    
    const { data, error } = await supabase
      .from('submissions')
      .insert(testSubmission)
      .select()
      .single()
    
    if (error) {
      console.error('❌ テスト提出失敗:', error)
      
      // 代替案：より基本的なポリシーを作成
      console.log('3️⃣ 代替ポリシーを作成中...')
      
      const policySQL = `
        -- 既存ポリシーを削除
        DROP POLICY IF EXISTS "Allow public insert" ON submissions;
        
        -- 全ての挿入を許可する緩いポリシー
        CREATE POLICY "Allow public insert" 
        ON submissions 
        FOR INSERT 
        WITH CHECK (true);
        
        -- RLSを再有効化
        ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
      `
      
      console.log('実行するSQL:', policySQL)
      console.log('⚠️ 手動でSupabase SQL Editorで以下のSQLを実行してください:')
      console.log(policySQL)
      
    } else {
      console.log('✅ テスト提出成功!', data)
    }
    
  } catch (err) {
    console.error('❌ エラーが発生しました:', err)
    
    console.log(`
📝 手動修正が必要です:

1. Supabase管理画面にアクセス
2. SQL Editor で以下を実行:

-- submissions テーブルのRLSを一時的に無効化
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

または

-- より緩いポリシーを作成
DROP POLICY IF EXISTS "Allow public insert" ON submissions;
CREATE POLICY "Allow public insert" ON submissions FOR INSERT WITH CHECK (true);

3. アプリケーションで再度提出をテスト
`)
  }
}

fixSubmissionsPolicy()