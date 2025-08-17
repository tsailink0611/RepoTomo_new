-- LINE Bot自動リマインダー用Cronジョブ設定
-- pg_cron拡張を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 毎日18:00にリマインダー送信（日報）
SELECT cron.schedule(
  'daily-reminder',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qelqnvdvfgcknsufgdil.supabase.co/functions/v1/send-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'reportType', 'daily'
    )
  );
  $$
);

-- 毎週金曜17:00にリマインダー送信（週報）
SELECT cron.schedule(
  'weekly-reminder',
  '0 17 * * 5',
  $$
  SELECT net.http_post(
    url := 'https://qelqnvdvfgcknsufgdil.supabase.co/functions/v1/send-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'reportType', 'weekly'
    )
  );
  $$
);

-- 毎月末日17:00にリマインダー送信（月報）
SELECT cron.schedule(
  'monthly-reminder',
  '0 17 28-31 * *',
  $$
  SELECT CASE 
    WHEN EXTRACT(day FROM (CURRENT_DATE + INTERVAL '1 day')) = 1 
    THEN net.http_post(
      url := 'https://qelqnvdvfgcknsufgdil.supabase.co/functions/v1/send-reminder',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'reportType', 'monthly'
      )
    )
    ELSE NULL
  END;
  $$
);

-- ネパール育成週報リマインダー（毎週日曜20:00）
SELECT cron.schedule(
  'nepal-training-reminder',
  '0 20 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://qelqnvdvfgcknsufgdil.supabase.co/functions/v1/send-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'reportType', 'nepal_training'
    )
  );
  $$
);

-- Cronジョブの状態確認用ビュー
CREATE OR REPLACE VIEW cron_jobs_status AS
SELECT 
  jobname,
  schedule,
  active,
  command,
  last_run_started_at,
  last_run_finished_at,
  run_count,
  max_run_duration
FROM cron.job_run_details 
ORDER BY jobname;

-- 権限設定（必要に応じて）
GRANT SELECT ON cron_jobs_status TO authenticated;