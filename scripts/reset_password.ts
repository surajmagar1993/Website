
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
  console.log('Resetting password...');

  const { data: { user }, error } = await supabase.auth.admin.updateUserById(
    'f9cccb85-cec1-4060-aa39-1f8eba48ff73', // ID from previous script
    { password: 'password123' }
  );

  if (error) {
    console.error('Error resetting password:', error);
  } else {
    console.log('Password reset successful for:', user?.email);
  }
}

resetPassword();
