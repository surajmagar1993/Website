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
    
    const res = await client.query('SELECT slug, title, icon_name FROM services ORDER BY display_order ASC;');
    console.table(res.rows);
    
  } catch (e) {
    console.error('Error executing query:', e);
  } finally {
    await client.end();
  }
}

run();
