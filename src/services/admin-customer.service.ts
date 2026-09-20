import { apiClient } from '@/lib/api-client';
import {
  AdminCustomerListQuery,
  AdminCustomerListDTO,
  AdminCustomerDetailDTO,
  AdminCustomerStatusUpdateDTO,
} from '@/types/admin-customer.types';

export const adminCustomerService = {
  async getCustomers(
    params: AdminCustomerListQuery
  ): Promise<{ customers: AdminCustomerListDTO[]; total: number; page: number; pages: number }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const response = await apiClient.get<{ success: boolean; data: { customers: AdminCustomerListDTO[]; total: number; page: number; pages: number } }>(`/admin/customers?${query}`);
    return response.data;
  },

  async getCustomerById(id: string): Promise<AdminCustomerDetailDTO> {
    const response = await apiClient.get<{ success: boolean; data: AdminCustomerDetailDTO }>(`/admin/customers/${id}`);
    return response.data;
  },

  async updateCustomerStatus(
    id: string,
    status: AdminCustomerStatusUpdateDTO['status']
  ): Promise<AdminCustomerDetailDTO> {
    const response = await apiClient.patch<{ success: boolean; data: AdminCustomerDetailDTO }>(`/admin/customers/${id}/status`, { status });
    return response.data;
  },
};
