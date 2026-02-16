
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SHADOW_DOMAIN = '@genesoft.internal';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function syncProfiles() {
  console.log("Syncing profiles emails with auth users...");
  
  // Get all users from auth to map correct emails
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError || !users) {
      console.error("Failed to list auth users", authError);
      return;
  }
  
  for (const user of users) {
      if (user.email) {
          console.log(`Checking ${user.email}...`);
          // Update profile to match auth email
          const { error: updateError } = await supabase
              .from('profiles')
              .update({ email: user.email })
              .eq('id', user.id);
              
          if (updateError) console.error(`Failed to update profile for ${user.email}:`, updateError);
          else console.log(`Synced profile for ${user.email}`);
      }
  }
}

syncProfiles();
