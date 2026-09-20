import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { orderRepository, OrderRepository } from '../repositories/order.repository.js';
import { adminCustomerMapper, AdminCustomerMapper } from '../mappers/admin-customer.mapper.js';
import {
  AdminCustomerListQuery,
  AdminCustomerListDTO,
  AdminCustomerDetailDTO,
} from '../types/admin-customer.types.js';
import { FilterQuery, Types, SortOrder } from 'mongoose';
import { IUser } from '../models/user.model.js';
import { getRedisClient } from '../config/redis.config.js';
import { REDIS_KEYS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export class AdminCustomerService {
  constructor(
    private readonly userRepo: UserRepository = userRepository,
    private readonly orderRepo: OrderRepository = orderRepository,
    private readonly mapper: AdminCustomerMapper = adminCustomerMapper
  ) {}

  /**
   * Retrieves a paginated list of customers matching search/filter criteria.
   */
  async getCustomers(query: AdminCustomerListQuery): Promise<{
    customers: AdminCustomerListDTO[];
    total: number;
    page: number;
    pages: number;
  }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IUser> = {};

    if (query.q) {
      // Create safe regex by escaping special characters
      const safeQuery = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safeQuery, $options: 'i' } },
        { email: { $regex: safeQuery, $options: 'i' } },
      ];
    }

    if (query.status) {
      filter.status = query.status;
    }

    const sort: Record<string, SortOrder> = { createdAt: -1 };

    const [users, total] = await Promise.all([
      this.userRepo.findAdminCustomers(filter, skip, limit, sort),
      this.userRepo.countAdminCustomers(filter),
    ]);

    let statsMap = new Map<string, { orderCount: number; totalSpent: number }>();
    if (users.length > 0) {
      const userIds = users.map((u) => u._id as Types.ObjectId);
      statsMap = await this.orderRepo.getCustomerAggregatedStats(userIds);
    }

    const customers = users.map((user) => {
      const stats = statsMap.get(user._id.toString()) || { orderCount: 0, totalSpent: 0 };
      return this.mapper.toAdminCustomerListDTO(user, stats);
    });

    return {
      customers,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves full details for a single customer by ID.
   */
  async getCustomerById(id: string): Promise<AdminCustomerDetailDTO> {
    const user = await this.userRepo.findAdminCustomerById(id);
    if (!user) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    const objectId = new Types.ObjectId(id);
    const [stats, recentOrders] = await Promise.all([
      this.orderRepo.getCustomerDetailStats(objectId),
      this.orderRepo.findRecentOrdersByUserId(objectId, 5),
    ]);

    return this.mapper.toAdminCustomerDetailDTO(user, stats, recentOrders);
  }

  /**
   * Updates customer status enforcing deactivation logic and revoking Redis session.
   */
  async updateCustomerStatus(
    customerId: string,
    targetStatus: 'active' | 'suspended' | 'deactivated',
    adminId: string
  ): Promise<AdminCustomerDetailDTO> {
    if (customerId === adminId) {
      throw new AppError('Cannot modify your own account status', HTTP_STATUS.BAD_REQUEST);
    }

    const currentUser = await this.userRepo.findAdminCustomerById(customerId);
    if (!currentUser) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (currentUser.status === 'deactivated' && targetStatus !== 'deactivated') {
      throw new AppError('Cannot change status of a deactivated user', HTTP_STATUS.CONFLICT);
    }

    const updatedUser =
      targetStatus === 'deactivated'
        ? await this.userRepo.deactivateUser(customerId)
        : await this.userRepo.updateStatus(customerId, targetStatus);

    if (!updatedUser) {
      throw new AppError('Customer not found during update', HTTP_STATUS.NOT_FOUND);
    }

    // Revoke Redis refresh token for suspended and deactivated users
    if (targetStatus === 'suspended' || targetStatus === 'deactivated') {
      try {
        const redis = getRedisClient();
        await redis.del(REDIS_KEYS.ACTIVE_REFRESH_TOKEN(customerId));
      } catch (error) {
        console.error(`Failed to revoke Redis session for user ${customerId}:`, error);
      }
    }

    const objectId = new Types.ObjectId(customerId);
    const [stats, recentOrders] = await Promise.all([
      this.orderRepo.getCustomerDetailStats(objectId),
      this.orderRepo.findRecentOrdersByUserId(objectId, 5),
    ]);

    return this.mapper.toAdminCustomerDetailDTO(updatedUser, stats, recentOrders);
  }
}

export const adminCustomerService = new AdminCustomerService();
