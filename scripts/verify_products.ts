
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
