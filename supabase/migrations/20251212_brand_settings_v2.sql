-- Migration: Brand Settings V2
-- Description: Adds comprehensive brand profile fields (Industry, Tone, Socials, Safety, Visuals).

alter table public.brands 
add column if not exists industry text,
add column if not exists location text,
add column if not exists primary_goal text,
add column if not exists tone_voice text, -- e.g., 'Professional', 'Witty', etc.
add column if not exists emoji_usage text, -- 'None', 'Minimal', 'Heavy'
add column if not exists language text default 'English',
add column if not exists key_adjectives jsonb default '[]'::jsonb, -- Array of strings
add column if not exists social_handles jsonb default '{}'::jsonb, -- { "instagram": "@handle", "twitter": "..." }
add column if not exists forbidden_words jsonb default '[]'::jsonb, -- Array of strings
add column if not exists brand_color text default '#000000';

-- Add a comment to documented the new fields
comment on column public.brands.industry is 'Primary industry category (e.g., Retail, Tech)';
comment on column public.brands.tone_voice is 'Desired AI personality tone';
comment on column public.brands.social_handles is 'Map of platform names to handles/URLs';
