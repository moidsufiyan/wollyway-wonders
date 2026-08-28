import { apiClient } from '@/lib/api-client';

export interface PaymentIntentResult {
  provider: 'razorpay' | 'stripe';
  clientReference: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export const paymentService = {
  createPaymentIntent: async (provider: 'razorpay' | 'stripe'): Promise<PaymentIntentResult> => {
    const response = await apiClient.post<{ success: boolean; data: PaymentIntentResult }>('/payments/create-intent', { provider });
    return response.data;
  }
};
