import { IUser } from '../models/user.model.js';
import { IOrder } from '../models/order.model.js';
import { AdminCustomerListDTO, AdminCustomerDetailDTO } from '../types/admin-customer.types.js';

export class AdminCustomerMapper {
  toAdminCustomerListDTO(
    user: IUser,
    stats: { orderCount: number; totalSpent: number }
  ): AdminCustomerListDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      status: user.status as 'active' | 'suspended' | 'deactivated',
      createdAt: user.createdAt.toISOString(),
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent,
    };
  }

  toAdminCustomerDetailDTO(
    user: IUser,
    stats: { orderCount: number; totalSpent: number; lastOrderDate: Date | null },
    recentOrders: IOrder[]
  ): AdminCustomerDetailDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      status: user.status as 'active' | 'suspended' | 'deactivated',
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      addresses: user.addresses || [],
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent,
      lastOrderDate: stats.lastOrderDate ? stats.lastOrderDate.toISOString() : null,
      recentOrders: recentOrders.map((order) => ({
        id: order._id.toString(),
        orderId: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        total: order.financials.orderTotal,
      })),
    };
  }
}

export const adminCustomerMapper = new AdminCustomerMapper();
