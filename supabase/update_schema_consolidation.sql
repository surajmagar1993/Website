-- 1. Add columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS website_url text;

-- 2. Optional: Migrate data from clients table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        UPDATE public.profiles p
        SET 
            logo_url = c.logo_url,
            website_url = c.website_url
        FROM public.clients c
        WHERE p.company_name = c.name
        AND p.role = 'client';
    END IF;
END $$;
