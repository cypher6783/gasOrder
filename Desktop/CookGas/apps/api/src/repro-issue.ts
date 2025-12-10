
// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { generateAccessToken } from './utils/jwt';
import { gasService } from './services/gas.service';

const prisma = new PrismaClient();

async function reproduce() {
  console.log('--- STARTING REPRODUCTION ---');

  // 1. Find the known vendor user
  const vendor = await prisma.vendor.findFirst({
      where: { status: 'VERIFIED' },
      include: { user: true }
  });

  if (!vendor) {
      console.error('No verified vendor found!');
      return;
  }

  console.log(`1. Found Verified Vendor: ${vendor.businessName} (User Email: ${vendor.user.email})`);

  // 2. Generate Token (simulate Login)
  try {
      const token = generateAccessToken({
          userId: vendor.user.id,
          email: vendor.user.email,
          role: 'VENDOR'
      });
      console.log('2. Generated Token for User ID:', vendor.user.id);
  } catch (e) {
      console.error('Failed to generate token:', e);
  }

  // 3. Simulate GET /gas/settings Logic
  // Step A: Find vendor from User ID (Middleware/Route logic)
  const foundVendor = await prisma.vendor.findUnique({
      where: { userId: vendor.user.id }
  });

  if (!foundVendor) {
      console.error('3A. FAILED: Could not find vendor by User ID');
      return;
  }
  console.log('3A. success: Found Vendor by User ID:', foundVendor.id);

  // Step B: Get Gas Product
  const product = await gasService.getGasProduct(foundVendor.id);
  
  if (!product) {
      console.error('3B. FAILED: gasService.getGasProduct returned null');
      // check why
      const allProducts = await prisma.product.findMany({ where: { vendorId: foundVendor.id } });
      console.log('   Debug: Vendor has these products:', allProducts.map(p => p.name));
  } else {
      console.log('3B. SUCCESS: Found Gas Product:', product.name, '| Price:', product.price, '| Stock:', product.stock);
  }

  console.log('--- END REPRODUCTION ---');
}

reproduce()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
