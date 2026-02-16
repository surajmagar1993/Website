
import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

// Disable SSL for local, or enable for production if needed. 
// Supabase transaction pooler (6543) requires SSL, but direct (5432) might too.
// 'require' is usually safe for Supabase.
const sql = postgres(dbUrl, {
  ssl: 'require',
  max: 1
});

async function run() {
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250217140000_fix_logs_fk.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log("Applying migration:", migrationPath);
  
  try {
    // split by semicolon to run statements? postgres.js usually handles multiple statements in one `file` call or just passing string?
    // postgres.js `sql` tag handles simple queries. For multiple statements, `sql.file` or `sql` with simple string might work but parameterized is default.
    // Let's use `unsafe` to run the raw SQL string.
    
    await sql.unsafe(migrationSql);
    console.log("✅ Migration applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await sql.end();
  }
}

run();
