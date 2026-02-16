/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

// Load environment variables (parsing .env.local manually since dotenv isn't installed)
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env.local');

let supabaseUrl, supabaseServiceKey;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceKey = line.split('=')[1].trim();
  });
} catch (e) {
  console.error('Error reading .env.local:', e);
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('Testing Supabase REST connection...');
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
      console.error('Connection failed:', error);
    } else {
      console.log('Connection successful!');
      if (data && data.length > 0) {
        const product = data[0];
        console.log('Checking for date columns...');
        console.log('assigned_date:', product.assigned_date !== undefined ? 'Exists' : 'Missing');
        console.log('replacement_date:', product.replacement_date !== undefined ? 'Exists' : 'Missing');
        console.log('return_date:', product.return_date !== undefined ? 'Exists' : 'Missing');
      } else {
        console.log('No products found to check schema.');
      }
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

testConnection();
