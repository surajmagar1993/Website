-- Drop existing policies to be safe
drop policy if exists "Clients can view products assigned to them." on public.products;
drop policy if exists "Admins can do everything on products." on public.products;

-- Re-create policies
create policy "Admins can do everything on products." 
on public.products 
for all 
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Clients can view products assigned to them." 
on public.products 
for select 
using (
  current_client_id = auth.uid()
);

-- Ensure RLS is enabled
alter table public.products enable row level security;
