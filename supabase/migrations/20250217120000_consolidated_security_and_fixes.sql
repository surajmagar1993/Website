-- Consolidated Migration: Security Fixes & Blog Setup
-- Generated from ad-hoc scripts: fix_products_rls.sql, delete_tickets_policy.sql, ticket_messages_rls.sql, setup_blog.sql

-- ==========================================
-- 1. PRODUCTS RLS (fix_products_rls.sql)
-- ==========================================

-- Enable RLS (idempotent)
alter table public.products enable row level security;

-- Drop existing policies to ensure clean state (safe to run multiple times)
drop policy if exists "Clients can view products assigned to them." on public.products;
drop policy if exists "Admins can do everything on products." on public.products;

-- Create Policies
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


-- ==========================================
-- 2. TICKETS & MESSAGES RLS (delete_tickets_policy.sql, ticket_messages_rls.sql)
-- ==========================================

-- Tickets Delete Policy
drop policy if exists "Admins can delete any support ticket" on public.tickets;
create policy "Admins can delete any support ticket"
on public.tickets
for delete
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Ticket Messages RLS
alter table public.ticket_messages enable row level security;

-- Drop existing policies
drop policy if exists "Admins can view all ticket messages" on public.ticket_messages;
drop policy if exists "Clients can view messages for their tickets" on public.ticket_messages;
drop policy if exists "Admins can insert ticket messages" on public.ticket_messages;
drop policy if exists "Clients can insert messages for their tickets" on public.ticket_messages;

-- Re-create Policies
create policy "Admins can view all ticket messages"
  on public.ticket_messages
  for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

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

create policy "Admins can insert ticket messages"
  on public.ticket_messages
  for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

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


-- ==========================================
-- 3. BLOG SETUP (setup_blog.sql)
-- ==========================================

-- Blog Categories Table
create table if not exists public.blog_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blog Posts Table
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  image_url text,
  published boolean default false,
  category_id uuid references public.blog_categories(id),
  author_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;

-- Drop existing policies to prevent conflicts
drop policy if exists "Categories are viewable by everyone" on public.blog_categories;
drop policy if exists "Admins can manage categories" on public.blog_categories;
drop policy if exists "Published posts are viewable by everyone" on public.blog_posts;
drop policy if exists "Admins can view all posts" on public.blog_posts;
drop policy if exists "Admins can manage posts" on public.blog_posts;

-- Blog Categories Policies
create policy "Categories are viewable by everyone" on public.blog_categories for select using (true);

create policy "Admins can manage categories" on public.blog_categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Blog Posts Policies
create policy "Published posts are viewable by everyone" on public.blog_posts for select using (published = true);

create policy "Admins can view all posts" on public.blog_posts for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can manage posts" on public.blog_posts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Seed Blog Categories (Idempotent)
insert into public.blog_categories (name, slug) values
('Technology', 'technology'),
('Digital Transformation', 'digital-transformation'),
('Business Growth', 'business-growth'),
('Cloud Computing', 'cloud-computing'),
('Artificial Intelligence', 'ai-ml')
on conflict (slug) do nothing;
