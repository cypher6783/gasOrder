import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

const GAS_PRODUCT_NAME = 'Cooking Gas';
const GAS_PRODUCT_UNIT = 'kg';

export const gasService = {
  // Get vendor's cooking gas product
  async getGasProduct(vendorId: string) {
    const product = await prisma.product.findFirst({
      where: {
        vendorId,
        name: GAS_PRODUCT_NAME,
      },
    });
    return product;
  },

  // Update or Create cooking gas product
  async upsertGasProduct(vendorId: string, pricePerKg: number, inStock: boolean) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    // Try to find existing gas product
    const existing = await prisma.product.findFirst({
      where: {
        vendorId,
        name: GAS_PRODUCT_NAME,
      },
    });

    if (existing) {
        return prisma.product.update({
            where: { id: existing.id },
            data: {
                price: pricePerKg,
                isActive: inStock,
                unit: GAS_PRODUCT_UNIT, // Ensure consistent unit
            },
        });
    }

    // Create new if not exists
    return prisma.product.create({
        data: {
            vendorId,
            name: GAS_PRODUCT_NAME,
            description: 'Standard Cooking Gas per KG',
            price: pricePerKg,
            stock: 999999, // Treat as effectively unlimited, managed by inStock toggle
            unit: GAS_PRODUCT_UNIT,
            isActive: inStock,
        },
    });
  }
};
