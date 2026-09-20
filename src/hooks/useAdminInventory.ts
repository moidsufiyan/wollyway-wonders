'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import type {
  AdminInventoryQueryParams,
  AdminInventoryListResult,
  InventoryAdjustmentDTO,
  InventoryHistoryListResult,
} from '@/types/inventory.types';

/**
 * Fetches admin inventory listing from GET /admin/inventory.
 */
export function useAdminInventory(params: AdminInventoryQueryParams = {}) {
  return useQuery<AdminInventoryListResult, Error>({
    queryKey: ['admin-inventory', params],
    queryFn: () => inventoryService.getAdminInventory(params),
    staleTime: 30000,
  });
}

/**
 * Mutation for adjusting inventory.
 */
export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: InventoryAdjustmentDTO }) =>
      inventoryService.adjustInventory(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-history', productId] });
    },
  });
}

/**
 * Query for fetching inventory transaction history.
 */
export function useAdminInventoryHistory(productId: string, page: number = 1, limit: number = 20) {
  return useQuery<InventoryHistoryListResult, Error>({
    queryKey: ['admin-inventory-history', productId, page, limit],
    queryFn: () => inventoryService.getInventoryHistory(productId, page, limit),
    staleTime: 60000,
    enabled: !!productId,
  });
}
