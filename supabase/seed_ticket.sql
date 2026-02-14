-- Insert a test ticket for the Admin user (acting as client for this test)
with admin_user as (
  select id from public.profiles where email = 'admin@genesoftinfotech.com' limit 1
)
insert into public.tickets (client_id, subject, description, status, priority)
select 
  id, 
  'Cannot access VPN', 
  'I am getting a connection error when trying to connect to the office VPN.', 
  'open', 
  'high'
from admin_user;
