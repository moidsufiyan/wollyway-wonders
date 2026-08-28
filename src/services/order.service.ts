import { apiClient } from '@/lib/api-client';

export interface OrderItemDTO {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDetailDTO {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItemDTO[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  financials: {
    subtotal: number;
    shippingFee: number;
    taxTotal: number;
    orderTotal: number;
    currency: string;
  };
  paymentInfo: {
    provider: string;
    status: string;
    paidAt: string;
  };
  fulfillment: {
    carrier?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  createdAt: string;
}

export interface OrderSummaryDTO {
  id: string;
  orderNumber: string;
  status: string;
  itemCount: number;
  itemsPreview: {
    name: string;
    image: string;
    quantity: number;
  }[];
  orderTotal: number;
  currency: string;
  createdAt: string;
}

export const orderService = {
  getOrderById: async (orderId: string): Promise<OrderDetailDTO> => {
    const response = await apiClient.get<{ success: boolean; data: OrderDetailDTO }>(`/orders/${orderId}`);
    return response.data;
  },

  getMyOrders: async (page = 1, limit = 10): Promise<{ orders: OrderSummaryDTO[], pagination: any }> => {
    const response = await apiClient.get<{ success: boolean; data: OrderSummaryDTO[]; pagination: any }>(`/orders/me?page=${page}&limit=${limit}`);
    return { orders: response.data, pagination: response.pagination };
  },
};
