import { Product } from '../models/product.model.js';
import { Order, IOrder } from '../models/order.model.js';
import { ProductMetricsDTO, OrderMetricsDTO, RevenueMetricsDTO } from '../types/dashboard.types.js';

export class DashboardRepository {
  /**
   * Aggregates product catalog status breakdown.
   * Scans entire catalog regardless of visibility or stock.
   */
  async getProductMetrics(): Promise<ProductMetricsDTO> {
    const productStats = await Product.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: '$visibility',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: ProductMetricsDTO = {
      total: 0,
      published: 0,
      draft: 0,
      hidden: 0,
      archived: 0,
    };

    for (const row of productStats) {
      if (row._id && row._id in counts) {
        counts[row._id as keyof Omit<ProductMetricsDTO, 'total'>] = row.count;
      }
      counts.total += row.count;
    }

    return counts;
  }

  /**
   * Aggregates order fulfillment lifecycle breakdown.
   */
  async getOrderMetrics(): Promise<OrderMetricsDTO> {
    const orderStats = await Order.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: OrderMetricsDTO = {
      total: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const row of orderStats) {
      const statusKey = row._id?.toLowerCase() as keyof Omit<OrderMetricsDTO, 'total'>;
      if (statusKey && statusKey in counts) {
        counts[statusKey] = row.count;
      }
      counts.total += row.count;
    }

    return counts;
  }

  /**
   * Aggregates total paid revenue for non-cancelled and non-refunded orders.
   * Integer calculations performed strictly within MongoDB.
   */
  async getRevenueMetrics(): Promise<RevenueMetricsDTO> {
    const [revenueResult] = await Order.aggregate<{
      _id: null;
      total: number;
      currency?: string;
    }>([
      {
        $match: {
          status: { $ne: 'CANCELLED' },
          'paymentInfo.status': 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$financials.orderTotal' },
          currency: { $first: '$financials.currency' },
        },
      },
    ]);

    return {
      total: revenueResult?.total ?? 0,
      currency: revenueResult?.currency ?? 'INR',
    };
  }

  /**
   * Retrieves the 5 most recent orders sorted newest first.
   */
  async getRecentOrders(limit = 5): Promise<IOrder[]> {
    return Order.find().sort({ createdAt: -1 }).limit(limit);
  }
}

export const dashboardRepository = new DashboardRepository();
