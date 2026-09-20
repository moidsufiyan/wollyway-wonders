import { apiClient } from '@/lib/api-client';
import { DashboardDTO } from '@/types/dashboard.types';

export class DashboardService {
  async getDashboard(): Promise<DashboardDTO> {
    const response = await apiClient.get<{
      success: boolean;
      data: DashboardDTO;
    }>('/admin/dashboard');

    return response.data;
  }
}

export const dashboardService = new DashboardService();
