-- Migration: Add Asset ID, Specifications, and Specification Keys
-- Note: User MUST run this in the Supabase SQL Editor manually!

-- 1. Create a table to manage specification categories/keys (e.g., 'RAM', 'Storage', 'Screen Size')
CREATE TABLE IF NOT EXISTS public.specification_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (if needed, otherwise leave it open for admin insertion)
ALTER TABLE public.specification_keys ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone authenticated
CREATE POLICY "Allow read access to specification_keys"
ON public.specification_keys FOR SELECT
TO authenticated
USING (true);

-- Allow admins to insert/update/delete
CREATE POLICY "Allow admin to manage specification_keys"
ON public.specification_keys FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Add columns to the public.products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS asset_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;

-- Optional: Create an index for faster JSONB searching if there are many products
CREATE INDEX IF NOT EXISTS idx_products_specifications ON public.products USING GIN (specifications);
