import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVendorOrders() {
  console.log('=== Checking Vendor Orders and Sales ===\n');

  // Get all vendors
  const vendors = await prisma.vendor.findMany({
    include: { user: true }
  });

  for (const vendor of vendors) {
    console.log(`\nVendor: ${vendor.businessName} (${vendor.user.email})`);
    console.log('---');

    // Get all orders for this vendor
    const orders = await prisma.order.findMany({
      where: { vendorId: vendor.id },
      include: { payment: true },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Total Orders: ${orders.length}`);

    // Show each order's status
    orders.forEach((order, idx) => {
      console.log(`\nOrder ${idx + 1}:`);
      console.log(`  ID: ${order.id}`);
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment Status: ${order.paymentStatus}`);
      console.log(`  Total: ₦${order.total}`);
      console.log(`  Payment Record: ${order.payment ? 'Yes' : 'No'}`);
      if (order.payment) {
        console.log(`    Payment Status: ${order.payment.status}`);
        console.log(`    Escrow State: ${order.payment.escrowState}`);
      }
    });

    // Calculate what the sales should be
    const deliveredWithPayment = orders.filter(
      o => o.status === 'DELIVERED' && o.paymentStatus === 'COMPLETED'
    );
    
    const totalSales = deliveredWithPayment.reduce((sum, o) => sum + o.total, 0);
    
    console.log(`\n✅ Delivered + Paid Orders: ${deliveredWithPayment.length}`);
    console.log(`💰 Total Sales (should show on dashboard): ₦${totalSales}`);
  }

  await prisma.$disconnect();
}

checkVendorOrders().catch(console.error);
