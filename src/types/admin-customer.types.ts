export interface AdminCustomerListQuery {
  page?: string;
  limit?: string;
  q?: string;
  status?: string;
}

export interface AdminCustomerListDTO {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'deactivated';
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface AdminCustomerDetailDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'suspended' | 'deactivated';
  createdAt: string;
  lastLogin: string | null;
  addresses: any[];
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  recentOrders: {
    id: string;
    orderId: string;
    createdAt: string;
    status: string;
    total: number;
  }[];
}

export interface AdminCustomerStatusUpdateDTO {
  status: 'active' | 'suspended' | 'deactivated';
}
