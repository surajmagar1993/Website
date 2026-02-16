/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initStorage() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }

  const bucketExists = buckets.some(b => b.name === 'tickets');
  
  if (!bucketExists) {
    console.log("Creating 'tickets' bucket...");
    const { error } = await supabase.storage.createBucket('tickets', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error("Error creating bucket:", error);
    } else {
      console.log("'tickets' bucket created successfully.");
      
      // Add RLS policy for the bucket
      // Note: This usually needs SQL, but for now we set public: true
    }
  } else {
    console.log("'tickets' bucket already exists.");
  }
}

initStorage();
