-- FIX SCRIPT
-- 1. Enable the missing 'net' extension (This caused the errors!)
create extension if not exists pg_net schema extensions;
create schema if not exists net;
grant usage on schema net to postgres, anon, service_role;
alter extension pg_net set schema net;

-- 2. Reschedule for 13:15 PM IST (07:45 UTC)
-- Run this before 13:15!

select cron.schedule(
  'weekly-newsletter',
  '45 7 * * 5', -- Friday at 7:45 AM UTC (13:15 IST)
  $$
  select
    net.http_post(
      url:='https://lgthbjsuqzmntknzrvgu.supabase.co/functions/v1/send-newsletter',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndGhianN1cXptbnRrbnpydmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3ODI5MSwiZXhwIjoyMDgwODU0MjkxfQ.-XuDygzsb3_GTwgmZn6nx7lG7-XRVYSjKzthjJIjCLE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
