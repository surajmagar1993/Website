import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debugData() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
        return;
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('Fetching case studies...');
    const { data: caseStudies, error: csError } = await supabase
        .from('case_studies')
        .select('*')
        .order('display_order', { ascending: true });
        
    if (csError) {
        console.error('Error fetching case studies:', csError);
    } else {
        console.log('Case Studies Count:', caseStudies ? caseStudies.length : 0);
        console.log('Case Studies:', JSON.stringify(caseStudies, null, 2));
    }
}

debugData();
