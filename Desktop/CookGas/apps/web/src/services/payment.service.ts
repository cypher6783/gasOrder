import apiClient from '@/lib/api-client';

export interface PaymentInitiationResponse {
  authorizationUrl: string;
  reference: string;
}

export interface PaymentVerificationResponse {
  status: string;
  message: string;
  data: any;
}

export const paymentService = {
  async initiatePayment(orderId: string): Promise<PaymentInitiationResponse> {
    const response = await apiClient.post('/payments/initiate', { orderId });
    return response.data.data;
  },

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    const response = await apiClient.get(`/payments/verify/${reference}`);
    return response.data.data;
  },
};
