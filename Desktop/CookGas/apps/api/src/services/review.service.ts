import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const reviewService = {
  // Create a new review
  async createReview(customerId: string, vendorId: string, data: { rating: number; comment?: string }) {
    // 1. Verify that the customer has a delivered order from this vendor
    const hasDeliveredOrder = await prisma.order.findFirst({
      where: {
        customerId,
        vendorId,
        status: 'DELIVERED',
      },
    });

    if (!hasDeliveredOrder) {
      throw new AppError('You can only review vendors you have received an order from.', 403);
    }

    // 2. Determine if user already reviewed this vendor? 
    // Usually systems allow one review per order or one per vendor. 
    // Schema doesn't limit it. For now, let's allow multiple reviews (e.g. per experience), or maybe just create.
    
    // Transaction: Create review and update vendor stats
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          customerId,
          vendorId,
          rating: data.rating,
          comment: data.comment,
        },
      });

      // Recalculate average rating
      const aggregations = await tx.review.aggregate({
        where: { vendorId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.vendor.update({
        where: { id: vendorId },
        data: {
          rating: aggregations._avg.rating || 0,
          totalReviews: aggregations._count.rating || 0,
        },
      });

      return newReview;
    });

    return review;
  },

  // Get reviews for a vendor
  async getVendorReviews(vendorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { vendorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.count({ where: { vendorId } }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
