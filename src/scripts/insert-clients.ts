
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function insertClients() {
  const clients = [
    { name: 'TechCorp', logo_url: 'https://placehold.co/200x80/white/black?text=TechCorp' },
    { name: 'Innovate', logo_url: 'https://placehold.co/200x80/white/black?text=Innovate' },
    { name: 'FutureSystems', logo_url: 'https://placehold.co/200x80/white/black?text=Future' },
    { name: 'GlobalNet', logo_url: 'https://placehold.co/200x80/white/black?text=GlobalNet' },
    { name: 'AlphaWave', logo_url: 'https://placehold.co/200x80/white/black?text=AlphaWave' },
    { name: 'Nebula', logo_url: 'https://placehold.co/200x80/white/black?text=Nebula' },
  ];

  const { error } = await supabase.from('clients').insert(clients);
  
  if (error) {
    console.error("Error inserting clients:", error.message);
  } else {
    console.log("✅ Inserted 6 dummy clients.");
  }
}

insertClients();
