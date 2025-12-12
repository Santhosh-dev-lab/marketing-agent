-- Migration: Analytics Metrics Table
-- Description: Stores daily analytics data per platform for each brand.

create table if not exists public.brand_analytics (
    id uuid default gen_random_uuid() primary key,
    brand_id uuid references public.brands(id) on delete cascade not null,
    date date not null default current_date,
    platform text not null check (platform in ('instagram', 'twitter', 'linkedin', 'website', 'tiktok', 'youtube')),
    
    -- Core Metrics
    followers int default 0,
    impressions int default 0,
    reach int default 0,
    engagement int default 0,
    engagement_rate float default 0.0,
    
    -- Deep Metrics
    clicks int default 0,
    saves int default 0,
    shares int default 0,
    comments int default 0,
    
    -- Sentiment (Optional future integration)
    sentiment_score float, -- -1.0 to 1.0
    
    created_at timestamptz default now(),
    
    -- Ensure one record per platform per day
    unique(brand_id, platform, date)
);

-- RLS Policies
alter table public.brand_analytics enable row level security;

create policy "Users can view their own brand analytics"
    on public.brand_analytics for select
    using ( brand_id in (select id from public.brands where user_id = auth.uid()) );

create policy "Users can insert their own brand analytics"
    on public.brand_analytics for insert
    with check ( brand_id in (select id from public.brands where user_id = auth.uid()) );
