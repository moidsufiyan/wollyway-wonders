'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCustomerService } from '@/services/admin-customer.service';
import { AdminCustomerListQuery } from '@/types/admin-customer.types';

export const ADMIN_CUSTOMERS_QUERY_KEY = 'adminCustomers';

export function useAdminCustomers(params: AdminCustomerListQuery) {
  return useQuery({
    queryKey: [ADMIN_CUSTOMERS_QUERY_KEY, params],
    queryFn: () => adminCustomerService.getCustomers(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminCustomerDetail(id: string) {
  return useQuery({
    queryKey: [ADMIN_CUSTOMERS_QUERY_KEY, 'detail', id],
    queryFn: () => adminCustomerService.getCustomerById(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAdminCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' | 'deactivated' }) =>
      adminCustomerService.updateCustomerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CUSTOMERS_QUERY_KEY] });
    },
  });
}
