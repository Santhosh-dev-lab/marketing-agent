-- Debug Cron Jobs
-- Run this in Supabase SQL Editor

-- 1. Ensure extensions are active
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 2. Check if the job is actually scheduled
select jobid, schedule, command, nodename, nodeport, database, username, active from cron.job;

-- 3. Check WHY it failed (Logs)
-- Look at the 'status' and 'return_message' columns
select runid, jobid, database, status, return_message, start_time, end_time 
from cron.job_run_details 
order by start_time desc 
limit 10;
