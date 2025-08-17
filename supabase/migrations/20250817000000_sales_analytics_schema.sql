-- 売上分析機能のためのスキーマ拡張
-- 作成日: 2025-08-17

-- 既存のstaffテーブルにstore_id列を追加
ALTER TABLE staff ADD COLUMN store_id UUID;

-- 店舗情報テーブル
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  manager_id UUID REFERENCES staff(id),
  region TEXT,
  store_type TEXT DEFAULT 'restaurant',
  timezone TEXT DEFAULT 'Asia/Tokyo',
  business_hours JSONB DEFAULT '{"mon": {"open": "09:00", "close": "22:00"}, "tue": {"open": "09:00", "close": "22:00"}, "wed": {"open": "09:00", "close": "22:00"}, "thu": {"open": "09:00", "close": "22:00"}, "fri": {"open": "09:00", "close": "22:00"}, "sat": {"open": "09:00", "close": "22:00"}, "sun": {"open": "09:00", "close": "22:00"}}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 売上データテーブル
CREATE TABLE sales_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour_slot INTEGER CHECK (hour_slot >= 0 AND hour_slot < 24),
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN transaction_count > 0 THEN revenue / transaction_count 
      ELSE 0 
    END
  ) STORED,
  payment_methods JSONB DEFAULT '{}',
  category_breakdown JSONB DEFAULT '{}',
  weather_condition TEXT,
  special_events JSONB DEFAULT '[]',
  recorded_by UUID REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, date, hour_slot)
);

-- AI分析結果テーブル
CREATE TABLE ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('daily', 'weekly', 'monthly', 'forecast', 'anomaly', 'correlation')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  input_data JSONB NOT NULL,
  bedrock_model TEXT DEFAULT 'claude-3-haiku',
  analysis_prompt TEXT,
  raw_response TEXT,
  structured_insights JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  triggered_by TEXT DEFAULT 'scheduled' CHECK (triggered_by IN ('scheduled', 'manual', 'alert', 'report')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 売上アラートテーブル
CREATE TABLE sales_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('revenue_drop', 'unusual_pattern', 'forecast_warning', 'target_miss', 'peak_opportunity')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  percentage_change DECIMAL(5,2),
  period_compared TEXT,
  ai_context JSONB DEFAULT '{}',
  action_required BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES staff(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 予算・目標テーブル
CREATE TABLE sales_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue_target DECIMAL(12,2) NOT NULL,
  transaction_target INTEGER,
  customer_target INTEGER,
  notes TEXT,
  set_by UUID REFERENCES staff(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, target_type, period_start)
);

-- レポート・売上の相関分析テーブル
CREATE TABLE report_sales_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  report_metrics JSONB DEFAULT '{}', -- 提出率、質問数、気分データなど
  sales_metrics JSONB DEFAULT '{}',  -- 売上、客数、客単価など
  correlation_coefficients JSONB DEFAULT '{}',
  insights JSONB DEFAULT '[]',
  ai_analysis_id UUID REFERENCES ai_analysis_results(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_stores_store_code ON stores(store_code);
CREATE INDEX idx_stores_manager_id ON stores(manager_id);
CREATE INDEX idx_sales_data_store_date ON sales_data(store_id, date);
CREATE INDEX idx_sales_data_date_revenue ON sales_data(date, revenue);
CREATE INDEX idx_sales_data_hour_slot ON sales_data(store_id, date, hour_slot);
CREATE INDEX idx_ai_analysis_store_type ON ai_analysis_results(store_id, analysis_type);
CREATE INDEX idx_ai_analysis_period ON ai_analysis_results(period_start, period_end);
CREATE INDEX idx_ai_analysis_created ON ai_analysis_results(created_at);
CREATE INDEX idx_sales_alerts_severity ON sales_alerts(store_id, severity, created_at);
CREATE INDEX idx_sales_alerts_unresolved ON sales_alerts(store_id, acknowledged_at, resolved_at);
CREATE INDEX idx_sales_targets_store_period ON sales_targets(store_id, target_type, period_start);

-- 既存テーブルへの外部キー制約追加
ALTER TABLE staff ADD CONSTRAINT fk_staff_store_id FOREIGN KEY (store_id) REFERENCES stores(id);

-- 更新時刻の自動更新トリガー追加
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sales_data_updated_at BEFORE UPDATE ON sales_data
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) 有効化
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sales_correlations ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー設定
-- 店舗情報: 管理者と該当店舗のスタッフのみアクセス可能
CREATE POLICY "Store access for managers and staff" ON stores FOR ALL USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff_id = auth.uid()::text 
    AND (role IN ('ADMIN', 'MANAGER') OR store_id = stores.id)
  )
);

-- 売上データ: 管理者と該当店舗のスタッフのみアクセス可能
CREATE POLICY "Sales data access for authorized users" ON sales_data FOR ALL USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff_id = auth.uid()::text 
    AND (role IN ('ADMIN', 'MANAGER') OR store_id = sales_data.store_id)
  )
);

-- AI分析結果: 管理者と該当店舗のマネージャーのみアクセス可能
CREATE POLICY "AI analysis access for managers" ON ai_analysis_results FOR ALL USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff_id = auth.uid()::text 
    AND role IN ('ADMIN', 'MANAGER')
    AND (role = 'ADMIN' OR store_id = ai_analysis_results.store_id)
  )
);

-- 売上アラート: 管理者と該当店舗のスタッフが閲覧可能
CREATE POLICY "Sales alerts access for store staff" ON sales_alerts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff_id = auth.uid()::text 
    AND (role IN ('ADMIN', 'MANAGER') OR store_id = sales_alerts.store_id)
  )
);

-- 売上目標: 管理者とマネージャーのみ設定・編集可能
CREATE POLICY "Sales targets for managers" ON sales_targets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff_id = auth.uid()::text 
    AND role IN ('ADMIN', 'MANAGER')
    AND (role = 'ADMIN' OR store_id = sales_targets.store_id)
  )
);

-- サンプルデータ投入
-- サンプル店舗データ
INSERT INTO stores (store_code, name, address, region, store_type) VALUES
('ST001', '新宿本店', '東京都新宿区1-1-1', '関東', 'restaurant'),
('ST002', '渋谷店', '東京都渋谷区2-2-2', '関東', 'restaurant'),
('ST003', '大阪梅田店', '大阪府大阪市北区3-3-3', '関西', 'restaurant');

-- 既存スタッフにstore_idを設定
UPDATE staff SET store_id = (SELECT id FROM stores WHERE store_code = 'ST001') WHERE staff_id IN ('1', '2');
UPDATE staff SET store_id = (SELECT id FROM stores WHERE store_code = 'ST002') WHERE staff_id = '3';
UPDATE staff SET store_id = (SELECT id FROM stores WHERE store_code = 'ST001') WHERE staff_id = '4';

-- 店舗のマネージャー設定
UPDATE stores SET manager_id = (SELECT id FROM staff WHERE staff_id = '4') WHERE store_code = 'ST001';
UPDATE stores SET manager_id = (SELECT id FROM staff WHERE staff_id = '2') WHERE store_code = 'ST002';

-- サンプル売上データ（過去7日分）
DO $$
DECLARE
    store_record RECORD;
    date_val DATE;
    hour_val INTEGER;
    base_revenue DECIMAL;
BEGIN
    FOR store_record IN SELECT id, store_code FROM stores LOOP
        FOR date_val IN SELECT generate_series(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '1 day', INTERVAL '1 day')::date LOOP
            -- 営業時間内の売上データを生成（10時〜21時）
            FOR hour_val IN 10..21 LOOP
                -- 店舗別・時間帯別の基本売上を設定
                base_revenue := CASE 
                    WHEN store_record.store_code = 'ST001' THEN 80000 -- 新宿本店
                    WHEN store_record.store_code = 'ST002' THEN 65000 -- 渋谷店
                    ELSE 45000 -- 大阪梅田店
                END;
                
                -- 時間帯による変動
                base_revenue := base_revenue * CASE
                    WHEN hour_val BETWEEN 11 AND 13 THEN 1.5  -- ランチタイム
                    WHEN hour_val BETWEEN 18 AND 20 THEN 1.8  -- ディナータイム
                    WHEN hour_val BETWEEN 10 AND 11 THEN 0.3  -- 開店直後
                    WHEN hour_val BETWEEN 21 AND 21 THEN 0.7  -- 営業終了前
                    ELSE 1.0
                END / 12; -- 1時間分に調整
                
                -- ランダムな変動を追加（±20%）
                base_revenue := base_revenue * (0.8 + random() * 0.4);
                
                INSERT INTO sales_data (
                    store_id, 
                    date, 
                    hour_slot, 
                    revenue, 
                    transaction_count, 
                    customer_count,
                    payment_methods,
                    category_breakdown
                ) VALUES (
                    store_record.id,
                    date_val,
                    hour_val,
                    ROUND(base_revenue, 0),
                    ROUND(base_revenue / 2500 + random() * 5), -- 客単価約2500円
                    ROUND(base_revenue / 2800 + random() * 3), -- 1組平均1.1人
                    '{"cash": 0.3, "card": 0.5, "mobile": 0.2}',
                    '{"food": 0.7, "drink": 0.2, "dessert": 0.1}'
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- サンプル売上目標
INSERT INTO sales_targets (store_id, target_type, period_start, period_end, revenue_target, transaction_target, set_by) VALUES
((SELECT id FROM stores WHERE store_code = 'ST001'), 'monthly', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 2500000, 1000, (SELECT id FROM staff WHERE staff_id = '2')),
((SELECT id FROM stores WHERE store_code = 'ST002'), 'monthly', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 2000000, 800, (SELECT id FROM staff WHERE staff_id = '2')),
((SELECT id FROM stores WHERE store_code = 'ST003'), 'monthly', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 1500000, 600, (SELECT id FROM staff WHERE staff_id = '2'));

COMMENT ON TABLE stores IS '店舗情報テーブル - 各店舗の基本情報と設定';
COMMENT ON TABLE sales_data IS '売上データテーブル - 時間別売上実績';
COMMENT ON TABLE ai_analysis_results IS 'AI分析結果テーブル - Amazon Bedrock分析結果';
COMMENT ON TABLE sales_alerts IS '売上アラートテーブル - AI検知アラート';
COMMENT ON TABLE sales_targets IS '売上目標テーブル - 期間別売上目標';
COMMENT ON TABLE report_sales_correlations IS 'レポート売上相関テーブル - 報告書と売上の関係性';