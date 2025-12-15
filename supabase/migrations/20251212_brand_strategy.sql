-- Migration: Add Brand Strategy Columns
-- Description: Stores high-level brand strategy data collected during onboarding.

alter table public.brands 
add column if not exists audience_persona jsonb default '{}'::jsonb,
add column if not exists brand_values jsonb default '[]'::jsonb,
add column if not exists competitors jsonb default '[]'::jsonb,
add column if not exists strategy_report jsonb default '{}'::jsonb;

-- Ensure RLS is still active (it should be, but good to verify safety)
alter table public.brands enable row level security;

-- The existing policy "Users can update their own brands" covers these new columns automatically:
-- create policy "Users can update their own brands" on public.brands for update using (auth.uid() = user_id);
