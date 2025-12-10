import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

interface CreateOrderData {
  customerId: string;
  vendorId: string;
  addressId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const orderService = {
  // Create a new order
  async createOrder(data: CreateOrderData) {
    const { customerId, vendorId, addressId, items } = data;

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Verify vendor exists and is verified
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    if (vendor.status !== 'VERIFIED') {
      throw new AppError('Vendor is not verified', 400);
    }

    // Verify address belongs to customer
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        customerId,
      },
    });

    if (!address) {
      throw new AppError('Address not found or does not belong to customer', 404);
    }

    // Fetch all products and verify stock
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        vendorId,
        isActive: true,
      },
    });

    if (products.length !== items.length) {
      throw new AppError('Some products not found or not available', 400);
    }

    // Calculate totals and verify stock
    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      };
    });

    // Calculate delivery fee (dynamic from vendor)
    const deliveryFee = vendor.deliveryFee; 
    const total = subtotal + deliveryFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          vendorId,
          addressId,
          subtotal,
          deliveryFee,
          total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          vendor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  },

  // Get orders for a customer
  async getCustomerOrders(customerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
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
          address: true,
        },
      }),
      prisma.order.count({ where: { customerId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get orders for a vendor
  async getVendorOrders(vendorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { vendorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
          address: true,
        },
      }),
      prisma.order.count({ where: { vendorId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single order
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        address: true,
        payment: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  },

  // Update order status (vendor only)
  async updateOrderStatus(
    orderId: string,
    vendorId: string,
    status: 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.vendorId !== vendorId) {
      throw new AppError('You can only update your own orders', 403);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
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
        address: true,
      },
    });

    // Trigger Escrow Release if Delivered
    if (status === 'DELIVERED') {
       try {
         const { paymentService } = await import('./payment.service');
         // We don't await this to avoid blocking the response, or we should? 
         // Ideally releaseEscrow should be fast or queued. Let's await it to ensure it works.
         await paymentService.releaseEscrow(orderId);
       } catch (error) {
         console.error(`Failed to release escrow for order ${orderId}:`, error);
         // Don't fail the request, but log it. Admin can fix later.
       }
    }

    return updated;

    return updated;
  },

  // Cancel order (customer only, before confirmation)
  async cancelOrder(orderId: string, customerId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customerId !== customerId) {
      throw new AppError('You can only cancel your own orders', 403);
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Order can only be cancelled when pending', 400);
    }

    // Restore product stock and cancel order in transaction
    const cancelled = await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Cancel order
      return await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
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
          address: true,
        },
      });
    });

    return cancelled;
  },
};
