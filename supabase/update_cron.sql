-- Reschedule Newsletter to 12:45 PM IST (07:15 UTC) every Friday

-- 1. Go to Supabase Dashboard > SQL Editor.
-- 2. Paste this Code (Key is already inserted).
-- 3. Click Run.

select cron.schedule(
  'weekly-newsletter',
  '15 7 * * 5', -- Friday at 7:15 AM UTC (equivalent to 12:45 PM IST)
  $$
  select
    net.http_post(
      url:='https://lgthbjsuqzmntknzrvgu.supabase.co/functions/v1/send-newsletter',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndGhianN1cXptbnRrbnpydmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3ODI5MSwiZXhwIjoyMDgwODU0MjkxfQ.-XuDygzsb3_GTwgmZn6nx7lG7-XRVYSjKzthjJIjCLE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
