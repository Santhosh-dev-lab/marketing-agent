-- Enable Realtime for 'tasks' table to allow frontend subscriptions
begin;
  -- Check if publication exists (standard in Supabase) and add tables
  -- Safe to run even if already added (idempotency depends on specific setup, but ALTER PUBLICATION ADD TABLE usually works fine)
  
  -- Add tasks table
  alter publication supabase_realtime add table public.tasks;
  
  -- Add user_credits table
  alter publication supabase_realtime add table public.user_credits;

commit;

-- Note: Ensure 'supabase_realtime' publication exists. 
-- In managed Supabase, it usually does. If using local dev, we might need:
-- create publication supabase_realtime;
