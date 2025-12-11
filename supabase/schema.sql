-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Profiles: Users (Safe Creation)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brands: Settings & Voice
create table if not exists public.brands (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLEANUP & CONSTRAINT: Ensure one brand per user
-- 1. Delete duplicates (keep oldest)
delete from public.brands
where id not in (
  select id from (
    select distinct on (user_id) id
    from public.brands
    order by user_id, created_at asc
  ) as subquery
);

-- 2. Add Unique Constraint
alter table public.brands drop constraint if exists brands_user_id_key;
alter table public.brands add constraint brands_user_id_key unique (user_id);


-- Add columns to Brands safely (if they don't exist)
alter table public.brands add column if not exists website text;
alter table public.brands add column if not exists instagram text;
alter table public.brands add column if not exists tone_voice jsonb default '{}'::jsonb;
alter table public.brands add column if not exists voice_settings jsonb default '{}'::jsonb;
alter table public.brands add column if not exists social_connections jsonb default '{}'::jsonb;

-- Assets: Uploaded files
create table if not exists public.assets (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands(id) on delete cascade not null,
  file_path text not null, -- Supabase Storage path
  file_type text, -- 'image', 'pdf', etc.
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LLM Cache: Cost optimization
create table if not exists public.llm_cache (
  id uuid default gen_random_uuid() primary key,
  prompt_hash text unique not null,
  model text not null,
  response jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists idx_llm_cache_hash on public.llm_cache(prompt_hash);

-- Generation Logs (Observability)
create table if not exists public.generation_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt_hash text,
  status text not null, -- 'success', 'failed', 'cached'
  model text,
  latency_ms integer,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Agent Configs (Secure API Keys)
create table if not exists public.agent_configs (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands(id) on delete cascade not null,
  agent_type text not null, -- 'strategy', 'content', 'visual', 'brand_twin'
  model_provider text default 'huggingface', -- 'openai', 'anthropic', 'huggingface'
  api_key_encrypted text, -- We will store this encrypted (or effectively handled by RLS/Edge)
  is_active boolean default true,
  settings jsonb default '{}'::jsonb, -- custom prompts, etc.
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(brand_id, agent_type)
);

-- Agent Jobs (Orchestration)
create table if not exists public.agent_jobs (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands(id) on delete cascade not null,
  job_type text not null, -- 'generate_campaign', 'repurpose_content'
  status text default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  input_data jsonb,
  output_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Credits: 3 credits per agent per brand
create table if not exists public.user_credits (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands(id) on delete cascade not null,
  agent_type text not null, -- 'strategy', 'content', 'visual', 'brand_twin'
  credits_remaining int default 3,
  last_refill timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(brand_id, agent_type)
);

-- Memories (Vector Store for Brand Twin)
create table if not exists public.memories (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands(id) on delete cascade not null,
  content text not null,
  embedding vector(768), -- Dimension for Gemini text-embedding-004
  source_type text, -- 'website', 'file', 'manual'
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists idx_memories_brand_id on public.memories(brand_id);

-- Campaigns: Groups of posts
create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands(id) on delete cascade not null,
  name text not null,
  goal text not null,
  start_date date,
  end_date date,
  status text default 'draft', -- 'draft', 'scheduled', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts: Individual content items
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  platform text not null, -- 'twitter', 'linkedin', 'instagram', 'email'
  content text not null,
  image_url text, -- For generated or uploaded images
  is_approved boolean default false,
  scheduled_for timestamp with time zone,
  status text default 'pending', -- 'pending', 'posted', 'failed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance (IF NOT EXISTS is not standard for CREATE INDEX in all pg versions, but Supabase PG15 supports it)
create index if not exists idx_brands_user_id on public.brands(user_id);
create index if not exists idx_assets_brand_id on public.assets(brand_id);
create index if not exists idx_campaigns_brand_id on public.campaigns(brand_id);
create index if not exists idx_posts_campaign_id on public.posts(campaign_id);
create index if not exists idx_generation_logs_user_id on public.generation_logs(user_id);

-- Secure the tables with RLS
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.assets enable row level security;
alter table public.campaigns enable row level security;
alter table public.posts enable row level security;
alter table public.generation_logs enable row level security;
alter table public.llm_cache enable row level security;
alter table public.agent_configs enable row level security;
alter table public.agent_jobs enable row level security;
alter table public.memories enable row level security;
alter table public.user_credits enable row level security;

-- Policies (Drop first to avoid conflicts)
drop policy if exists "Users can see their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can see their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can see their own brands" on public.brands;
drop policy if exists "Users can insert their own brands" on public.brands;
drop policy if exists "Users can update their own brands" on public.brands;
drop policy if exists "Users can delete their own brands" on public.brands;

create policy "Users can see their own brands" on public.brands for select using (auth.uid() = user_id);
create policy "Users can insert their own brands" on public.brands for insert with check (auth.uid() = user_id);
create policy "Users can update their own brands" on public.brands for update using (auth.uid() = user_id);
create policy "Users can delete their own brands" on public.brands for delete using (auth.uid() = user_id);

-- Assets policies
drop policy if exists "Users can see assets of their brands" on public.assets;
drop policy if exists "Users can insert assets to their brands" on public.assets;

create policy "Users can see assets of their brands" on public.assets for select using (
  exists (select 1 from public.brands where brands.id = assets.brand_id and brands.user_id = auth.uid())
);
create policy "Users can insert assets to their brands" on public.assets for insert with check (
  exists (select 1 from public.brands where brands.id = brand_id and brands.user_id = auth.uid())
);

-- Campaigns policies
drop policy if exists "Users can see campaigns of their brands" on public.campaigns;
drop policy if exists "Users can insert campaigns to their brands" on public.campaigns;

create policy "Users can see campaigns of their brands" on public.campaigns for select using (
  exists (select 1 from public.brands where brands.id = campaigns.brand_id and brands.user_id = auth.uid())
);
create policy "Users can insert campaigns to their brands" on public.campaigns for insert with check (
  exists (select 1 from public.brands where brands.id = brand_id and brands.user_id = auth.uid())
);

-- Posts policies
drop policy if exists "Users can see posts of their campaigns" on public.posts;
drop policy if exists "Users can insert posts to their campaigns" on public.posts;

create policy "Users can see posts of their campaigns" on public.posts for select using (
  exists (select 1 from public.campaigns join public.brands on campaigns.brand_id = brands.id where campaigns.id = posts.campaign_id and brands.user_id = auth.uid())
);
create policy "Users can insert posts to their campaigns" on public.posts for insert with check (
  exists (select 1 from public.campaigns join public.brands on campaigns.brand_id = brands.id where campaigns.id = campaign_id and brands.user_id = auth.uid())
);

-- Agent Configs policies
drop policy if exists "Users can manage their agent configs" on public.agent_configs;
create policy "Users can manage their agent configs" on public.agent_configs using (
  exists (select 1 from public.brands where brands.id = agent_configs.brand_id and brands.user_id = auth.uid())
);

-- Agent Jobs policies
drop policy if exists "Users can manage their agent jobs" on public.agent_jobs;
create policy "Users can manage their agent jobs" on public.agent_jobs using (
  exists (select 1 from public.brands where brands.id = agent_jobs.brand_id and brands.user_id = auth.uid())
);

-- Memories policies
drop policy if exists "Users can manage their memories" on public.memories;
create policy "Users can manage their memories" on public.memories using (
  exists (select 1 from public.brands where brands.id = memories.brand_id and brands.user_id = auth.uid())
);

-- User Credits policies
drop policy if exists "Users can view their own credits" on public.user_credits;
create policy "Users can view their own credits" on public.user_credits for select using (
  exists (select 1 from public.brands where brands.id = user_credits.brand_id and brands.user_id = auth.uid())
);
create policy "Users can update their own credits" on public.user_credits for update using (
    exists (select 1 from public.brands where brands.id = user_credits.brand_id and brands.user_id = auth.uid())
);

-- RPC for RAG (Similarity Search)
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_brand_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  and memories.brand_id = p_brand_id
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
