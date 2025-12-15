-- Refactor User Credits to be User-Centric (not Brand-Centric)

-- 1. Drop old objects
drop table if exists public.user_credits cascade;
drop function if exists public.deduct_credits;

-- 2. Create new table linked to auth.users
create table public.user_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  credits_remaining int default 3,
  last_refill timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id) -- One record per user
);

-- 3. RLS
alter table public.user_credits enable row level security;

create policy "Users can view their own credits" on public.user_credits 
  for select using (auth.uid() = user_id);

create policy "Users can update their own credits" on public.user_credits 
  for update using (auth.uid() = user_id);

-- 4. Enable Realtime
alter publication supabase_realtime add table public.user_credits;

-- 5. Updated Atomic RPC Function
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_cost int default 1
)
returns json
language plpgsql
security definer
as $$
declare
  v_credits int;
  v_updated_credits int;
begin
  -- Lazy Init: Ensure record exists for this User (not brand)
  insert into public.user_credits (user_id, credits_remaining)
  values (p_user_id, 3)
  on conflict (user_id) do nothing;
  
  -- Deduct
  update public.user_credits
  set credits_remaining = credits_remaining - p_cost,
      last_refill = now()
  where user_id = p_user_id
    and credits_remaining >= p_cost
  returning credits_remaining into v_updated_credits;

  if v_updated_credits is not null then
    return json_build_object('success', true, 'remaining', v_updated_credits);
  else
    select credits_remaining into v_credits
    from public.user_credits
    where user_id = p_user_id;
    
    return json_build_object('success', false, 'remaining', v_credits, 'error', 'Insufficient credits');
  end if;
end;
$$;
