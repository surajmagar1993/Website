-- 1. Insert Dummy Products
insert into public.products (name, category, model, serial_number, status, specs)
values 
('Dell XPS 15', 'Laptop', 'XPS 9500', 'SN-DELL-1001', 'available', '{"cpu": "i7-10750H", "ram": "16GB", "storage": "512GB SSD"}'),
('MacBook Pro M1', 'Laptop', 'A2338', 'SN-APPLE-2002', 'available', '{"cpu": "M1", "ram": "16GB", "storage": "1TB SSD"}'),
('HP EliteBook', 'Laptop', '840 G7', 'SN-HP-3003', 'available', '{"cpu": "i5-10210U", "ram": "8GB", "storage": "256GB SSD"}');

-- 2. Assign MacBook to Admin User (for testing)
-- We use a subquery to find the admin user ID dynamically
with admin_user as (
  select id from public.profiles where email = 'admin@genesoftinfotech.com' limit 1
),
target_product as (
  select id from public.products where serial_number = 'SN-APPLE-2002' limit 1
)
insert into public.assignments (product_id, client_id, assigned_date, status)
select 
  p.id, 
  a.id, 
  now(), 
  'active'
from target_product p, admin_user a;

-- 3. Update Product Status
update public.products 
set status = 'rented', current_client_id = (select id from public.profiles where email = 'admin@genesoftinfotech.com')
where serial_number = 'SN-APPLE-2002';
