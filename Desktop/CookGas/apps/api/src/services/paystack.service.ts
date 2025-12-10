import axios from 'axios';
import crypto from 'crypto';
import { AppError } from '../utils/errors';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
  // Warn or throw? For now warn to prevent crash during dev if not set
  console.warn('PAYSTACK_SECRET_KEY is not set');
}

export const paystackService = {
  // Initialize a transaction
  async initializeTransaction(email: string, amount: number, callbackUrl: string, metadata: any = {}) {
    try {
      // Amount is in kobo (multiply by 100)
      const amountInKobo = Math.round(amount * 100);

      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amountInKobo,
          callback_url: callbackUrl,
          metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new AppError('Payment initialization failed', 500);
    }
  },

  // Verify a transaction
  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new AppError('Payment verification failed', 500);
    }
  },

  // Verify webhook signature
  verifySignature(signature: string, body: any): boolean {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY || '')
      .update(JSON.stringify(body))
      .digest('hex');
    
    return hash === signature;
  },

  // Generate a unique reference
  generateReference(): string {
    return `TRX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }
};
