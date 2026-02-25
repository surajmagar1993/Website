-- Audit Logs Table Schema
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  action text not null, -- 'create_product', 'delete_product', 'login', etc.
  entity_type text not null, -- 'product', 'ticket', 'user'
  entity_id text,
  details jsonb, -- Store previous values or specific details
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.activity_logs enable row level security;

-- Admins can view all logs
create policy "Admins can view all logs"
  on public.activity_logs
  for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Users can insert their own logs (for server-side logging verification)
create policy "Users can insert their own logs"
  on public.activity_logs
  for insert
  with check (
    auth.uid() = user_id
  );
