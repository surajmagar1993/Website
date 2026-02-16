
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role to bypass RLS for initial test, or anon to test RLS

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log("Testing logs query...");
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .limit(5);

  if (error) {
    console.error("Query failed:", error);
  } else {
    console.log("Query success! Data length:", data.length);
    console.log("First item:", data[0]);
  }
}

testQuery();
