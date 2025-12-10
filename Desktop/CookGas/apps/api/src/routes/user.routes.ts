import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Protected routes
router.use(authenticate);

router.get('/profile', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
        customer: {
            include: {
                addresses: true
            }
        },
        vendor: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Remove passwordHash
  const { passwordHash, ...safeUser } = user;

  res.json({
    status: 'success',
    data: safeUser
  });
}));

router.put('/profile', asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, address } = req.body;

  // 1. Update basic user info
  const updatedUser = await prisma.user.update({
    where: { id: req.user!.userId },
    data: {
      firstName,
      lastName,
      phone,
    },
    include: {
        customer: {
            include: {
                addresses: true
            }
        },
        vendor: true
    }
  });

  // 2. If address provided, add it to customer profile
  if (address && updatedUser.customer) {
      const { street, city, state, country = 'Nigeria', isDefault = false } = address;
      
      // If setting as default, unset others first if needed (omitted for simplicity, can add later)
      
      await prisma.address.create({
          data: {
              customerId: updatedUser.customer.id,
              street,
              city,
              state,
              label: 'Delivery Address', // Default label
              latitude: 6.5244, // Default to Lagos coords
              longitude: 3.3792,
              isDefault
          }
      });

      // Refetch to get updated addresses
      const refetchedUser = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          include: {
              customer: {
                  include: {
                      addresses: true
                  }
              },
              vendor: true
          }
      });
      
      if (refetchedUser) {
          const { passwordHash, ...safeUser } = refetchedUser;
          res.json({
              status: 'success',
              data: safeUser
          });
          return;
      }
  }

  const { passwordHash, ...safeUser } = updatedUser;

  res.json({
    status: 'success',
    data: safeUser,
  });
}));

export default router;
