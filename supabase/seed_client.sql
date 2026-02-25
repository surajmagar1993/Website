-- 1. Create a profile for the test client (assuming auth user exists)
-- This usually happens automatically via trigger, but we can ensure it exists or update it
update public.profiles 
set full_name = 'Test Client', company_name = 'Acme Corp'
where email = 'client@test.com';

-- 2. Assign a product to this client
with client_user as (
  select id from public.profiles where email = 'client@test.com' limit 1
),
target_product as (
  select id from public.products where serial_number = 'SN-HP-3003' limit 1
)
insert into public.assignments (product_id, client_id, assigned_date, status)
select 
  p.id, 
  c.id, 
  now(), 
  'active'
from target_product p, client_user c;

-- 3. Update Product Status
update public.products 
set status = 'rented', current_client_id = (select id from public.profiles where email = 'client@test.com')
where serial_number = 'SN-HP-3003';
