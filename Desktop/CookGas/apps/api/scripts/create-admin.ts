import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      console.log('Email:', existingAdmin.email);
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@jupitra.com',
        phone: '+2348000000000',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log('');
    console.log('Admin Credentials:');
    console.log('==================');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
