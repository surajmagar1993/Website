-- 1. Profiles (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'client' check (role in ('admin', 'client')),
  company_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'client');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile automatically
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Products (Inventory)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text, -- 'Laptop', 'Desktop', 'Server', 'Accessory'
  model text,
  serial_number text unique not null,
  specs jsonb default '{}'::jsonb, -- Store dynamic specs (RAM, CPU, Storage)
  status text default 'available' check (status in ('available', 'rented', 'maintenance', 'retired')),
  current_client_id uuid references public.profiles(id), -- Null if available
  purchase_date date,
  warranty_expiry date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.products enable row level security;

-- Policies for Products
create policy "Admins can do everything on products." on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Clients can view products assigned to them." on public.products for select using (
  current_client_id = auth.uid()
);


-- 3. Assignments (Rental History)
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) not null,
  client_id uuid references public.profiles(id) not null,
  assigned_date timestamp with time zone default timezone('utc'::text, now()) not null,
  returned_date timestamp with time zone,
  notes text,
  status text default 'active' check (status in ('active', 'returned'))
);

-- Turn on RLS
alter table public.assignments enable row level security;

-- Policies for Assignments
create policy "Admins can do everything on assignments." on public.assignments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Clients can view their own assignments." on public.assignments for select using (
  client_id = auth.uid()
);


-- 4. Tickets (Support System)
create table public.tickets (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id), -- Optional, ticket might not be about a specific product
  subject text not null,
  description text not null,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.tickets enable row level security;

-- Policies for Tickets
create policy "Admins can do everything on tickets." on public.tickets for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Clients can view and create their own tickets." on public.tickets for all using (
  client_id = auth.uid()
);
-- Site Settings Table
create table public.site_settings (
  key text primary key,
  value text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for site_settings
alter table public.site_settings enable row level security;

create policy "Public can view site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for all
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

-- Initial Data
insert into public.site_settings (key, value, description) values
('company_name', 'Genesoft Infotech', 'The name of the company displayed in the header/footer.'),
('company_tagline', 'IT Solutions & Digital Transformation', 'The tagline displayed below the logo or in the hero section.'),
('contact_email', 'info@genesoft.com', 'Primary contact email displayed on the site.'),
('contact_phone', '+91 98765 43210', 'Primary contact phone number.'),
('contact_address', '123 Tech Park, Innovation Way, Mumbai, India', 'Physical address of the company.'),
('social_linkedin', 'https://linkedin.com/company/genesoft', 'LinkedIn profile URL.'),
('social_twitter', 'https://twitter.com/genesoft', 'Twitter profile URL.'),
('social_instagram', 'https://instagram.com/genesoft', 'Instagram profile URL.'),
('home_hero_title', 'Your Trusted Partner for Digital Transformation', 'Headline on the landing page hero section.'),
('home_hero_subtitle', 'We deliver cutting-edge software solutions that drive growth and innovation for businesses worldwide.', 'Subtitle on the landing page hero section.'),
('home_hero_cta_text', 'Get Started', 'Text for the main CTA button in hero section.'),
('home_hero_cta_link', '/contact', 'Link for the main CTA button in hero section.');
