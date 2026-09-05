import crypto from 'crypto';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { orderRepository } from '../repositories/order.repository.js';
import { checkoutRepository } from '../repositories/checkout.repository.js';
import { checkoutService } from './checkout.service.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { cartRepository } from '../repositories/cart.repository.js';
import { User } from '../models/user.model.js';
import { IOrder } from '../models/order.model.js';
import { orderMapper } from '../mappers/order.mapper.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, ORDER_CONSTANTS } from '../constants/index.js';
import {
  OrderDetailDTO,
  AdminOrderDetailDTO,
  PaginatedOrdersDTO,
  PaginatedAdminOrdersDTO,
  PaymentConfirmationPayload,
  AdminOrderFilterQuery,
  AdminStatusUpdatePayload,
} from '../types/order.types.js';
import { calculateOrderTotals } from '../utils/pricing.util.js';

export class OrderService {
  /**
   * Generates a collision-resistant human-readable order number.
   * Format: WW-YYYYMMDD-XXXX (Base32 Crockford uppercase excluding 0, O, 1, I).
   */
  private generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(4);
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars[bytes[i] % chars.length];
    }
    return `${ORDER_CONSTANTS.ORDER_NUMBER_PREFIX}-${dateStr}-${suffix}`;
  }

  /**
   * Orchestrates the transactional creation of an Order upon verified payment capture.
   *
   * Transaction Scope (ACID):
   * 1. Creates permanent Order document with frozen snapshots.
   * 2. Permanently commits inventory stock deductions.
   * 3. Transitions originating CheckoutSession to 'COMPLETED'.
   * 4. Clears user's shopping cart.
   *
   * Post-Commit Actions:
   * 5. Releases temporary Redis reservation locks.
   */
  public async createOrderFromCheckout(
    checkoutSessionId: string,
    payment: PaymentConfirmationPayload
  ): Promise<OrderDetailDTO> {
    if (!Types.ObjectId.isValid(checkoutSessionId)) {
      throw new AppError('Invalid checkout session ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const sessionObjectId = new Types.ObjectId(checkoutSessionId);

    // 1. Fast pre-flight idempotency lookup
    const existingBySession = await orderRepository.findByCheckoutSessionId(sessionObjectId);
    if (existingBySession) {
      return orderMapper.toDetailDTO(existingBySession);
    }

    if (payment.transactionId) {
      const existingByTx = await orderRepository.findByPaymentTransactionId(payment.transactionId);
      if (existingByTx) {
        return orderMapper.toDetailDTO(existingByTx);
      }
    }

    // 2. Fetch and validate checkout session eligibility
    const session = await checkoutRepository.findById(sessionObjectId);
    if (!session) {
      throw new AppError('Checkout session not found', HTTP_STATUS.NOT_FOUND);
    }

    if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(session.status)) {
      throw new AppError(
        `Cannot create order from a checkout session in ${session.status} state.`,
        HTTP_STATUS.CONFLICT
      );
    }

    if (!session.shippingAddressSnapshot) {
      throw new AppError(
        'Checkout session lacks verified shipping address snapshot.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (
      !session.cartSnapshot ||
      !session.cartSnapshot.items ||
      session.cartSnapshot.items.length === 0
    ) {
      throw new AppError('Checkout session does not contain any items.', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Fetch customer details for immutable receipt snapshot
    const user = await User.findById(session.userId).lean();
    if (!user) {
      throw new AppError('Associated customer account not found', HTTP_STATUS.NOT_FOUND);
    }

    const customerPhone = user.phone || user.addresses?.find((a) => a.isDefault)?.phone || 'N/A';

    // 4. Compute financial totals from frozen snapshots
    const subtotal = session.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);

    // 5. Execute Multi-Document ACID Transaction
    const mongoSession = await mongoose.startSession();
    let createdOrder: IOrder | null = null;

    try {
      await mongoSession.withTransaction(async () => {
        // Generate order number with collision retry loop
        let orderNumber = this.generateOrderNumber();
        for (let attempt = 0; attempt < ORDER_CONSTANTS.ORDER_NUMBER_MAX_RETRY; attempt++) {
          const exists = await orderRepository.findByOrderNumber(orderNumber);
          if (!exists) break;
          orderNumber = this.generateOrderNumber();
        }

        const orderPayload: Partial<IOrder> = {
          orderNumber,
          userId: session.userId,
          checkoutSessionId: session._id,
          customerSnapshot: {
            name: user.name,
            email: user.email,
            phone: customerPhone,
          },
          shippingAddress: {
            street: session.shippingAddressSnapshot!.street,
            city: session.shippingAddressSnapshot!.city,
            state: session.shippingAddressSnapshot!.state,
            postalCode: session.shippingAddressSnapshot!.postalCode,
            country: session.shippingAddressSnapshot!.country,
          },
          items: session.cartSnapshot.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            slug: i.slug,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
          })),
          financials: {
            subtotal,
            shippingFee,
            taxTotal,
            orderTotal,
            currency: 'INR',
          },
          paymentInfo: {
            provider: payment.provider,
            transactionId: payment.transactionId,
            status: 'paid',
            paidAt: payment.paidAt || new Date(),
          },
          status: 'CONFIRMED',
        };

        // 5a. Persist Order document
        createdOrder = await orderRepository.createOrder(orderPayload, mongoSession);

        // 5b. Permanently commit stock deduction for each item
        for (const item of session.cartSnapshot.items) {
          await inventoryRepository.deductStock(
            item.productId,
            item.quantity,
            createdOrder._id,
            session._id,
            mongoSession
          );
        }

        // 5c. Mark CheckoutSession COMPLETED
        await checkoutRepository.updateStatus(
          session._id,
          'COMPLETED',
          {
            paymentProvider: payment.provider,
            paymentIntentId: payment.transactionId,
          },
          mongoSession
        );

        // 5d. Clear user's shopping cart
        await cartRepository.clear(session.userId, mongoSession);
      });
    } catch (err: unknown) {
      // 6. Handle race-condition duplicate key errors gracefully (E11000)
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        const winningOrder = await orderRepository.findByCheckoutSessionId(sessionObjectId);
        if (winningOrder) {
          return orderMapper.toDetailDTO(winningOrder);
        }
      }
      throw err;
    } finally {
      await mongoSession.endSession();
    }

    // 7. Post-Transaction Action: Release temporary Redis reservation locks
    try {
      await checkoutService.releaseSessionLocks(session._id.toString(), session.cartSnapshot.items);
    } catch (redisErr) {
      // Non-fatal: Redis keys will naturally expire via 15m TTL
      console.warn(`⚠️ Failed to release Redis locks for session ${session._id}:`, redisErr);
    }

    if (!createdOrder) {
      throw new AppError('Failed to create order document', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return orderMapper.toDetailDTO(createdOrder);
  }

  /**
   * Retrieves paginated order history for the authenticated customer.
   */
  public async getMyOrders(
    userId: string,
    page: number = ORDER_CONSTANTS.DEFAULT_PAGE,
    limit: number = ORDER_CONSTANTS.DEFAULT_LIMIT
  ): Promise<PaginatedOrdersDTO> {
    const userObjectId = new Types.ObjectId(userId);
    const validatedLimit = Math.min(limit, ORDER_CONSTANTS.MAX_LIMIT_CUSTOMER);
    const skip = (page - 1) * validatedLimit;

    const { orders, total } = await orderRepository.findByUserId(
      userObjectId,
      skip,
      validatedLimit
    );

    return {
      orders: orders.map((o) => orderMapper.toSummaryDTO(o)),
      pagination: {
        page,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit) || 1,
      },
    };
  }

  /**
   * Retrieves order details for a customer with strict IDOR ownership enforcement.
   */
  public async getOrderById(userId: string, orderIdOrNumber: string): Promise<OrderDetailDTO> {
    let order: IOrder | null;

    if (Types.ObjectId.isValid(orderIdOrNumber)) {
      order = await orderRepository.findById(new Types.ObjectId(orderIdOrNumber));
    } else {
      order = await orderRepository.findByOrderNumber(orderIdOrNumber);
    }

    // IDOR Protection: Return 404 if not found or if the order belongs to another customer
    if (!order || order.userId.toString() !== userId) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    return orderMapper.toDetailDTO(order);
  }

  /**
   * Admin order search with status, order number, and date range filtering.
   */
  public async getAdminOrders(filters: AdminOrderFilterQuery): Promise<PaginatedAdminOrdersDTO> {
    const page = filters.page || ORDER_CONSTANTS.DEFAULT_PAGE;
    const limit = Math.min(
      filters.limit || ORDER_CONSTANTS.DEFAULT_LIMIT,
      ORDER_CONSTANTS.MAX_LIMIT_ADMIN
    );
    const skip = (page - 1) * limit;

    const filterQuery: FilterQuery<IOrder> = {};

    if (filters.status) {
      filterQuery.status = filters.status;
    }

    if (filters.orderNumber) {
      filterQuery.orderNumber = { $regex: filters.orderNumber.trim(), $options: 'i' };
    }

    if (filters.startDate || filters.endDate) {
      filterQuery.createdAt = {};
      if (filters.startDate) {
        filterQuery.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        filterQuery.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const { orders, total } = await orderRepository.findAdminOrders(filterQuery, skip, limit);

    return {
      orders: orders.map((o) => orderMapper.toAdminDetailDTO(o)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin order detail lookup by ID or Order Number.
   */
  public async getAdminOrderById(orderIdOrNumber: string): Promise<AdminOrderDetailDTO> {
    let order: IOrder | null;

    if (Types.ObjectId.isValid(orderIdOrNumber)) {
      order = await orderRepository.findById(new Types.ObjectId(orderIdOrNumber));
    } else {
      order = await orderRepository.findByOrderNumber(orderIdOrNumber);
    }

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    return orderMapper.toAdminDetailDTO(order);
  }

  /**
   * Admin fulfillment state machine mutations.
   */
  public async updateOrderStatus(
    orderId: string,
    payload: AdminStatusUpdatePayload
  ): Promise<AdminOrderDetailDTO> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const order = await orderRepository.findById(new Types.ObjectId(orderId));
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    const currentStatus = order.status;
    const targetStatus = payload.status;

    // Reject transitions from terminal states
    if (['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(currentStatus)) {
      throw new AppError(
        `Cannot modify an order that is already in a terminal state (${currentStatus}).`,
        HTTP_STATUS.CONFLICT
      );
    }

    // Redirect cancellation/refund requests to dedicated cancellation handler
    if (targetStatus === 'CANCELLED' || targetStatus === 'REFUNDED') {
      throw new AppError(
        `Use the dedicated cancellation endpoint to transition orders to ${targetStatus} and handle restocking.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate permitted state machine forward transitions
    const validTransitions: Record<string, string[]> = {
      CONFIRMED: ['PROCESSING', 'SHIPPED'],
      PROCESSING: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new AppError(
        `Invalid status transition from ${currentStatus} to ${targetStatus}. Allowed: ${allowed.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Build fulfillment update fields without spreading Mongoose subdocument
    const fulfillmentUpdates: Partial<IOrder['fulfillment']> = {
      carrier: payload.carrier !== undefined ? payload.carrier : order.fulfillment?.carrier,
      trackingNumber:
        payload.trackingNumber !== undefined
          ? payload.trackingNumber
          : order.fulfillment?.trackingNumber,
      shippedAt: order.fulfillment?.shippedAt,
      deliveredAt: order.fulfillment?.deliveredAt,
    };

    if (targetStatus === 'SHIPPED' && !fulfillmentUpdates.shippedAt) {
      fulfillmentUpdates.shippedAt = new Date();
    }
    if (targetStatus === 'DELIVERED' && !fulfillmentUpdates.deliveredAt) {
      fulfillmentUpdates.deliveredAt = new Date();
    }

    const updated = await orderRepository.updateStatus(order._id, targetStatus, {
      fulfillment: fulfillmentUpdates,
    });

    if (!updated) {
      throw new AppError('Failed to update order status', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return orderMapper.toAdminDetailDTO(updated);
  }

  /**
   * Idempotent Order cancellation and automatic inventory restocking.
   */
  public async cancelOrder(
    orderIdOrNumber: string,
    reason: string,
    userId?: string,
    isAdmin = false
  ): Promise<AdminOrderDetailDTO> {
    let order: IOrder | null;

    if (Types.ObjectId.isValid(orderIdOrNumber)) {
      order = await orderRepository.findById(new Types.ObjectId(orderIdOrNumber));
    } else {
      order = await orderRepository.findByOrderNumber(orderIdOrNumber);
    }

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    // Customer authorization check
    if (!isAdmin && userId && order.userId.toString() !== userId) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    // Idempotency: If already cancelled, return existing state without duplicate restocking
    if (order.status === 'CANCELLED') {
      return orderMapper.toAdminDetailDTO(order);
    }

    // State validation: Only CONFIRMED or PROCESSING orders can be cancelled
    if (!['CONFIRMED', 'PROCESSING'].includes(order.status)) {
      throw new AppError(
        `Cannot cancel an order in ${order.status} state. Only CONFIRMED or PROCESSING orders may be cancelled.`,
        HTTP_STATUS.CONFLICT
      );
    }

    // Execute atomic cancellation and restocking in MongoDB replica set transaction
    const mongoSession = await mongoose.startSession();
    let cancelledOrder: IOrder | null = null;

    try {
      await mongoSession.withTransaction(async () => {
        // 1. Transition status and write cancellation audit metadata
        cancelledOrder = await orderRepository.updateStatus(
          order._id,
          'CANCELLED',
          {
            cancellation: {
              reason: reason || 'Customer/Admin cancellation',
              cancelledAt: new Date(),
              cancelledBy: userId ? new Types.ObjectId(userId) : undefined,
            },
          },
          mongoSession
        );

        // 2. Restock all line items
        for (const item of order.items) {
          await inventoryRepository.restockProduct(
            item.productId,
            item.quantity,
            order._id,
            mongoSession
          );
        }
      });
    } finally {
      await mongoSession.endSession();
    }

    if (!cancelledOrder) {
      throw new AppError('Failed to cancel order', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return orderMapper.toAdminDetailDTO(cancelledOrder);
  }
}

export const orderService = new OrderService();
