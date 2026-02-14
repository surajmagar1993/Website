import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName: string) {
  console.log(`Checking table '${tableName}'...`);
  const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error(`❌ Error accessing '${tableName}':`, error.message);
    if (error.code === '42P01') {
        console.error(`   -> The table '${tableName}' does not exist.`);
    }
    return false;
  } else {
    console.log(`✅ Table '${tableName}' exists and is accessible.`);
    return true;
  }
}

async function verify() {
  console.log("Verifying Database Setup...");
  
  const tables = ['clients', 'services', 'case_studies', 'site_settings'];
  let allGood = true;

  for (const table of tables) {
    const exists = await checkTable(table);
    if (!exists) allGood = false;
  }

  if (allGood) {
    console.log("\n🎉 All required tables are set up correctly!");
  } else {
    console.log("\n⚠️ Some tables are missing or inaccessible. Please run the SQL in DB_SETUP.md.");
  }
}

verify();
