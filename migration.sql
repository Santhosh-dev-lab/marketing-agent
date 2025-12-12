-- 1. Drop the function first to remove dependency on the column
DROP FUNCTION IF EXISTS match_memories(vector(768), float, int, uuid);
DROP FUNCTION IF EXISTS match_memories(vector(384), float, int, uuid);

-- 2. Create extension if needed
CREATE EXTENSION IF NOT EXISTS "vector";

-- 3. Clear existing data to avoid dimension mismatch errors during alteration
TRUNCATE TABLE public.memories;

-- 4. Alter the column to 768 dimensions (Gemini)
-- We drop and recreate to be absolutely sure, or just ALTER if empty.
-- Since we TRUNCATED, ALTER is safe.
ALTER TABLE public.memories DROP COLUMN IF EXISTS embedding;
ALTER TABLE public.memories ADD COLUMN embedding vector(768);

-- 5. Create the credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  agent_type text NOT NULL,
  credits_remaining int DEFAULT 3,
  last_refill timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(brand_id, agent_type)
);

-- 6. Setup RLS for credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.brands WHERE brands.id = user_credits.brand_id AND brands.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
CREATE POLICY "Users can update their own credits" ON public.user_credits FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.brands WHERE brands.id = user_credits.brand_id AND brands.user_id = auth.uid())
);

-- 7. Re-create the search function with correct 768 dimensions
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_brand_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE 1 - (memories.embedding <=> query_embedding) > match_threshold
  AND memories.brand_id = p_brand_id
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
