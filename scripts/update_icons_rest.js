/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = {
  'web-development': 'Globe',
  'app-development': 'Smartphone',
  'market-research': 'Search',
  'data-analytics': 'BarChart',
  'lead-generation': 'Target',
  'it-products-rentals': 'Server', // or HardDrive
  'product-rentals': 'Server' // fallback if slug is different
};

async function run() {
  console.log('Fetching services...');
  const { data: services, error } = await supabase.from('services').select('id, slug, title');
  
  if (error) {
    console.error('Error fetching services:', error);
    return;
  }

  console.log(`Found ${services.length} services.`);

  for (const service of services) {
    const iconName = updates[service.slug];
    if (iconName) {
      console.log(`Updating ${service.slug} with icon ${iconName}...`);
      const { error: updateError } = await supabase
        .from('services')
        .update({ icon_name: iconName })
        .eq('id', service.id);
      
      if (updateError) {
        console.error(`Error updating ${service.slug}:`, updateError);
      } else {
        console.log(`Success: ${service.slug} -> ${iconName}`);
      }
    } else {
      console.log(`No icon mapping found for slug: ${service.slug}`);
    }
  }
}

run();
