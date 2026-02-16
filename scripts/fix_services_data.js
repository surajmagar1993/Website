/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const iconMappings = {
  'web-development': 'Globe',
  'app-development': 'Smartphone',
  'market-research': 'Search',
  'data-analytics': 'BarChart',
  'lead-generation': 'Target',
  'it-products': 'Server',
  'it-products-rentals': 'Server',
  'product-rentals': 'Server'
};

async function run() {
  console.log('Fetching services...');
  const { data: services, error } = await supabase.from('services').select('*');
  
  if (error) {
    console.error('Error fetching services:', error);
    return;
  }

  console.log(`Processing ${services.length} services...`);

  for (const service of services) {
    let updates = {};
    let needsUpdate = false;

    // 1. Handle Image URL in 'icon' column
    if (service.icon && service.icon.startsWith('http')) {
      console.log(`[${service.slug}] Found URL in 'icon'. Moving to 'image_url' if empty.`);
      if (!service.image_url) {
        updates.image_url = service.icon;
        needsUpdate = true;
      }
      // We will overwrite 'icon' below
    }

    // 2. Set correct Icon Name
    const targetIcon = iconMappings[service.slug];
    if (targetIcon && service.icon !== targetIcon) {
        updates.icon = targetIcon;
        needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Updating ${service.slug}:`, updates);
      const { error: updateError } = await supabase
        .from('services')
        .update(updates)
        .eq('id', service.id);
      
      if (updateError) {
        console.error(`Error updating ${service.slug}:`, updateError);
      } else {
        console.log(`Success: ${service.slug} updated.`);
      }
    } else {
      console.log(`[${service.slug}] No changes needed.`);
    }
  }
}

run();
