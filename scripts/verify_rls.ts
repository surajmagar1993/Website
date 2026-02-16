
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lohpoefucnlndqhmzhfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaHBvZWZ1Y25sbmRxaG16aGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzUwODQsImV4cCI6MjA4NjMxMTA4NH0.w3gmCu2S_upPFZgcDHYbgwOmy0WQLIDslxEvx4VV82Y'; // ANON KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRLS() {
  console.log('Verifying RLS...');

  // 1. Sign In
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'client@test.com',
    password: 'password123'
  });

  if (authError) {
    console.error('Sign in failed:', authError);
    return;
  }
  
  const user = authData.user;
  console.log('Signed in as:', user.email, 'ID:', user.id);

  // 2. Fetch Profile to confirm ID matches
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  } else {
    console.log('Profile found:', profile);
  }

  // 3. Query Products (mimic AssignmentsList.tsx)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, status, current_client_id')
    .eq('current_client_id', user.id)
    .eq('status', 'rented');

  if (productsError) {
    console.error('Error querying products:', productsError);
    return;
  }

  console.log(`Found ${products?.length ?? 0} products visible to client.`);
  if (products && products.length > 0) {
    console.log('First product:', products[0]);
  }
}

verifyRLS();
