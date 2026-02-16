-- 1. Create the activity_logs table if it doesn't exist
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- We will set the FK below
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add the correct Foreign Key to public.profiles
-- We use DO block to avoid errors if constraint already exists or to drop old one safely
do $$ 
begin
  -- Drop old FK if it exists (referencing auth.users)
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'activity_logs_user_id_fkey') then
    alter table public.activity_logs drop constraint activity_logs_user_id_fkey;
  end if;
end $$;

-- Add the correctly targeting FK
alter table public.activity_logs 
  add constraint activity_logs_user_id_fkey 
  foreign key (user_id) references public.profiles(id) 
  on delete set null;

-- 3. Enable RLS
alter table public.activity_logs enable row level security;

-- 4. Create Policies
drop policy if exists "Admins can view all logs" on public.activity_logs;
create policy "Admins can view all logs"
  on public.activity_logs
  for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Users can insert their own logs" on public.activity_logs;
create policy "Users can insert their own logs"
  on public.activity_logs
  for insert
  with check (
    auth.uid() = user_id
  );
