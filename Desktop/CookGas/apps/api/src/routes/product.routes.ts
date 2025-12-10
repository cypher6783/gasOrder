import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { productService } from '../services/product.service';
import { gasService } from '../services/gas.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();
const router = Router();

// Public routes - Get all products
router.get('/', asyncHandler(async (req, res) => {
  const {
    vendorId,
    search,
    minPrice,
    maxPrice,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query;

  const result = await productService.getProducts(
    {
      vendorId: vendorId as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
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

// Get my products (Must be before /:id)
router.get('/my-products', authenticate, authorize('VENDOR'), asyncHandler(async (req, res) => {
  const { page, limit, search, isActive } = req.query;

  // Get vendor ID from authenticated user
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const result = await productService.getVendorProducts(
    vendor.id,
    {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    },
    isActive !== undefined ? isActive === 'true' : undefined
  );

  res.json({
    status: 'success',
    data: result,
  });
}));

// Gas Management Routes (Must be defined before /:id to avoid shadowing)
router.get('/gas/settings', authenticate, authorize('VENDOR'), asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const product = await gasService.getGasProduct(vendor.id);

  const responseData = product ? { ...product, deliveryFee: vendor.deliveryFee } : { deliveryFee: vendor.deliveryFee };

  res.json({
    status: 'success',
    data: responseData,
  });
}));

// Public route - Get single product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.json({
    status: 'success',
    data: product,
  });
}));

// Protected vendor routes
router.use(authenticate, authorize('VENDOR'));

router.post('/gas/settings', asyncHandler(async (req, res) => {
  const { price, inStock, deliveryFee } = req.body;
  
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  // Update delivery fee if provided
  if (deliveryFee !== undefined) {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { deliveryFee: parseFloat(deliveryFee) },
    });
  }

  const product = await gasService.upsertGasProduct(
    vendor.id,
    parseFloat(price),
    Boolean(inStock)
  );

  res.json({
    status: 'success',
    data: { ...product, deliveryFee: parseFloat(deliveryFee || vendor.deliveryFee) },
  });
}));



// Create product
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, price, stock, unit, imageUrl } = req.body;

  // Get vendor ID from authenticated user
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const product = await productService.createProduct(vendor.id, {
    name,
    description,
    price: parseFloat(price),
    stock: parseInt(stock),
    unit,
    imageUrl,
  });

  res.status(201).json({
    status: 'success',
    data: product,
  });
}));

// Update product
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, description, price, stock, unit, imageUrl, isActive } = req.body;

  // Get vendor ID from authenticated user
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const product = await productService.updateProduct(req.params.id, vendor.id, {
    name,
    description,
    price: price ? parseFloat(price) : undefined,
    stock: stock ? parseInt(stock) : undefined,
    unit,
    imageUrl,
    isActive: isActive !== undefined ? Boolean(isActive) : undefined,
  });

  res.json({
    status: 'success',
    data: product,
  });
}));

// Delete product
router.delete('/:id', asyncHandler(async (req, res) => {
  // Get vendor ID from authenticated user
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const result = await productService.deleteProduct(req.params.id, vendor.id);

  res.json({
    status: 'success',
    data: result,
  });
}));

export default router;
