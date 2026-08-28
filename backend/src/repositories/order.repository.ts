import { ClientSession, FilterQuery, Types } from 'mongoose';
import { Order, IOrder } from '../models/order.model.js';
import { OrderStatus } from '../types/order.types.js';

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
    limit: number
  ): Promise<{ orders: IOrder[]; total: number }> {
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
   * Verifies whether a product is associated with active, unsettled orders.
   * Active states: CONFIRMED, PROCESSING, SHIPPED.
   * Terminal states (DELIVERED, CANCELLED, REFUNDED) do NOT block archival.
   */
  async hasActiveOrdersForProduct(productId: Types.ObjectId): Promise<boolean> {
    const count = await Order.countDocuments({
      'items.productId': productId,
      status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] },
    });
    return count > 0;
  }
}

export const orderRepository = new OrderRepository();
