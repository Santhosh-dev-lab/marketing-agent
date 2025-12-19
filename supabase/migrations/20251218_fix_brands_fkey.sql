-- Fix brands user_id foreign key
-- ensure it references auth.users directly to avoid "violates foreign key constraint" errors

ALTER TABLE public.brands DROP CONSTRAINT IF EXISTS brands_user_id_fkey;

ALTER TABLE public.brands 
    ADD CONSTRAINT brands_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
