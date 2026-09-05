import { apiClient } from '@/lib/api-client';

export interface CheckoutSummaryDTO {
  sessionId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
    isAvailable: true;
  }>;
  shippingAddressSnapshot: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  totals: {
    subtotal: number;
    shippingFee: number;
    taxTotal: number;
    orderTotal: number;
  };
  reservationExpiresAt: string;
  status: string;
  paymentProvider?: string;
  paymentIntentId?: string;
}

export interface CheckoutStatusDTO {
  status: string;
  orderId?: string;
  orderNumber?: string;
}

export const checkoutService = {
  startCheckout: async (): Promise<CheckoutSummaryDTO> => {
    const response = await apiClient.post<{ success: boolean; checkout: CheckoutSummaryDTO }>('/checkout/start');
    return response.checkout;
  },

  getCurrentCheckout: async (): Promise<CheckoutSummaryDTO> => {
    const response = await apiClient.get<{ success: boolean; checkout: CheckoutSummaryDTO }>('/checkout/current');
    return response.checkout;
  },

  extendCheckout: async (): Promise<CheckoutSummaryDTO> => {
    const response = await apiClient.post<{ success: boolean; checkout: CheckoutSummaryDTO }>('/checkout/extend');
    return response.checkout;
  },

  cancelCheckout: async (): Promise<void> => {
    await apiClient.post('/checkout/cancel');
  },

  cancelPaymentIntent: async (): Promise<CheckoutSummaryDTO> => {
    const response = await apiClient.post<{ success: boolean; checkout: CheckoutSummaryDTO }>('/checkout/payment-cancel');
    return response.checkout;
  },

  getCheckoutStatus: async (sessionId: string): Promise<CheckoutStatusDTO> => {
    const response = await apiClient.get<{ success: boolean; data: CheckoutStatusDTO }>(`/checkout/${sessionId}/status`);
    return response.data;
  },
};
