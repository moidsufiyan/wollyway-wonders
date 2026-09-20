import { useQuery } from '@tanstack/react-query';
import { adminOrderService } from '@/services/admin-order.service';
import { AdminOrderDetailDTO } from '@/types/admin-order.types';
import { ApiClientError } from '@/lib/api-client';
import { ADMIN_ORDERS_QUERY_KEY } from './useAdminOrders';

export const useAdminOrderDetails = (orderId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [ADMIN_ORDERS_QUERY_KEY, 'detail', orderId],
    queryFn: () => adminOrderService.getOrderDetails(orderId),
    enabled: !!orderId,
  });

  return { 
    order: data as AdminOrderDetailDTO | undefined, 
    loading: isLoading, 
    error: error instanceof ApiClientError ? error.message : error ? 'Failed to fetch order details' : null,
    refetch 
  };
};
