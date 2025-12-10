const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'jupitra_db',
  user: 'postgres',
  password: 'asphalt6',
});

async function main() {
  try {
    console.log('Testing PostgreSQL connection with correct credentials...');
    console.log('Host: localhost:5432');
    console.log('Database: jupitra_db');
    console.log('User: postgres');
    
    await client.connect();
    console.log('✓ Successfully connected to the database!');
    
    const res = await client.query('SELECT version()');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

main();
