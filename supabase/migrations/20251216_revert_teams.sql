-- Revert Agency/Teams Model
-- Restores database to simple single-user model

-- 1. Drop Teams Tables
DROP TABLE IF EXISTS public.team_invitations CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP FUNCTION IF EXISTS create_team_with_owner CASCADE;

-- 2. Restore Brands Policies (Simple Owner Access)
DROP POLICY IF EXISTS "Team members can view brands" ON public.brands;
DROP POLICY IF EXISTS "Team members can create brands" ON public.brands;
DROP POLICY IF EXISTS "Team admins can update brands" ON public.brands;
-- Drop legacy if exists just in case
DROP POLICY IF EXISTS "Users can view their own brands" ON public.brands;

CREATE POLICY "Users can view their own brands" ON public.brands
    FOR ALL USING (auth.uid() = user_id);

-- Optional: Drop team_id from brands if we want to be fully clean
-- ALTER TABLE public.brands DROP COLUMN IF EXISTS team_id; -- Keep column for safety or drop? 
-- Let's drop it to ensure no "ambiguous column" issues later
ALTER TABLE public.brands DROP COLUMN IF EXISTS team_id;

-- 3. Restore Tasks Policies
DROP POLICY IF EXISTS "Team members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their brand tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks for their brand" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;

-- View: If you own the brand, you see the task
CREATE POLICY "Users can view their brand tasks" ON public.tasks
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE user_id = auth.uid()
        )
    );

-- Insert: If you own the brand
CREATE POLICY "Users can insert tasks for their brand" ON public.tasks
    FOR INSERT WITH CHECK (
        brand_id IN (
            SELECT id FROM public.brands WHERE user_id = auth.uid()
        )
    );

-- Update
CREATE POLICY "Users can update tasks" ON public.tasks
    FOR UPDATE USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE user_id = auth.uid()
        )
    );

ALTER TABLE public.tasks DROP COLUMN IF EXISTS assigned_to;
