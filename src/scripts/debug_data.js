const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debugData() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('Fetching case studies...');
    const { data: caseStudies, error: csError } = await supabase
        .from('case_studies')
        .select('*')
        .order('display_order', { ascending: true });
        
    if (csError) {
        console.error('Error fetching case studies:', csError);
    } else {
        console.log('Case Studies Count:', caseStudies.length);
        console.log('Case Studies:', JSON.stringify(caseStudies, null, 2));
    }
}

debugData();
