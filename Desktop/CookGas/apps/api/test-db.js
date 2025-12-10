const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    await prisma.$connect();
    console.log('✓ Successfully connected to the database!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
