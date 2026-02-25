-- Migration: Enhance Tickets Table for Advanced Support Features

ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS internal_notes text,
ADD COLUMN IF NOT EXISTS replacement_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback text,
ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT '{}';

-- Refresh RLS to ensure these can be handled
-- Admins can already do "all" on tickets, but we ensure policies are clear
DROP POLICY IF EXISTS "Admins can do everything on tickets." ON public.tickets;
CREATE POLICY "Admins can do everything on tickets." ON public.tickets FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

DROP POLICY IF EXISTS "Clients can view and create their own tickets." ON public.tickets;
CREATE POLICY "Clients can view and create their own tickets." ON public.tickets FOR ALL USING (
  client_id = auth.uid()
);
