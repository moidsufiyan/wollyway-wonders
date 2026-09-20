import { ClientSession, FilterQuery, Types } from 'mongoose';
import { Order, IOrder } from '../models/order.model.js';
import { OrderStatus, OrderRefundStatus, OrderHistoryEntry } from '../types/order.types.js';

export class OrderRepository {
  /**
   * Persists a new Order document.
   */
  async createOrder(orderData: Partial<IOrder>, session?: ClientSession): Promise<IOrder> {
    if (session) {
      const [order] = await Order.create([orderData], { session });
      return order;
    }
    return Order.create(orderData);
  }

  /**
   * Finds an order by its MongoDB ObjectId.
   */
  async findById(orderId: Types.ObjectId): Promise<IOrder | null> {
    return Order.findById(orderId);
  }

  /**
   * Admin: Finds an order securely as a lean document for DTO mapping.
   */
  async findAdminOrderById(orderId: string | Types.ObjectId): Promise<IOrder | null> {
    return Order.findById(orderId).select('-__v').lean() as unknown as IOrder | null;
  }

  /**
   * Finds an order by public human-readable order number.
   */
  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return Order.findOne({ orderNumber });
  }

  /**
   * Finds an order by originating CheckoutSession ID (Idempotency lookup).
   */
  async findByCheckoutSessionId(sessionId: Types.ObjectId): Promise<IOrder | null> {
    return Order.findOne({ checkoutSessionId: sessionId });
  }

  /**
   * Finds an order by payment gateway transaction ID (Idempotency lookup).
   */
  async findByPaymentTransactionId(transactionId: string): Promise<IOrder | null> {
    return Order.findOne({ 'paymentInfo.transactionId': transactionId });
  }

  /**
   * Finds paginated orders belonging to a specific customer.
   */
  async findByUserId(
    userId: Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<{ orders: IOrder[]; total: number }> {
    const [orders, total] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId }),
    ]);

    return { orders, total };
  }

  /**
   * Finds paginated orders matching admin filters.
   */
  async findAdminOrders(
    filter: FilterQuery<IOrder>,
    skip: number,
    limit: number,
    sortOptions: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<{ orders: IOrder[]; total: number }> {
    const [orders, total] = await Promise.all([
      Order.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    return { orders, total };
  }

  /**
   * Atomically updates order status and fulfillment/cancellation metadata.
   */
  async updateStatus(
    orderId: Types.ObjectId,
    status: OrderStatus,
    extraFields: Partial<IOrder> = {},
    session?: ClientSession
  ): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status,
          ...extraFields,
        },
      },
      { new: true, session }
    );
  }

  /**
   * Atomically updates order status and appends to history, checking expected current status.
   */
  async updateStatusAtomic(
    orderId: Types.ObjectId,
    expectedCurrentStatus: OrderStatus,
    newStatus: OrderStatus,
    historyEntry: OrderHistoryEntry,
    extraFields: Partial<IOrder> = {},
    session?: ClientSession
  ): Promise<IOrder | null> {
    return Order.findOneAndUpdate(
      { _id: orderId, status: expectedCurrentStatus },
      {
        $set: {
          status: newStatus,
          ...extraFields,
        },
        $push: {
          history: historyEntry,
        },
      },
      { new: true, session }
    );
  }

  /**
   * Verifies whether a product is associated with active, unsettled orders.
   * Active states: CONFIRMED, PROCESSING, SHIPPED.
   * Terminal states (DELIVERED, CANCELLED) do NOT block archival.
   */
  async hasActiveOrdersForProduct(productId: Types.ObjectId): Promise<boolean> {
    const count = await Order.countDocuments({
      'items.productId': productId,
      status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] },
    });
    return count > 0;
  }

  /**
   * Concurrency protection: Atomic compare-and-set to claim the refund operation.
   * Only transitions from 'not_started' | 'unknown' | null -> 'pending'.
   * Prevents two concurrent requests from both initiating provider refunds.
   */
  async claimRefundOperation(orderId: Types.ObjectId): Promise<IOrder | null> {
    return Order.findOneAndUpdate(
      {
        _id: orderId,
        'paymentInfo.status': 'paid',
        $or: [
          { 'paymentInfo.refundStatus': { $in: ['not_started', 'unknown'] } },
          { 'paymentInfo.refundStatus': { $exists: false } },
        ],
      },
      {
        $set: {
          'paymentInfo.refundStatus': 'pending',
        },
      },
      { new: true }
    );
  }

  /**
   * Durably records provider refund state upon gateway response.
   */
  async updatePaymentRefundState(
    orderId: Types.ObjectId,
    refundState: {
      refundStatus: OrderRefundStatus;
      refundId?: string;
      refundedAt?: Date;
      refundAmount?: number;
    },
    session?: ClientSession
  ): Promise<IOrder | null> {
    const setFields: Record<string, unknown> = {
      'paymentInfo.refundStatus': refundState.refundStatus,
    };
    if (refundState.refundId) setFields['paymentInfo.refundId'] = refundState.refundId;
    if (refundState.refundedAt) setFields['paymentInfo.refundedAt'] = refundState.refundedAt;
    if (refundState.refundAmount !== undefined)
      setFields['paymentInfo.refundAmount'] = refundState.refundAmount;

    return Order.findByIdAndUpdate(orderId, { $set: setFields }, { new: true, session });
  }

  /**
   * Calculates order count and total spent for a list of users in a single aggregation.
   * Total spent only includes paid, non-cancelled orders.
   */
  async getCustomerAggregatedStats(
    userIds: Types.ObjectId[]
  ): Promise<Map<string, { orderCount: number; totalSpent: number }>> {
    const stats = await Order.aggregate<{
      _id: Types.ObjectId;
      orderCount: number;
      totalSpent: number;
    }>([
      {
        $match: {
          userId: { $in: userIds },
        },
      },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'CANCELLED'] },
                    { $eq: ['$paymentInfo.status', 'paid'] },
                  ],
                },
                '$financials.orderTotal',
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = new Map<string, { orderCount: number; totalSpent: number }>();
    for (const stat of stats) {
      statsMap.set(stat._id.toString(), {
        orderCount: stat.orderCount,
        totalSpent: stat.totalSpent,
      });
    }

    return statsMap;
  }

  /**
   * Calculates total orders, total spent, and last order date for a single customer.
   */
  async getCustomerDetailStats(
    userId: Types.ObjectId
  ): Promise<{ orderCount: number; totalSpent: number; lastOrderDate: Date | null }> {
    const [result] = await Order.aggregate<{
      orderCount: number;
      totalSpent: number;
      lastOrderDate: Date | null;
    }>([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'CANCELLED'] },
                    { $eq: ['$paymentInfo.status', 'paid'] },
                  ],
                },
                '$financials.orderTotal',
                0,
              ],
            },
          },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    return result || { orderCount: 0, totalSpent: 0, lastOrderDate: null };
  }

  /**
   * Returns recent orders for a specific user using the established { userId: 1, createdAt: -1 } index.
   */
  async findRecentOrdersByUserId(userId: Types.ObjectId, limit: number): Promise<IOrder[]> {
    return Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as unknown as IOrder[];
  }
}

export const orderRepository = new OrderRepository();
