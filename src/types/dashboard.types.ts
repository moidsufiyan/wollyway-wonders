export interface ProductMetricsDTO {
  total: number;
  published: number;
  draft: number;
  hidden: number;
  archived: number;
}

export interface OrderMetricsDTO {
  total: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueMetricsDTO {
  total: number;
  currency: string;
}

export interface DashboardRecentOrderDTO {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  status: string;
  orderTotal: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface DashboardDTO {
  products: ProductMetricsDTO;
  orders: OrderMetricsDTO;
  revenue: RevenueMetricsDTO;
  recentOrders: DashboardRecentOrderDTO[];
}
