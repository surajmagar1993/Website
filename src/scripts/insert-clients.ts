
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lohpoefucnlndqhmzhfv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaHBvZWZ1Y25sbmRxaG16aGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzUwODQsImV4cCI6MjA4NjMxMTA4NH0.w3gmCu2S_upPFZgcDHYbgwOmy0WQLIDslxEvx4VV82Y'
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
