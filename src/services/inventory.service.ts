import { apiClient } from '@/lib/api-client';
import type {
  AdminInventoryListResult,
  AdminInventoryQueryParams,
  InventoryAdjustmentDTO,
  InventoryHistoryListResult,
} from '@/types/inventory.types';

export class InventoryService {
  /**
   * Fetches the paginated admin inventory overview.
   */
  async getAdminInventory(params: AdminInventoryQueryParams = {}): Promise<AdminInventoryListResult> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.set('q', params.q);
    if (params.status && params.status !== 'all') {
      searchParams.set('status', params.status);
    }
    if (params.lowStock !== undefined) {
      searchParams.set('lowStock', params.lowStock.toString());
    }
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const qs = searchParams.toString();
    const endpoint = `/admin/inventory${qs ? `?${qs}` : ''}`;

    return apiClient.get<AdminInventoryListResult>(endpoint);
  }

  /**
   * Adjusts the inventory stock for a product manually.
   */
  async adjustInventory(productId: string, data: InventoryAdjustmentDTO): Promise<any> {
    return apiClient.post(`/admin/inventory/${productId}/adjust`, data);
  }

  /**
   * Fetches paginated inventory transaction history.
   */
  async getInventoryHistory(
    productId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<InventoryHistoryListResult> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', page.toString());
    searchParams.set('limit', limit.toString());
    
    return apiClient.get<InventoryHistoryListResult>(
      `/admin/inventory/${productId}/history?${searchParams.toString()}`
    );
  }
}

export const inventoryService = new InventoryService();
