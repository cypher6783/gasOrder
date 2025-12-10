import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

interface VendorFilters {
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  search?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'createdAt' | 'businessName';
  sortOrder?: 'asc' | 'desc';
}

export const vendorService = {
  // Get all vendors with filters
  // Get all vendors with filters
  async getVendors(filters: VendorFilters = {}, options: PaginationOptions = {}) {
    const {
      status = 'VERIFIED',
      search,
      latitude,
      longitude,
      radiusKm = 10,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'rating',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Standard where clause for status and search
    const where: any = { status };
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If coordinates are provided, perform geospatial filtering
    if (latitude !== undefined && longitude !== undefined) {
      // 1. Get IDs within radius sorted by distance
      // Using PostGIS ST_DWithin (radius in meters) and ST_DistanceSphere (more accurate)
      const radiusMeters = radiusKm * 1000;
      
      const rawVendors = await prisma.$queryRaw`
        SELECT id, 
               ST_Distance(
                 ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography, 
                 ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
               ) as distance
        FROM "Vendor"
        WHERE "status"::text = ${status}::text
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY distance ASC
        OFFSET ${skip} LIMIT ${limit}
      `;

      // 2. Count Total (Approximate or exact via count query)
      const rawCount = await prisma.$queryRaw`
        SELECT COUNT(*)::int as count 
        FROM "Vendor"
        WHERE "status"::text = ${status}::text
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
      `;
      // @ts-ignore
      const total = rawCount[0]?.count || 0;

      // 3. Fetch full objects for the page IDs
      // @ts-ignore
      const vendorIds = rawVendors.map((v: any) => v.id);
      
      const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds } },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              products: true,
              reviews: true,
            },
          },
        },
      });

      // 4. Sort JS objects to match Distance order from SQL
      // Map is faster than finding for each
      const vendorMap = new Map(vendors.map(v => [v.id, v]));
      const sortedVendors = vendorIds
        .map((id: string) => vendorMap.get(id))
        .filter((v: any) => v !== undefined);

       return {
        vendors: sortedVendors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

    } else {
      // Standard Prisma filtering
      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            _count: {
              select: {
                products: true,
                reviews: true,
                },
            },
          },
        }),
        prisma.vendor.count({ where }),
      ]);

      return {
        vendors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  },

  // Get single vendor by ID
  async getVendorById(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        products: {
          where: { isActive: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          take: 5,
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
        },
        _count: {
          select: {
            products: true,
            reviews: true,
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    return vendor;
  },

  // Get vendor by user ID
  async getVendorByUserId(userId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            products: true,
            reviews: true,
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new AppError('Vendor profile not found', 404);
    }

    return vendor;
  },

  // Update vendor profile
  async updateVendor(id: string, userId: string, data: Partial<{
    businessName: string;
    businessAddress: string;
    latitude: number;
    longitude: number;
    deliveryFee: number;
  }>) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    if (vendor.userId !== userId) {
      throw new AppError('You can only update your own vendor profile', 403);
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return updated;
  },

  // Create vendor profile
  async createVendorProfile(userId: string, data: {
    businessName: string;
    businessAddress: string;
    latitude: number;
    longitude: number;
    cacDocument?: string;
    idDocument?: string;
    proofOfAddress?: string;
  }) {
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (existingVendor) {
      throw new AppError('Vendor profile already exists', 400);
    }

    const vendor = await prisma.vendor.create({
      data: {
        userId,
        ...data,
        status: 'PENDING', // Default to pending
        rating: 0,
        totalReviews: 0,
      },
    });

    return vendor;
  },

  // Check vendor availability (for delivery)
  async checkAvailability(vendorId: string, customerLatitude: number, customerLongitude: number) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }, // Fix potential bug: was 'id' which is undefined
    });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    if (vendor.status !== 'VERIFIED') {
      return {
        available: false,
        reason: 'Vendor is not verified',
      };
    }

    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (customerLatitude - vendor.latitude) * Math.PI / 180;
    const dLon = (customerLongitude - vendor.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(vendor.latitude * Math.PI / 180) *
      Math.cos(customerLatitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    const maxDeliveryDistance = 20; // km

    return {
      available: distance <= maxDeliveryDistance,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      estimatedDeliveryTime: Math.ceil(distance * 3), // Rough estimate: 3 min per km
    };
  },

  // Get vendor stats
  async getVendorStats(userId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new AppError('Vendor profile not found', 404);
    }

    // Get total orders count
    const totalOrders = await prisma.order.count({
      where: { vendorId: vendor.id },
    });

    // Get total sales (sum of total for delivered orders with completed payment)
    const salesAggregate = await prisma.order.aggregate({
      where: {
        vendorId: vendor.id,
        status: 'DELIVERED',
        paymentStatus: 'COMPLETED',
      },
      _sum: {
        total: true,
      },
    });

    const activeProducts = await prisma.product.count({
      where: { vendorId: vendor.id, isActive: true },
    });

    return {
      totalOrders,
      totalSales: salesAggregate._sum.total || 0,
      activeProducts,
      rating: vendor.rating,
    };
  },
};
