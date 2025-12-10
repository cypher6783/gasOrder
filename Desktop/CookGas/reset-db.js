const { Client } = require('pg');

async function resetMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Enable PostGIS
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS enabled');

    // Delete ALL migration records (nuclear option)
    console.log('Deleting all migration records...');
    const deleteResult = await client.query("DELETE FROM \"_prisma_migrations\"");
    console.log(`✅ Deleted ${deleteResult.rowCount} migration record(s)`);

    // Drop all tables to start fresh
    console.log('Dropping all tables for fresh start...');
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      CREATE EXTENSION IF NOT EXISTS postgis;
    `);
    console.log('✅ Database reset complete');

    console.log('\n✅ Database is now fresh! Redeploy your backend.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

resetMigrations();
