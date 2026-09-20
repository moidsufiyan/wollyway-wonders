'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderService } from '@/services/admin-order.service';
import { AdminOrderQueryParams, AdminOrderListResult } from '@/types/admin-order.types';

export const ADMIN_ORDERS_QUERY_KEY = 'adminOrders';

export function useAdminOrders(params: AdminOrderQueryParams) {
  return useQuery<AdminOrderListResult, Error>({
    queryKey: [ADMIN_ORDERS_QUERY_KEY, params],
    queryFn: () => adminOrderService.getOrders(params),
    staleTime: 5 * 60 * 1000,
  });
}

export { useAdminOrderDetails } from './useAdminOrderDetails';

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminOrderService.updateAdminOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      // Invalidate specific order detail
      queryClient.invalidateQueries({
        queryKey: [ADMIN_ORDERS_QUERY_KEY, 'detail', variables.orderId],
      });
      // Invalidate order lists
      queryClient.invalidateQueries({
        queryKey: [ADMIN_ORDERS_QUERY_KEY],
      });
    },
  });
}

export function useCancelAdminOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      adminOrderService.cancelAdminOrder(orderId, reason),
    onSuccess: (data, variables) => {
      // Invalidate specific order detail
      queryClient.invalidateQueries({
        queryKey: [ADMIN_ORDERS_QUERY_KEY, 'detail', variables.orderId],
      });
      // Invalidate order lists
      queryClient.invalidateQueries({
        queryKey: [ADMIN_ORDERS_QUERY_KEY],
      });
      // Invalidate inventory queries
      queryClient.invalidateQueries({
        queryKey: ['admin-inventory'],
      });
    },
  });
}

