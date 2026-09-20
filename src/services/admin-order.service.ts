import { apiClient } from '@/lib/api-client';
import {
  AdminOrderQueryParams,
  AdminOrderListResult,
  AdminOrderSummaryDTO,
  AdminOrderDetailDTO,
} from '../types/admin-order.types';

export const adminOrderService = {
  /**
   * Fetches paginated admin orders with applied filters and sort.
   */
  async getOrders(params: AdminOrderQueryParams): Promise<AdminOrderListResult> {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page.toString());
    if (params.limit) urlParams.append('limit', params.limit.toString());
    if (params.q) urlParams.append('q', params.q);
    if (params.status && params.status !== 'all') urlParams.append('status', params.status);
    if (params.paymentStatus && params.paymentStatus !== 'all')
      urlParams.append('paymentStatus', params.paymentStatus);
    if (params.sort) urlParams.append('sort', params.sort);
    if (params.from) urlParams.append('from', params.from);
    if (params.to) urlParams.append('to', params.to);

    return apiClient.get<AdminOrderListResult>(`/admin/orders?${urlParams.toString()}`);
  },

  /**
   * Fetches full order details for a specific order.
   */
  async getOrderDetails(orderId: string): Promise<AdminOrderDetailDTO> {
    const res = await apiClient.get<{ success: boolean; data: AdminOrderDetailDTO }>(`/admin/orders/${orderId}`);
    return res.data;
  },

  /**
   * Admin fulfillment state machine mutations.
   */
  async updateAdminOrderStatus(orderId: string, status: string): Promise<AdminOrderDetailDTO> {
    const res = await apiClient.patch<{ success: boolean; data: AdminOrderDetailDTO }>(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },

  /**
   * Admin order cancellation and refund workflow.
   */
  async cancelAdminOrder(orderId: string, reason?: string): Promise<AdminOrderDetailDTO> {
    const res = await apiClient.post<{ success: boolean; data: AdminOrderDetailDTO }>(
      `/admin/orders/${orderId}/cancel`,
      { reason }
    );
    return res.data;
  },
};
