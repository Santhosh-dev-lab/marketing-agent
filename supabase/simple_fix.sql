-- SIMPLE FIX
-- 1. Enable pg_net (Basic)
create extension if not exists pg_net;
-- If this says "already exists", that is perfect.

-- 2. Reschedule for 13:20 PM IST (07:50 UTC)
-- Run this NOW (before 13:20 PM)

select cron.schedule(
  'weekly-newsletter',
  '50 7 * * 5', -- Friday at 7:50 AM UTC (13:20 IST)
  $$
  select
    net.http_post(
      url:='https://lgthbjsuqzmntknzrvgu.supabase.co/functions/v1/send-newsletter',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndGhianN1cXptbnRrbnpydmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3ODI5MSwiZXhwIjoyMDgwODU0MjkxfQ.-XuDygzsb3_GTwgmZn6nx7lG7-XRVYSjKzthjJIjCLE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
