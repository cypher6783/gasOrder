'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentService } from '@/services/payment.service';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref'); // Paystack sends trxref usually
    
    if (reference) {
      verify(reference);
    } else {
      setStatus('failed');
      setMessage('No payment reference found.');
    }
  }, [searchParams]);

  const verify = async (ref: string) => {
    try {
      console.log('Verifying payment with reference:', ref);
      const result = await paymentService.verifyPayment(ref);
      console.log('Verification result:', result);
      console.log('Result status:', result?.status);
      console.log('Result data:', result?.data);
      
      // Paystack returns { status: true, message: '...', data: {...} }
      // The status is a boolean, not a string
      if (result && result.status === true) {
        setStatus('success');
        setMessage('Payment successful! Redirecting...');
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 2000);
      } else {
        console.error('Payment verification failed:', result);
        setStatus('failed');
        setMessage(result?.message || 'Payment verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      console.error('Error response:', error.response?.data);
      setStatus('failed');
      setMessage(error.response?.data?.message || 'Failed to verify payment. Please check your order status.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500">Your order has been confirmed.</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 mb-4">{message}</p>
            <button 
                onClick={() => router.push('/customer/dashboard')}
                className="btn-primary w-full"
            >
                Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
