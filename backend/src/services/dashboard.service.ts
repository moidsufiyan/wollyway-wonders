import { dashboardRepository, DashboardRepository } from '../repositories/dashboard.repository.js';
import { orderMapper, OrderMapper } from '../mappers/order.mapper.js';
import { DashboardDTO } from '../types/dashboard.types.js';

export class DashboardService {
  constructor(
    private readonly repo: DashboardRepository = dashboardRepository,
    private readonly mapper: OrderMapper = orderMapper
  ) {}

  /**
   * Retrieves consolidated dashboard metrics and recent orders in parallel.
   */
  public async getDashboardData(): Promise<DashboardDTO> {
    const [products, orders, revenue, recentOrdersDocs] = await Promise.all([
      this.repo.getProductMetrics(),
      this.repo.getOrderMetrics(),
      this.repo.getRevenueMetrics(),
      this.repo.getRecentOrders(5),
    ]);

    const recentOrders = recentOrdersDocs.map((doc) => this.mapper.toDashboardRecentOrderDTO(doc));

    return {
      products,
      orders,
      revenue,
      recentOrders,
    };
  }
}

export const dashboardService = new DashboardService();
