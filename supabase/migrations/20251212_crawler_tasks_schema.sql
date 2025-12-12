
-- Phase 4: Web Crawler & Task System Schema

-- 1. Add 'website' column to brands table
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS website TEXT;

-- 2. Create 'tasks' table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assignee_email TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Tasks
CREATE POLICY "Users can view their brand's tasks"
    ON public.tasks FOR SELECT
    USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert tasks for their brand"
    ON public.tasks FOR INSERT
    WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their brand's tasks"
    ON public.tasks FOR UPDATE
    USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their brand's tasks"
    ON public.tasks FOR DELETE
    USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_brand_id ON public.tasks(brand_id);
