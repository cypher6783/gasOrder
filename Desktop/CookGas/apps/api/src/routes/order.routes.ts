import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { orderService } from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();
const router = Router();

// Protected routes
router.use(authenticate);

// Create order (customer only)
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { vendorId, addressId, items } = req.body;

  if (!vendorId || !addressId || !items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Missing required fields', 400);
  }

  // Get customer ID from authenticated user
  const customer = await prisma.customer.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!customer) {
    throw new AppError('Customer profile not found', 404);
  }

  const order = await orderService.createOrder({
    customerId: customer.id,
    vendorId,
    addressId,
    items,
  });

  res.status(201).json({
    status: 'success',
    data: order,
  });
}));

// Get orders (customer or vendor)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const user = req.user!;

  let result;

  if (user.role === 'CUSTOMER') {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
    });

    if (!customer) {
      throw new AppError('Customer profile not found', 404);
    }

    result = await orderService.getCustomerOrders(
      customer.id,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
  } else if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.userId },
    });

    if (!vendor) {
      throw new AppError('Vendor profile not found', 404);
    }

    result = await orderService.getVendorOrders(
      vendor.id,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
  } else {
    throw new AppError('Invalid user role', 403);
  }

  res.json({
    status: 'success',
    data: result,
  });
}));

// Get single order
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);

  // Verify user has access to this order
  const user = req.user!;
  
  if (user.role === 'CUSTOMER') {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
    });

    if (order.customerId !== customer?.id) {
      throw new AppError('Access denied', 403);
    }
  } else if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.userId },
    });

    if (order.vendorId !== vendor?.id) {
      throw new AppError('Access denied', 403);
    }
  }

  res.json({
    status: 'success',
    data: order,
  });
}));

// Update order status (vendor only)
router.patch('/:id/status', authorize('VENDOR'), asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  const validStatuses = ['CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const order = await orderService.updateOrderStatus(req.params.id, vendor.id, status);

  res.json({
    status: 'success',
    data: order,
  });
}));

// Cancel order (customer only)
router.post('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!customer) {
    throw new AppError('Customer profile not found', 404);
  }

  const order = await orderService.cancelOrder(req.params.id, customer.id);

  res.json({
    status: 'success',
    data: order,
  });
}));

export default router;
