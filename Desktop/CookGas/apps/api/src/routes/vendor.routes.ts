import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { vendorService } from '../services/vendor.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();
const router = Router();

// Public routes - Get all vendors
router.get('/', asyncHandler(async (req: Request, res: Response) => {
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
}));

// Public route - Get single vendor
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const vendor = await vendorService.getVendorById(req.params.id);

  res.json({
    status: 'success',
    data: vendor,
  });
}));

// Public route - Get vendor products
router.get('/:id/products', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const { productService } = await import('../services/product.service');

  const result = await productService.getVendorProducts(
    req.params.id,
    {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    }
  );

  res.json({
    status: 'success',
    data: result,
  });
}));

// Public route - Check vendor availability
router.post('/:id/check-availability', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    throw new AppError('Latitude and longitude are required', 400);
  }

  const result = await vendorService.checkAvailability(
    req.params.id,
    parseFloat(latitude),
    parseFloat(longitude)
  );

  res.json({
    status: 'success',
    data: result,
  });
}));

// Customer: Rate a vendor
router.post('/:id/reviews', authenticate, authorize('CUSTOMER'), asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const { reviewService } = await import('../services/review.service');
  
  // We need the customer ID, which is different from userId. 
  // We need to fetch the customer profile first or assume reviewService handles userId lookup?
  // reviewService.createReview takes customerId.
  // Let's look up customer ID from userId here.
  
  const customer = await prisma.customer.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!customer) {
    throw new AppError('Customer profile not found', 404);
  }

  const review = await reviewService.createReview(customer.id, req.params.id, {
    rating: parseFloat(rating),
    comment,
  });

  res.status(201).json({
    status: 'success',
    data: review,
  });
}));

// Protected vendor routes
router.use(authenticate, authorize('VENDOR'));

// Create vendor profile
router.post('/me/profile', asyncHandler(async (req: Request, res: Response) => {
  const { businessName, businessAddress, latitude, longitude, cacDocument, idDocument, proofOfAddress } = req.body;

  const vendor = await vendorService.createVendorProfile(req.user!.userId, {
    businessName,
    businessAddress,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    cacDocument,
    idDocument,
    proofOfAddress,
  });

  res.status(201).json({
    status: 'success',
    data: vendor,
  });
}));

// Get own vendor profile
router.get('/me/profile', asyncHandler(async (req: Request, res: Response) => {
  const vendor = await vendorService.getVendorByUserId(req.user!.userId);

  res.json({
    status: 'success',
    data: vendor,
  });
}));

// Get vendor stats
router.get('/me/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await vendorService.getVendorStats(req.user!.userId);

  res.json({
    status: 'success',
    data: stats,
  });
}));

// Update vendor profile
router.put('/me/profile', asyncHandler(async (req: Request, res: Response) => {
  const { businessName, businessAddress, latitude, longitude, deliveryFee } = req.body;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const updated = await vendorService.updateVendor(vendor.id, req.user!.userId, {
    businessName,
    businessAddress,
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
    deliveryFee: deliveryFee ? parseFloat(deliveryFee) : undefined,
  });

  res.json({
    status: 'success',
    data: updated,
  });
}));

export default router;
