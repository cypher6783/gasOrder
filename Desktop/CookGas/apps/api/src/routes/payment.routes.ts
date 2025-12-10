import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { paymentService } from '../services/payment.service';
import { paystackService } from '../services/paystack.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

const router = Router();

// Webhook endpoint (Public, needs signature verification)
router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-paystack-signature'] as string;
  
  if (!signature) {
      throw new AppError('No signature provided', 400);
  }

  const isValid = paystackService.verifySignature(signature, req.body);
  
  if (!isValid) {
      throw new AppError('Invalid signature', 400);
  }

  // Process asynchronously to return 200 OK quickly to Paystack
  paymentService.handleWebhook(req.body).catch(err => {
      console.error('Error processing webhook:', err);
  });

  res.sendStatus(200);
}));

// Protected routes
router.use(authenticate);

router.post('/initiate', asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  
  if (!orderId) throw new AppError('Order ID is required', 400);
  
  // Verify user owns order ?? paymentService should check or we pass userId
  const result = await paymentService.initiatePayment(req.user!.userId, orderId);
  
  res.json({
      status: 'success',
      data: result
  });
}));

router.get('/verify/:reference', asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.verifyPayment(req.params.reference);
  
  res.json({
      status: 'success',
      data: result
  });
}));

export default router;
