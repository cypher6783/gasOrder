import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

interface ProductFilters {
  vendorId?: string;
  isActive?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  // Get all products with filters and pagination
  async getProducts(filters: ProductFilters = {}, options: PaginationOptions = {}) {
    const {
      vendorId,
      isActive,
      search,
      minPrice,
      maxPrice,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vendor: {
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
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single product by ID
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
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
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  },

  // Create new product (vendor only)
  async createProduct(vendorId: string, data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    unit: string;
    imageUrl?: string;
  }) {
    // Verify vendor exists and is verified
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    if (vendor.status !== 'VERIFIED') {
      throw new AppError('Only verified vendors can create products', 403);
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        vendorId,
      },
      include: {
        vendor: {
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
    });

    return product;
  },

  // Update product (vendor only)
  async updateProduct(id: string, vendorId: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    unit: string;
    imageUrl: string;
    isActive: boolean;
  }>) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.vendorId !== vendorId) {
      throw new AppError('You can only update your own products', 403);
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        vendor: {
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
    });

    return updated;
  },

  // Delete product (vendor only)
  async deleteProduct(id: string, vendorId: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.vendorId !== vendorId) {
      throw new AppError('You can only delete your own products', 403);
    }

    await prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  },

  // Get products by vendor
  async getVendorProducts(vendorId: string, options: PaginationOptions = {}, isActive?: boolean) {
    return this.getProducts({ vendorId, isActive }, options);
  },
};
