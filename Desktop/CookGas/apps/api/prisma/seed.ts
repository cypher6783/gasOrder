import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create vendor users
  const vendorPassword = await bcrypt.hash('vendor123', 10);
  
  const vendor1User = await prisma.user.create({
    data: {
      email: 'gasplus@example.com',
      phone: '+2348012345671',
      passwordHash: vendorPassword,
      firstName: 'Gas',
      lastName: 'Plus',
      role: 'VENDOR',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const vendor2User = await prisma.user.create({
    data: {
      email: 'quickgas@example.com',
      phone: '+2348012345672',
      passwordHash: vendorPassword,
      firstName: 'Quick',
      lastName: 'Gas',
      role: 'VENDOR',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const vendor3User = await prisma.user.create({
    data: {
      email: 'reliablegas@example.com',
      phone: '+2348012345673',
      passwordHash: vendorPassword,
      firstName: 'Reliable',
      lastName: 'Gas',
      role: 'VENDOR',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log('✅ Created vendor users');

  // Create vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendor1User.id,
      businessName: 'GasPlus Energy',
      businessAddress: '123 Lagos Street, Ikeja, Lagos',
      latitude: 6.5964,
      longitude: 3.3486,
      status: 'VERIFIED',
      rating: 4.8,
      totalReviews: 156,
      cacDocument: 'cac_gasplus.pdf',
      idDocument: 'id_gasplus.pdf',
      proofOfAddress: 'address_gasplus.pdf',
      verifiedAt: new Date(),
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendor2User.id,
      businessName: 'QuickGas Delivery',
      businessAddress: '456 Victoria Island, Lagos',
      latitude: 6.4281,
      longitude: 3.4219,
      status: 'VERIFIED',
      rating: 4.5,
      totalReviews: 89,
      cacDocument: 'cac_quickgas.pdf',
      idDocument: 'id_quickgas.pdf',
      proofOfAddress: 'address_quickgas.pdf',
      verifiedAt: new Date(),
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendor3User.id,
      businessName: 'Reliable Gas Services',
      businessAddress: '789 Lekki Phase 1, Lagos',
      latitude: 6.4474,
      longitude: 3.4700,
      status: 'VERIFIED',
      rating: 4.9,
      totalReviews: 203,
      cacDocument: 'cac_reliable.pdf',
      idDocument: 'id_reliable.pdf',
      proofOfAddress: 'address_reliable.pdf',
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created vendors');

  // Create products for vendor 1
  await prisma.product.createMany({
    data: [
      {
        vendorId: vendor1.id,
        name: '12.5kg Gas Cylinder (Full)',
        description: 'Standard 12.5kg cooking gas cylinder, fully filled',
        price: 12500,
        stock: 50,
        unit: '12.5kg',
        isActive: true,
      },
      {
        vendorId: vendor1.id,
        name: '6kg Gas Cylinder (Full)',
        description: 'Compact 6kg cooking gas cylinder, perfect for small families',
        price: 7000,
        stock: 30,
        unit: '6kg',
        isActive: true,
      },
      {
        vendorId: vendor1.id,
        name: '3kg Gas Cylinder (Full)',
        description: 'Small 3kg cooking gas cylinder, ideal for camping',
        price: 4000,
        stock: 20,
        unit: '3kg',
        isActive: true,
      },
    ],
  });

  // Create products for vendor 2
  await prisma.product.createMany({
    data: [
      {
        vendorId: vendor2.id,
        name: '12.5kg Cooking Gas Refill',
        description: 'Gas refill service for 12.5kg cylinders',
        price: 11800,
        stock: 100,
        unit: '12.5kg refill',
        isActive: true,
      },
      {
        vendorId: vendor2.id,
        name: '50kg Industrial Gas Cylinder',
        description: 'Large industrial gas cylinder for commercial use',
        price: 45000,
        stock: 15,
        unit: '50kg',
        isActive: true,
      },
      {
        vendorId: vendor2.id,
        name: 'Gas Cylinder + Regulator Bundle',
        description: '12.5kg cylinder with free regulator and hose',
        price: 15000,
        stock: 25,
        unit: '12.5kg bundle',
        isActive: true,
      },
    ],
  });

  // Create products for vendor 3
  await prisma.product.createMany({
    data: [
      {
        vendorId: vendor3.id,
        name: 'Premium 12.5kg Gas Cylinder',
        description: 'High-quality 12.5kg cylinder with safety certification',
        price: 13000,
        stock: 40,
        unit: '12.5kg',
        isActive: true,
      },
      {
        vendorId: vendor3.id,
        name: '6kg Gas Refill Service',
        description: 'Quick refill service for 6kg cylinders',
        price: 6500,
        stock: 60,
        unit: '6kg refill',
        isActive: true,
      },
      {
        vendorId: vendor3.id,
        name: 'Gas Regulator (Premium)',
        description: 'High-quality gas regulator with safety valve',
        price: 3500,
        stock: 80,
        unit: '1 piece',
        isActive: true,
      },
      {
        vendorId: vendor3.id,
        name: 'Gas Hose (2 meters)',
        description: 'Durable gas hose, 2 meters length',
        price: 1500,
        stock: 100,
        unit: '2m',
        isActive: true,
      },
    ],
  });

  console.log('✅ Created products');

  // Create a customer for testing
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      phone: '+2348012345680',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
    },
  });

  // Create customer address
  await prisma.address.create({
    data: {
      customerId: customer.id,
      label: 'Home',
      street: '10 Allen Avenue',
      city: 'Ikeja',
      state: 'Lagos',
      latitude: 6.6018,
      longitude: 3.3515,
      isDefault: true,
    },
  });

  console.log('✅ Created test customer with address');

  // Create sample orders for the test customer
  const vendor1Products = await prisma.product.findMany({
    where: { vendorId: vendor1.id },
    take: 2,
  });

  if (vendor1Products.length >= 2) {
      // Order 1: PENDING
      await prisma.order.create({
          data: {
              orderNumber: `ORD-${Date.now()}-SAMPLE1`,
              customerId: customer.id,
              vendorId: vendor1.id,
              addressId: (await prisma.address.findFirst({ where: { customerId: customer.id } }))!.id,
              subtotal: vendor1Products[0].price * 2,
              deliveryFee: vendor1.deliveryFee,
              total: (vendor1Products[0].price * 2) + vendor1.deliveryFee,
              status: 'PENDING',
              paymentStatus: 'PENDING',
              items: {
                  create: [
                      {
                          productId: vendor1Products[0].id,
                          quantity: 2,
                          price: vendor1Products[0].price,
                          subtotal: vendor1Products[0].price * 2,
                      }
                  ]
              }
          }
      });

      // Order 2: DELIVERED
      await prisma.order.create({
          data: {
              orderNumber: `ORD-${Date.now()}-SAMPLE2`,
              customerId: customer.id,
              vendorId: vendor1.id,
              addressId: (await prisma.address.findFirst({ where: { customerId: customer.id } }))!.id,
              subtotal: vendor1Products[1].price * 1,
              deliveryFee: vendor1.deliveryFee,
              total: (vendor1Products[1].price * 1) + vendor1.deliveryFee,
              status: 'DELIVERED',
              deliveredAt: new Date(),
              paymentStatus: 'COMPLETED',
              items: {
                  create: [
                      {
                          productId: vendor1Products[1].id,
                          quantity: 1,
                          price: vendor1Products[1].price,
                          subtotal: vendor1Products[1].price * 1,
                      }
                  ]
              }
          }
      });
      console.log('✅ Created sample orders for customer@example.com');
  } else {
      console.warn('⚠️ Could not create sample orders: insufficient products.');
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('Vendor 1: gasplus@example.com / vendor123');
  console.log('Vendor 2: quickgas@example.com / vendor123');
  console.log('Vendor 3: reliablegas@example.com / vendor123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
