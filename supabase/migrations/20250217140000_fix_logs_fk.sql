-- Drop the old constraint referencing auth.users
alter table public.activity_logs drop constraint if exists activity_logs_user_id_fkey;

-- Add new constraint referencing public.profiles
alter table public.activity_logs add constraint activity_logs_user_id_fkey
  foreign key (user_id) references public.profiles(id)
  on delete set null;

-- Verify the change (optional comment)
comment on column public.activity_logs.user_id is 'References public.profiles(id) for easier joins';
