const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

if (!command) {
  console.log(`
Usage:
  node src/scripts/manage-db.js <command> [args]

Commands:
  create-bucket <name> [public?]   Create a storage bucket (requires SERVICE_ROLE_KEY)
  run-sql <file>                   Run a SQL file (requires DATABASE_URL)
  list-buckets                     List all storage buckets
`);
  process.exit(0);
}

async function main() {
  switch (command) {
    case 'create-bucket':
        await createBucket(arg1, arg2 === 'true');
        break;
    case 'list-buckets':
        await listBuckets();
        break;
    case 'run-sql':
        await runSql(arg1);
        break;
    default:
        console.error('Unknown command:', command);
        process.exit(1);
  }
}

async function createBucket(name, isPublic = true) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
        return;
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log(`Creating bucket '${name}' (public: ${isPublic})...`);
    
    const { error } = await supabase.storage.createBucket(name, {
        public: isPublic,
        fileSizeLimit: 10485760, // 10MB
    });

    if (error) {
        console.error('❌ Error creating bucket:', error.message);
    } else {
        console.log(`✅ Bucket '${name}' created successfully.`);
    }
}

async function listBuckets() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
        return;
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('❌ Error listing buckets:', error.message);
    } else {
        console.log('Buckets:', data.map(b => `${b.name} (public: ${b.public})`));
    }
}

async function runSql(filePath) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
        return;
    }

    if (!filePath) {
        console.error('Error: Please provide a SQL file path.');
        return;
    }

    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        console.error('Error: File not found:', fullPath);
        return;
    }

    const sqlContent = fs.readFileSync(fullPath, 'utf8');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log(`Executing SQL from ${path.basename(filePath)} via RPC...`);
    
    // Call the exec_sql function we created
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });

    if (error) {
        console.error('❌ SQL Execution Error:', error.message);
        console.error('   Hint: Did you run "setup_rpc.sql" in Supabase SQL Editor?');
    } else {
        console.log(`✅ SQL executed successfully.`);
        if (data) {
            console.log('Results:', JSON.stringify(data, null, 2));
        }
    }
}

main();
