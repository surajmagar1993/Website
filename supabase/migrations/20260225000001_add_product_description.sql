-- Migration 2: Add description to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS description TEXT;
