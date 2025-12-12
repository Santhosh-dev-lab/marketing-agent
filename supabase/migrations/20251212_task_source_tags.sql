
-- Add source_url to tasks table for tracking where the task came from
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Index for potential filtering by source
CREATE INDEX IF NOT EXISTS idx_tasks_source_url ON public.tasks(source_url);
