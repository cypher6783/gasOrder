
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Inspection ---');
  
  const userCount = await prisma.user.count();
  const customerCount = await prisma.customer.count();
  const vendorCount = await prisma.vendor.count();
  const orderCount = await prisma.order.count();
  const paymentCount = await prisma.payment.count();

  console.log(`Users: ${userCount}`);
  console.log(`Customers: ${customerCount}`);
  console.log(`Vendors: ${vendorCount}`);
  console.log(`Orders: ${orderCount}`);
  console.log(`Payments: ${paymentCount}`);

  if (orderCount > 0) {
    console.log('\n--- Recent Orders ---');
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { user: true } },
        vendor: { include: { user: true } }
      }
    });

    orders.forEach(o => {
      console.log(`Order ${o.orderNumber} (ID: ${o.id})`);
      console.log(`  Status: ${o.status}`);
      console.log(`  Customer: ${o.customer.user.email} (ID: ${o.customerId})`);
      console.log(`  Vendor: ${o.vendor.businessName} (User: ${o.vendor.user.email}, ID: ${o.vendorId})`);
    });
  } else {
      console.log('No orders found in database.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
