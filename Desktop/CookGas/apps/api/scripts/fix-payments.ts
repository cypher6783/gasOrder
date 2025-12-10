import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPendingPayments() {
  console.log('=== Fixing Orders with CONFIRMED status but PENDING payment ===\n');

  // Find orders that are CONFIRMED but payment is still PENDING
  const ordersToFix = await prisma.order.findMany({
    where: {
      status: 'CONFIRMED',
      paymentStatus: 'PENDING'
    },
    include: { payment: true }
  });

  console.log(`Found ${ordersToFix.length} orders to fix\n`);

  for (const order of ordersToFix) {
    console.log(`Fixing Order: ${order.orderNumber}`);
    
    if (order.payment) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            escrowState: 'HELD'
          }
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'COMPLETED'
          }
        })
      ]);
      console.log(`  ✅ Fixed - Payment and Order status updated to COMPLETED\n`);
    } else {
      console.log(`  ⚠️  Skipped - No payment record found\n`);
    }
  }

  console.log('Done!');
  await prisma.$disconnect();
}

fixPendingPayments().catch(console.error);
