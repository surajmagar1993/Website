/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:SURAJmagar%409890@db.lohpoefucnlndqhmzhfv.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully.');
    
    const queries = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMP WITH TIME ZONE;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS replacement_date TIMESTAMP WITH TIME ZONE;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS return_date TIMESTAMP WITH TIME ZONE;`
    ];

    for (const query of queries) {
        await client.query(query);
        console.log(`Executed: ${query}`);
    }
    
    console.log('Migration completed: Date columns added successfully.');
  } catch (e) {
    console.error('Error executing migration:', e);
  } finally {
    await client.end();
  }
}

run();
