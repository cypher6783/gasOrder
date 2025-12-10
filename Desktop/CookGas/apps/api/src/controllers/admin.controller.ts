import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { vendorService } from '../services/vendor.service';

const prisma = new PrismaClient();

export const adminController = {
  // Get dashboard statistics
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalVendors,
        pendingVendors,
        verifiedVendors,
        totalCustomers,
        totalOrders,
        totalProducts,
      ] = await Promise.all([
        prisma.vendor.count(),
        prisma.vendor.count({ where: { status: 'PENDING' } }),
        prisma.vendor.count({ where: { status: 'VERIFIED' } }),
        prisma.customer.count(),
        prisma.order.count(),
        prisma.product.count({ where: { isActive: true } }),
      ]);

      res.json({
        status: 'success',
        data: {
          vendors: {
            total: totalVendors,
            pending: pendingVendors,
            verified: verifiedVendors,
          },
          customers: totalCustomers,
          orders: totalOrders,
          products: totalProducts,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all vendors with filters
  async getAllVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit, sortBy, sortOrder } = req.query;

      const result = await vendorService.getVendors(
        {
          status: status as any,
          search: search as string,
        },
        {
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          sortBy: sortBy as any,
          sortOrder: sortOrder as any,
        }
      );

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get pending vendors
  async getPendingVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;

      const result = await vendorService.getVendors(
        { status: 'PENDING' },
        {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      );

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Approve vendor
  async approveVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
      });

      if (!vendor) {
        return res.status(404).json({
          status: 'error',
          message: 'Vendor not found',
        });
      }

      const updated = await prisma.vendor.update({
        where: { id },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
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

      res.json({
        status: 'success',
        message: 'Vendor approved successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Reject vendor
  async rejectVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
      });

      if (!vendor) {
        return res.status(404).json({
          status: 'error',
          message: 'Vendor not found',
        });
      }

      const updated = await prisma.vendor.update({
        where: { id },
        data: {
          status: 'REJECTED',
        },
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

      // TODO: Send email notification to vendor with rejection reason

      res.json({
        status: 'success',
        message: 'Vendor rejected',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Suspend vendor
  async suspendVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
      });

      if (!vendor) {
        return res.status(404).json({
          status: 'error',
          message: 'Vendor not found',
        });
      }

      const updated = await prisma.vendor.update({
        where: { id },
        data: {
          status: 'SUSPENDED',
        },
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

      // TODO: Send email notification to vendor

      res.json({
        status: 'success',
        message: 'Vendor suspended',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all customers with pagination
  async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;
      const pageNum = page ? parseInt(page as string) : 1;
      const limitNum = limit ? parseInt(limit as string) : 20;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      
      if (search) {
        where.user = {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } },
            { phone: { contains: search as string, mode: 'insensitive' } },
          ],
        };
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { user: { createdAt: 'desc' } },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isActive: true,
                emailVerified: true,
                phoneVerified: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                orders: true,
                addresses: true,
                reviews: true,
              },
            },
          },
        }),
        prisma.customer.count({ where }),
      ]);

      res.json({
        status: 'success',
        data: {
          customers,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single customer by ID
  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isActive: true,
              emailVerified: true,
              phoneVerified: true,
              createdAt: true,
            },
          },
          addresses: true,
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              vendor: {
                select: {
                  businessName: true,
                },
              },
            },
          },
          reviews: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              orders: true,
              addresses: true,
              reviews: true,
            },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({
          status: 'error',
          message: 'Customer not found',
        });
      }

      res.json({
        status: 'success',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },
};

