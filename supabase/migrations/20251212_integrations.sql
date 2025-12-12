-- Migration: API Config for Integrations
-- Description: Stores API keys and tokens for external platforms (Instagram, Twitter, YouTube, etc.)

alter table public.brands
add column if not exists api_config jsonb default '{}'::jsonb;

-- Comment
comment on column public.brands.api_config is 'Stores encrypted or raw API keys/tokens for 3rd party integrations like { "instagram": { "access_token": "..." } }';
