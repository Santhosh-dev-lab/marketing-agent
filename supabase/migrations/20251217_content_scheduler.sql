-- Content Scheduler Tables

-- 1. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    topic TEXT, -- Original topic prompt
    image_url TEXT,
    platform VARCHAR(50) NOT NULL, -- instagram, twitter, linkedin, facebook
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, scheduled, published, failed
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- View: Owners can view their posts
CREATE POLICY "Users can view posts for their brand" ON public.posts
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE user_id = auth.uid()
        )
    );

-- Insert: Owners can insert posts
CREATE POLICY "Users can insert posts for their brand" ON public.posts
    FOR INSERT WITH CHECK (
        brand_id IN (
            SELECT id FROM public.brands WHERE user_id = auth.uid()
        )
    );

-- Update: Owners can update posts
CREATE POLICY "Users can update their posts" ON public.posts
    FOR UPDATE USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE user_id = auth.uid()
        )
    );

-- Delete: Owners can delete posts
CREATE POLICY "Users can delete their posts" ON public.posts
    FOR DELETE USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE user_id = auth.uid()
        )
    );

-- 4. Index for performance
CREATE INDEX idx_posts_brand_id ON public.posts(brand_id);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at) WHERE status = 'scheduled';
