-- Enable RLS on ticket_messages
alter table public.ticket_messages enable row level security;

-- Policy: Admins can view all messages
create policy "Admins can view all ticket messages"
  on public.ticket_messages
  for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Policy: Clients can view messages for their own tickets
create policy "Clients can view messages for their tickets"
  on public.ticket_messages
  for select
  using (
    exists (
      select 1 from public.tickets
      where tickets.id = ticket_messages.ticket_id
      and tickets.client_id = auth.uid()
    )
  );

-- Policy: Admins can insert messages
create policy "Admins can insert ticket messages"
  on public.ticket_messages
  for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Policy: Clients can insert messages for their own tickets
create policy "Clients can insert messages for their tickets"
  on public.ticket_messages
  for insert
  with check (
    exists (
      select 1 from public.tickets
      where tickets.id = ticket_messages.ticket_id
      and tickets.client_id = auth.uid()
    )
  );

-- Helper to allow public profile reading (already exists but ensuring)
-- create policy "Comments are visible to ticket owners" ... handled above.
