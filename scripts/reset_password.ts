
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lohpoefucnlndqhmzhfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaHBvZWZ1Y25sbmRxaG16aGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczNTA4NCwiZXhwIjoyMDg2MzExMDg0fQ.LzDbeFhT0xjy02m_mlXOOaQmV4XyB-7snkf2wJeAtKw';

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
