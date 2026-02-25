-- setup_blog.sql

-- 1. Blog Categories
create table if not exists public.blog_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Blog Posts
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

-- RLS Policies
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;

-- Categories: Everyone can view, Admins can manage
create policy "Categories are viewable by everyone" on public.blog_categories for select using (true);
create policy "Admins can manage categories" on public.blog_categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Posts: Everyone can view published, Admins can manage all
create policy "Published posts are viewable by everyone" on public.blog_posts for select using (published = true);
create policy "Admins can view all posts" on public.blog_posts for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage posts" on public.blog_posts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Categories Seed Data
insert into public.blog_categories (name, slug) values
('Technology', 'technology'),
('Digital Transformation', 'digital-transformation'),
('Business Growth', 'business-growth'),
('Cloud Computing', 'cloud-computing'),
('Artificial Intelligence', 'ai-ml')
on conflict (slug) do nothing;
