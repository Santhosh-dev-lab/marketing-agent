-- Migration: Add Voice Settings Column
-- Description: Stores voice/tone specific settings like slogan, prohibited words, etc.

alter table public.brands 
add column if not exists voice_settings jsonb default '{}'::jsonb;
