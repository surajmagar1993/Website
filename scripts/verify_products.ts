
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lohpoefucnlndqhmzhfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaHBvZWZ1Y25sbmRxaG16aGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczNTA4NCwiZXhwIjoyMDg2MzExMDg0fQ.LzDbeFhT0xjy02m_mlXOOaQmV4XyB-7snkf2wJeAtKw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
  console.log('Verifying data...');

  // 1. Get Client ID
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'client@test.com')
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return;
  }

  console.log('Client Profile:', profiles);

  // 2. Count Rented Products
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('current_client_id', profiles.id)
    .eq('status', 'rented');

  if (countError) {
    console.error('Error counting products:', countError);
    return;
  }

  console.log(`Rented Products Count: ${count}`);

  // 3. List first 5 products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, serial_number, status')
    .eq('current_client_id', profiles.id)
    .limit(5);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return;
  }

  console.log('Sample Products:', products);
}

verifyData();
