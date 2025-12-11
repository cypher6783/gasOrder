import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Temporary endpoint to create admin user
// DELETE THIS AFTER CREATING ADMIN!
router.post('/create-admin-temp', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin already exists',
        email: existingAdmin.email,
      });
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

    res.json({
      success: true,
      message: 'Admin created successfully!',
      credentials: {
        email: admin.email,
        password: 'admin123',
      },
      warning: 'Please change password after first login and DELETE this endpoint!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
