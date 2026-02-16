-- Final Cleanup and RLS Completion for Client Consolidation

-- 1. Drop the redundant legacy table
-- WARNING: Ensure all data has been migrated to the 'profiles' table before running this.
DROP TABLE IF EXISTS public.clients;

-- 2. Ensure Profiles RLS includes deletion for admins
-- Users can already update their own profiles, but admins need full control.
CREATE POLICY "Admins can delete any client profile"
ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. (Optional) Ensure Auth-to-Profile cascade is explicit
-- This is usually handled by the 'references auth.users on delete cascade' 
-- but we verify the existence of the foreign key constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
