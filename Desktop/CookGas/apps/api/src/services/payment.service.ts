import { PrismaClient } from '@prisma/client';
import { paystackService } from './paystack.service';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const paymentService = {
  // Initiate Payment
  async initiatePayment(userId: string, orderId: string) {
    // 1. Get Order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { include: { user: true } } },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Order is not in pending state', 400);
    }

    // 2. Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
        throw new AppError('Payment already completed for this order', 400);
    }

    // 3. Generate Reference or use existing if pending?
    // Let's generate a new one for each attempt to avoid Paystack duplicate ref errors if previous failed.
    const reference = paystackService.generateReference();

    // 4. Initialize Paystack Transaction
    const paystackResponse = await paystackService.initializeTransaction(
      order.customer.user.email,
      order.total, // Amount in Naira, service converts to Kobo
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`, // Callback URL
      {
        orderId: order.id,
        custom_fields: [
            {
                display_name: "Order ID",
                variable_name: "order_id",
                value: order.id
            }
        ]
      }
    );

    // 5. Create or Update Payment Record
    // upsert is safer
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        amount: order.total,
        paymentMethod: 'paystack',
        transactionRef: reference,
        paymentGatewayRef: paystackResponse.data.reference, // Paystack's ref
        status: 'PENDING',
        escrowState: 'PENDING',
        metadata: paystackResponse.data,
      },
      update: {
        transactionRef: reference,
        paymentGatewayRef: paystackResponse.data.reference,
        updatedAt: new Date(),
      }
    });

    return {
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference, // Use Paystack ref for tracking
    };
  },

  // Handle Webhook
  async handleWebhook(event: any) {
    // 1. Validate Event Type
    if (event.event === 'charge.success') {
      const { reference, metadata, amount } = event.data;
      const orderId = metadata?.orderId || metadata?.custom_fields?.find((f: any) => f.variable_name === 'order_id')?.value;

      if (!orderId) {
        console.error('Webhook: No orderId found in metadata');
        return;
      }

      // 2. Find Payment
      // We search by orderId because we might have updated the ref, or search by orderId is safer if we have it
      // But verify by ref is also good.
      // Paystack returns 'reference' which should match our `paymentGatewayRef`
      
      const payment = await prisma.payment.findFirst({
        where: { orderId },
      });

      if (!payment) {
        console.error(`Webhook: Payment record not found for order ${orderId}`);
        return;
      }

      if (payment.status === 'COMPLETED') {
        console.log(`Webhook: Payment for order ${orderId} already completed`);
        return;
      }

      // 3. Verify Amount (Paystack is in kobo, DB is in Naira)
      if (amount / 100 !== payment.amount) {
        console.error(`Webhook: Amount mismatch for order ${orderId}. Expected ${payment.amount}, got ${amount / 100}`);
        return; // Potential fraud
      }

      // 4. Update Payment and Order
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            escrowState: 'HELD', // Move to Escrow
            metadata: event.data, // Update metadata with full success payload
          },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CONFIRMED', // or PENDING, but usually Payment Success -> Confirmed/Processing
            paymentStatus: 'COMPLETED',
          },
        }),
      ]);
      
      console.log(`Webhook: Payment successful for order ${orderId}. Funds held in escrow.`);
    }
  },
  
  // Verify Payment (Manual check)
  async verifyPayment(reference: string) {
      const data = await paystackService.verifyTransaction(reference);
      
      // Paystack returns { status: true, data: { status: 'success', ... } }
      if (data.status === true && data.data?.status === 'success') {
          // Extract order ID from metadata
          const orderId = data.data.metadata?.orderId || data.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'order_id')?.value;
          
          if (orderId) {
              // Find payment record
              const payment = await prisma.payment.findFirst({
                  where: { orderId },
              });

              if (payment && payment.status !== 'COMPLETED') {
                  // Verify amount matches
                  if (data.data.amount / 100 === payment.amount) {
                      // Update Payment and Order (same as webhook)
                      await prisma.$transaction([
                          prisma.payment.update({
                              where: { id: payment.id },
                              data: {
                                  status: 'COMPLETED',
                                  paidAt: new Date(),
                                  escrowState: 'HELD',
                                  metadata: data.data,
                              },
                          }),
                          prisma.order.update({
                              where: { id: orderId },
                              data: {
                                  status: 'CONFIRMED',
                                  paymentStatus: 'COMPLETED',
                              },
                          }),
                      ]);
                      
                      console.log(`Verify: Payment successful for order ${orderId}. Funds held in escrow.`);
                  } else {
                      console.error(`Amount mismatch: Expected ${payment.amount}, got ${data.data.amount / 100}`);
                  }
              }
          }
      }
      
      return data;
  },

  // Release Escrow (Called when Order is DELIVERED)
  async releaseEscrow(orderId: string) {
      const payment = await prisma.payment.findUnique({
          where: { orderId }
      });

      if (!payment) throw new AppError('Payment not found', 404);
      
      if (payment.escrowState !== 'HELD') {
          // If already released, ignore. If pending, can't release.
           if (payment.escrowState === 'RELEASED') return;
           throw new AppError('Funds are not in escrow state', 400); 
      }

      
      // Update to RELEASED
      await prisma.payment.update({
          where: { id: payment.id },
          data: { escrowState: 'RELEASED' }
      });
      
      console.log(`Escrow: Released funds for order ${orderId}`);
  },

  // Process Payouts (Cron Job)
  async processPayouts() {
    console.log('Payout Scheduler: Starting batch processing...');

    // 1. Fetch all eligible payments (RELEASED and not yet paid out)
    const eligiblePayments = await prisma.payment.findMany({
      where: {
        escrowState: 'RELEASED',
        payoutId: null,
      },
      include: {
        order: {
          select: {
            vendorId: true,
          },
        },
      },
    });

    if (eligiblePayments.length === 0) {
      console.log('Payout Scheduler: No eligible payments found.');
      return;
    }

    // 2. Group by Vendor
    const paymentsByVendor: Record<string, typeof eligiblePayments> = {};
    
    for (const payment of eligiblePayments) {
      const vendorId = payment.order.vendorId;
      if (!paymentsByVendor[vendorId]) {
        paymentsByVendor[vendorId] = [];
      }
      paymentsByVendor[vendorId].push(payment);
    }

    // 3. Create Payouts and Update Payments
    // We process each vendor independently to avoid massive transaction failures, or all in one?
    // Independent is safer for partial success.
    
    let payoutsCreated = 0;

    for (const [vendorId, payments] of Object.entries(paymentsByVendor)) {
      try {
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        
        // Generate batch reference
        const batchRef = `PAYOUT-${Date.now()}-${vendorId.slice(0,8)}`;

        await prisma.$transaction(async (tx) => {
          // Create Payout
          const payout = await tx.payout.create({
            data: {
              vendorId,
              amount: totalAmount,
              status: 'PENDING', // Ready for processing by payout provider
              reference: batchRef,
            },
          });

          // Update Payments
          await tx.payment.updateMany({
            where: {
              id: { in: payments.map(p => p.id) }
            },
            data: {
              payoutId: payout.id, // Link to payout
            },
          });
          
          console.log(`Payout Scheduler: Created payout ${batchRef} for Vendor ${vendorId} amount ${totalAmount}`);
        });
        
        payoutsCreated++;
      } catch (error) {
        console.error(`Payout Scheduler: Failed to process payout for vendor ${vendorId}`, error);
      }
    }

    console.log(`Payout Scheduler: Completed. Created ${payoutsCreated} payouts.`);
  }
};
