-- 1. Add user_id column
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Backfill user_id from existing brands
UPDATE public.tasks t
SET user_id = b.user_id
FROM public.brands b
WHERE t.brand_id = b.id;

-- 3. Make brand_id optional
ALTER TABLE public.tasks 
ALTER COLUMN brand_id DROP NOT NULL;

-- 4. Update RLS Policies to allow access by user_id
DROP POLICY IF EXISTS "Users can view their brand's tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks for their brand" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their brand's tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their brand's tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
USING (user_id = auth.uid() OR brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own tasks"
ON public.tasks FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE
USING (user_id = auth.uid());

-- 5. Add index for user_id
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
