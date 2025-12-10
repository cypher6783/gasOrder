const { Client } = require('pg');

async function fixDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Enable PostGIS extension
    console.log('Enabling PostGIS extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension enabled');

    // Check if migrations table exists and delete failed migration
    console.log('Checking for failed migrations...');
    const tableCheck = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_prisma_migrations')"
    );
    
    if (tableCheck.rows[0].exists) {
      const result = await client.query(
        "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '20251208003908_init' AND finished_at IS NULL"
      );
      console.log(`✅ Deleted ${result.rowCount} failed migration record(s)`);
    } else {
      console.log('ℹ️  No migrations table found - database is fresh');
    }

    console.log('\n✅ Database fixed! Now redeploy your backend service in Railway.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixDatabase();
