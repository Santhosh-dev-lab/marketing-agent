-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles: Users
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brands: Settings & Voice
create table brands (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  voice_settings jsonb default '{}'::jsonb, -- Store "witty", "formal" etc.
  social_connections jsonb default '{}'::jsonb, -- Store connected account metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assets: Uploaded files
create table assets (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references brands(id) on delete cascade not null,
  file_path text not null, -- Supabase Storage path
  file_type text, -- 'image', 'pdf', etc.
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LLM Cache: Cost optimization
create table llm_cache (
  id uuid default uuid_generate_v4() primary key,
  prompt_hash text not null,
  model text not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index idx_llm_cache_hash on llm_cache(prompt_hash);

-- Campaigns: Groups of posts
create table campaigns (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references brands(id) on delete cascade not null,
  name text not null,
  status text default 'draft', -- 'draft', 'scheduled', 'completed'
  goal text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts: Individual content items
create table posts (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  platform text not null, -- 'twitter', 'linkedin', 'instagram'
  content text,
  image_url text,
  scheduled_for timestamp with time zone,
  status text default 'pending', -- 'pending', 'posted', 'failed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance (FKs are not indexed by default)
create index idx_brands_user_id on brands(user_id);
create index idx_assets_brand_id on assets(brand_id);
create index idx_campaigns_brand_id on campaigns(brand_id);
create index idx_posts_campaign_id on posts(campaign_id);


-- Secure the tables with RLS
alter table profiles enable row level security;
alter table brands enable row level security;
alter table assets enable row level security;
alter table campaigns enable row level security;
alter table posts enable row level security;

-- Simple policies (placeholder for real auth logic)
create policy "Users can see their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can see their own brands" on brands for select using (auth.uid() = user_id);
create policy "Users can insert their own brands" on brands for insert with check (auth.uid() = user_id);
-- (Add policies for other tables similarly based on brand_id -> user_id check)
