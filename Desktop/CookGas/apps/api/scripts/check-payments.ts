import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPayments() {
  console.log('=== Checking Payment Records ===\n');

  const payments = await prisma.payment.findMany({
    include: { order: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Total Payment Records: ${payments.length}\n`);

  payments.forEach((payment, idx) => {
    console.log(`Payment ${idx + 1}:`);
    console.log(`  Order: ${payment.order.orderNumber}`);
    console.log(`  Amount: ₦${payment.amount}`);
    console.log(`  Status: ${payment.status}`);
    console.log(`  Escrow State: ${payment.escrowState}`);
    console.log(`  Paid At: ${payment.paidAt || 'Not paid'}`);
    console.log(`  Order Status: ${payment.order.status}`);
    console.log(`  Order Payment Status: ${payment.order.paymentStatus}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkPayments().catch(console.error);
