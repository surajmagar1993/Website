
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lohpoefucnlndqhmzhfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaHBvZWZ1Y25sbmRxaG16aGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczNTA4NCwiZXhwIjoyMDg2MzExMDg0fQ.LzDbeFhT0xjy02m_mlXOOaQmV4XyB-7snkf2wJeAtKw';

const supabase = createClient(supabaseUrl, supabaseKey);

function randomString(length: number) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function populate() {
  console.log('Starting population...');

  // 1. Get Client ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'client@test.com')
    .single();

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError);
    return;
  }
  const clientId = profile.id;
  console.log('Client ID:', clientId);

  // 2. Insert Laptops (100)
  const laptops = [];
  for (let i = 1; i <= 100; i++) {
    laptops.push({
      name: `Enterprise Laptop ${i}`,
      category: 'Laptop',
      model: `Dell Latitude ${5000 + i}`,
      serial_number: `SN-L-${randomString(8)}`,
      specs: { cpu: "i7", ram: "16GB", storage: "512GB SSD" },
      status: 'available',
      created_at: new Date().toISOString()
    });
  }
  
  const { data: insertedLaptops, error: laptopError } = await supabase
    .from('products')
    .insert(laptops)
    .select('id');

  if (laptopError) {
    console.error('Error inserting laptops:', laptopError);
    return;
  }
  console.log(`Inserted ${insertedLaptops.length} laptops.`);

  // 3. Insert Desktops (50)
  const desktops = [];
  for (let i = 1; i <= 50; i++) {
    desktops.push({
      name: `Office Desktop ${i}`,
      category: 'Desktop',
      model: `HP EliteDesk ${800 + i}`,
      serial_number: `SN-D-${randomString(8)}`,
      specs: { cpu: "i5", ram: "32GB", storage: "1TB SSD" },
      status: 'available',
      created_at: new Date().toISOString()
    });
  }

  const { data: insertedDesktops, error: desktopError } = await supabase
    .from('products')
    .insert(desktops)
    .select('id');

  if (desktopError) {
    console.error('Error inserting desktops:', desktopError);
    return;
  }
  console.log(`Inserted ${insertedDesktops.length} desktops.`);

  // 4. Assign 70 Laptops
  const laptopsToAssign = insertedLaptops.slice(0, 70);
  for (const product of laptopsToAssign) {
    // Update product
    await supabase.from('products').update({ status: 'rented', current_client_id: clientId }).eq('id', product.id);
    // Create assignment
    await supabase.from('assignments').insert({
      product_id: product.id,
      client_id: clientId,
      assigned_date: new Date().toISOString(),
      status: 'active'
    });
  }
  console.log('Assigned 70 laptops.');

  // 5. Assign 20 Desktops
  const desktopsToAssign = insertedDesktops.slice(0, 20);
  for (const product of desktopsToAssign) {
    // Update product
    await supabase.from('products').update({ status: 'rented', current_client_id: clientId }).eq('id', product.id);
    // Create assignment
    await supabase.from('assignments').insert({
      product_id: product.id,
      client_id: clientId,
      assigned_date: new Date().toISOString(),
      status: 'active'
    });
  }
  console.log('Assigned 20 desktops.');
  console.log('Done!');
}

populate();
