-- Create a table for product categories
create table if not exists public.product_categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.product_categories enable row level security;

-- Policies
create policy "Public can view product categories"
  on public.product_categories for select
  using (true);

create policy "Admins can manage product categories"
  on public.product_categories for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Seed some initial categories
insert into public.product_categories (name)
values ('Laptop'), ('Desktop'), ('Server'), ('Accessory')
on conflict (name) do nothing;
