
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkRoles() {
  console.log("Checking user roles...");

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role, full_name');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log("No profiles found.");
    return;
  }

  console.table(profiles);
}

checkRoles();
