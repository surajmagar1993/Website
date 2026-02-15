const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debugData() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('Fetching services...');
    const { data: services, error: sError } = await supabase
        .from('services')
        .select('title, category, image_url, case_study_image, display_order');
        
    if (sError) {
        console.error('Error fetching services:', sError);
    } else {
        console.log('Services:', JSON.stringify(services, null, 2));
    }
}

debugData();
