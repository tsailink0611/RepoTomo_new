import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://imtfvkvbfdizowwpdipt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdGZ2a3ZiZmRpem93d3BkaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjc2MDgsImV4cCI6MjA3MDUwMzYwOH0.vuDLdGEVDLK3BrdcUNAbSgDcttGubyo0pTuT63-rxpE'

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleReportTemplates = [
  {
    name: '日報',
    description: '今日の作業内容や感想を教えてください',
    emoji: '📝',
    frequency: 'daily',
    deadline: '翌日10:00まで',
    category: 'regular',
    is_active: true
  },
  {
    name: '週報',
    description: '今週の振り返りと来週の目標',
    emoji: '📊',
    frequency: 'weekly',
    deadline: '月曜日17:00まで',
    category: 'regular',
    is_active: true
  },
  {
    name: '体調チェック',
    description: '体調や気分について',
    emoji: '💪',
    frequency: 'daily',
    deadline: '当日23:59まで',
    category: 'regular',
    is_active: true
  },
  {
    name: '研修レポート',
    description: '研修での学びを共有してください',
    emoji: '🎓',
    frequency: 'custom',
    deadline: '研修後3日以内',
    category: 'training',
    is_active: true
  },
  {
    name: '店舗清掃チェック',
    description: '清掃状況の確認結果',
    emoji: '🧹',
    frequency: 'daily',
    deadline: '営業終了後1時間以内',
    category: 'maintenance',
    is_active: true
  },
  {
    name: 'お客様対応報告',
    description: '特別な対応が必要だったケース',
    emoji: '👥',
    frequency: 'custom',
    deadline: '対応後24時間以内',
    category: 'special',
    is_active: true
  }
]

async function populateReportTemplates() {
  console.log('📝 報告書テンプレートを追加中...')
  
  try {
    // まず既存のデータをチェック
    const { data: existing } = await supabase
      .from('report_templates')
      .select('name')
    
    console.log(`既存のテンプレート数: ${existing?.length || 0}`)
    
    for (const template of sampleReportTemplates) {
      // 既に存在するかチェック
      const exists = existing?.some(t => t.name === template.name)
      
      if (!exists) {
        const { data, error } = await supabase
          .from('report_templates')
          .insert(template)
          .select()
        
        if (error) {
          console.error(`❌ テンプレート「${template.name}」の追加に失敗:`, error)
        } else {
          console.log(`✅ テンプレート「${template.name}」を追加しました`)
        }
      } else {
        console.log(`⏭️ テンプレート「${template.name}」は既に存在します`)
      }
    }
    
    console.log('🎉 報告書テンプレートの追加が完了しました！')
    
    // 結果を確認
    const { data: finalData } = await supabase
      .from('report_templates')
      .select('name, emoji, is_active')
      .eq('is_active', true)
    
    console.log('\n📋 現在のアクティブなテンプレート:')
    finalData?.forEach(template => {
      console.log(`  ${template.emoji} ${template.name}`)
    })
    
  } catch (error) {
    console.error('❌ データ追加中にエラーが発生しました:', error)
  }
}

// スタッフサンプルデータを追加
async function populateStaffData() {
  console.log('👥 スタッフデータを追加中...')
  
  const sampleStaff = [
    {
      staff_id: 'staff001',
      name: '田中 太郎',
      email: 'tanaka@example.com',
      role: 'STAFF',
      is_active: true
    },
    {
      staff_id: 'admin001', 
      name: '管理者 花子',
      email: 'admin@example.com',
      role: 'MANAGER',
      is_active: true
    }
  ]

  try {
    for (const staff of sampleStaff) {
      const { data: existing } = await supabase
        .from('staff')
        .select('staff_id')
        .eq('staff_id', staff.staff_id)
        .single()

      if (!existing) {
        const { data, error } = await supabase
          .from('staff')
          .insert(staff)
          .select()

        if (error) {
          console.error(`❌ スタッフ「${staff.name}」の追加に失敗:`, error)
        } else {
          console.log(`✅ スタッフ「${staff.name}」を追加しました`)
        }
      } else {
        console.log(`⏭️ スタッフ「${staff.name}」は既に存在します`)
      }
    }
  } catch (error) {
    console.error('❌ スタッフデータ追加エラー:', error)
  }
}

// 実行
Promise.all([
  populateReportTemplates(),
  populateStaffData()
])