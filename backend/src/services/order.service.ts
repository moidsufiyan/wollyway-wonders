import crypto from 'crypto';
import { FilterQuery, Types } from 'mongoose';
import { orderRepository } from '../repositories/order.repository.js';
import { checkoutRepository } from '../repositories/checkout.repository.js';
import { checkoutService } from './checkout.service.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { cartRepository } from '../repositories/cart.repository.js';
import { User } from '../models/user.model.js';
import { Order, IOrder } from '../models/order.model.js';
import { PaymentProviderFactory } from '../adapters/payment/payment-provider.factory.js';
import { PaymentProviderType, RefundResult } from '../types/payment.types.js';
import { orderMapper } from '../mappers/order.mapper.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, ORDER_CONSTANTS } from '../constants/index.js';
import {
  OrderDetailDTO,
  PaginatedOrdersDTO,
  PaymentConfirmationPayload,
  AdminOrderFilterQuery,
  OrderStatus,
} from '../types/order.types.js';
import {
  AdminOrderQueryParams,
  AdminOrderListResult,
  AdminOrderDetailDTO,
  PaginatedAdminOrdersDTO,
} from '../types/admin-order.types.js';
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

    const customerPhone =
      user.phone ||
      user.addresses?.find((a: { isDefault?: boolean; phone?: string }) => a.isDefault)?.phone ||
      'N/A';

    // 4. Compute financial totals from frozen snapshots
    const subtotal = session.cartSnapshot.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const { shippingFee, taxTotal, orderTotal } = calculateOrderTotals(subtotal);

    let createdOrder: IOrder | undefined;

    try {
      // Bypassing transaction for local development without Replica Sets
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
      createdOrder = await orderRepository.createOrder(orderPayload, undefined);

      // 5b. Permanently commit stock deduction for each item
      for (const item of session.cartSnapshot.items) {
        await inventoryRepository.deductStock(
          item.productId,
          item.quantity,
          createdOrder._id,
          session._id,
          undefined
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
        undefined
      );

      // 5d. Remove checked-out items from user's shopping cart
      const productIdsToRemove = session.cartSnapshot.items.map((i) => i.productId);
      if (productIdsToRemove.length > 0) {
        await cartRepository.removeItems(session.userId, productIdsToRemove, undefined);
      }
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
   * Admin order list with comprehensive filters, search, and sorting.
   */
  public async listAdminOrders(params: AdminOrderQueryParams): Promise<AdminOrderListResult> {
    const page = params.page || ORDER_CONSTANTS.DEFAULT_PAGE;
    const limit = Math.min(
      params.limit || ORDER_CONSTANTS.DEFAULT_LIMIT,
      ORDER_CONSTANTS.MAX_LIMIT_ADMIN
    );
    const skip = (page - 1) * limit;

    const filterQuery: FilterQuery<IOrder> = {};

    if (params.status && params.status !== 'all') {
      filterQuery.status = params.status;
    }

    if (params.paymentStatus && params.paymentStatus !== 'all') {
      if (params.paymentStatus === 'paid') {
        filterQuery['paymentInfo.status'] = 'paid';
      } else if (params.paymentStatus === 'refunded') {
        filterQuery['paymentInfo.status'] = 'refunded';
      }
    }

    if (params.q) {
      const escapedQ = params.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filterQuery.$or = [
        { orderNumber: { $regex: escapedQ, $options: 'i' } },
        { 'customerSnapshot.email': { $regex: escapedQ, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: escapedQ, $options: 'i' } },
      ];
    }

    if (params.from || params.to) {
      filterQuery.createdAt = {};
      if (params.from) {
        filterQuery.createdAt.$gte = new Date(params.from);
      }
      if (params.to) {
        filterQuery.createdAt.$lte = new Date(params.to);
      }
    }

    const sortOptions: Record<string, 1 | -1> = {};
    const sort = params.sort || 'created_desc';
    switch (sort) {
      case 'created_asc':
        sortOptions.createdAt = 1;
        break;
      case 'created_desc':
        sortOptions.createdAt = -1;
        break;
      case 'total_asc':
        sortOptions['financials.orderTotal'] = 1;
        break;
      case 'total_desc':
        sortOptions['financials.orderTotal'] = -1;
        break;
      case 'orderNumber_asc':
        sortOptions.orderNumber = 1;
        break;
      case 'orderNumber_desc':
        sortOptions.orderNumber = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const { orders, total } = await orderRepository.findAdminOrders(
      filterQuery,
      skip,
      limit,
      sortOptions
    );

    return {
      success: true,
      results: orders.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
      },
      filters: {
        q: params.q,
        status: params.status,
        paymentStatus: params.paymentStatus,
        from: params.from,
        to: params.to,
      },
      sort,
      orders: orders.map((o) => orderMapper.toAdminOrderSummaryDTO(o)),
    };
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
      orders: orders.map((o) => orderMapper.toAdminOrderDetailDTO(o)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin order detail lookup by ID.
   */
  public async getAdminOrderById(orderId: string): Promise<AdminOrderDetailDTO> {
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID format', HTTP_STATUS.BAD_REQUEST);
    }

    const order = await orderRepository.findAdminOrderById(new Types.ObjectId(orderId));

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    return orderMapper.toAdminOrderDetailDTO(order);
  }

  /**
   * Admin fulfillment state machine mutations.
   */
  public async updateOrderStatus(
    orderId: string,
    payload: { status: string; carrier?: string; trackingNumber?: string; notes?: string },
    adminId?: string
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
    if (['DELIVERED', 'CANCELLED'].includes(currentStatus)) {
      throw new AppError(
        `Cannot modify an order that is already in a terminal state (${currentStatus}).`,
        HTTP_STATUS.CONFLICT
      );
    }

    // Redirect cancellation/refund requests to dedicated cancellation handler
    if (targetStatus === 'CANCELLED') {
      throw new AppError(
        `Use the dedicated cancellation endpoint to transition orders to ${targetStatus} and handle restocking.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate permitted state machine forward transitions
    const validTransitions: Record<string, string[]> = {
      CONFIRMED: ['PROCESSING'],
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

    const historyEntry = {
      previousStatus: currentStatus,
      newStatus: targetStatus as OrderStatus,
      changedAt: new Date(),
      changedBy: adminId ? new Types.ObjectId(adminId) : new Types.ObjectId(),
    };

    // Build fulfillment update fields preserving existing Mongoose subdocument
    const fulfillmentUpdates: Partial<IOrder['fulfillment']> = {
      carrier: payload.carrier || order.fulfillment?.carrier,
      trackingNumber: payload.trackingNumber || order.fulfillment?.trackingNumber,
      shippedAt: order.fulfillment?.shippedAt,
      deliveredAt: order.fulfillment?.deliveredAt,
    };

    if (targetStatus === 'SHIPPED' && !fulfillmentUpdates.shippedAt) {
      fulfillmentUpdates.shippedAt = new Date();
    }
    if (targetStatus === 'DELIVERED' && !fulfillmentUpdates.deliveredAt) {
      fulfillmentUpdates.deliveredAt = new Date();
    }

    const updated = await orderRepository.updateStatusAtomic(
      order._id,
      currentStatus as OrderStatus,
      targetStatus as OrderStatus,
      historyEntry,
      { fulfillment: fulfillmentUpdates }
    );

    if (!updated) {
      throw new AppError(
        'Conflict: Order status was modified concurrently. Please refresh and try again.',
        HTTP_STATUS.CONFLICT
      );
    }

    return orderMapper.toAdminOrderDetailDTO(updated);
  }

  /**
   * Idempotent Order cancellation and automatic inventory restocking with
   * distributed payment/MongoDB consistency and refund reconciliation.
   */
  public async cancelOrder(
    orderIdOrNumber: string,
    reason?: string,
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

    // Fast Idempotency: If already CANCELLED and (already refunded or unpaid), return existing state
    const isPaid = order.paymentInfo?.status === 'paid';
    const isAlreadyRefunded =
      order.paymentInfo?.status === 'refunded' || order.paymentInfo?.refundStatus === 'completed';

    if (order.status === 'CANCELLED' && (!isPaid || isAlreadyRefunded)) {
      return orderMapper.toAdminOrderDetailDTO(order);
    }

    // State validation: Only CONFIRMED or PROCESSING orders can be cancelled (or CANCELLED if finalizing interrupted refund)
    if (order.status !== 'CANCELLED' && !['CONFIRMED', 'PROCESSING'].includes(order.status)) {
      throw new AppError(
        `Cannot cancel an order in ${order.status} state. Only CONFIRMED or PROCESSING orders may be cancelled.`,
        HTTP_STATUS.CONFLICT
      );
    }

    let refundId = order.paymentInfo?.refundId;
    let refundAmount =
      order.paymentInfo?.refundAmount || Math.round(order.financials.orderTotal * 100);

    // If order is paid and not yet definitively refunded:
    if (isPaid && !isAlreadyRefunded) {
      // Step 2A: Check if refundId is already persisted from a previous attempt
      if (!refundId) {
        // Step 2B: Concurrency protection via atomic compare-and-set
        // Only one concurrent request may claim not_started/unknown -> pending
        const claimed = await orderRepository.claimRefundOperation(order._id);
        if (!claimed) {
          // Check if another request already completed it or is actively pending
          const reloaded = await orderRepository.findById(order._id);
          if (
            reloaded?.paymentInfo?.refundStatus === 'completed' &&
            reloaded?.paymentInfo?.refundId
          ) {
            refundId = reloaded.paymentInfo.refundId;
            refundAmount = reloaded.paymentInfo.refundAmount || refundAmount;
          } else if (reloaded?.paymentInfo?.refundStatus === 'pending') {
            throw new AppError(
              'A refund operation is currently pending for this order. Please retry in a moment.',
              HTTP_STATUS.CONFLICT
            );
          } else {
            throw new AppError(
              'Unable to initiate refund due to concurrent state modification. Please retry.',
              HTTP_STATUS.CONFLICT
            );
          }
        } else {
          // Step 2C: Reconcile before calling provider
          // Query Razorpay to see if a matching refund was already created
          const provider = PaymentProviderFactory.getProvider(
            (order.paymentInfo.provider as PaymentProviderType) || 'razorpay'
          );
          const deterministicReceipt = `ref_${order.orderNumber}`.slice(0, 40);
          const amountInPaisa = Math.round(order.financials.orderTotal * 100);

          let providerRefund: RefundResult | null = null;
          if (provider.findRefundByReceipt) {
            providerRefund = await provider.findRefundByReceipt(
              deterministicReceipt,
              order.paymentInfo.transactionId,
              amountInPaisa
            );
          }

          if (!providerRefund) {
            try {
              providerRefund = await provider.refundPayment({
                transactionId: order.paymentInfo.transactionId,
                amount: amountInPaisa,
                currency: order.financials.currency || 'INR',
                receipt: deterministicReceipt,
                notes: {
                  orderId: order._id.toString(),
                  orderNumber: order.orderNumber,
                  cancelledBy: userId || 'admin',
                  reason: reason || 'Admin order cancellation',
                },
              });
            } catch (err: unknown) {
              // On unknown outcome (5xx, timeout, network error):
              // Durably mark refundStatus = 'unknown'
              await orderRepository.updatePaymentRefundState(order._id, {
                refundStatus: 'unknown',
              });
              // Rethrow the error so order is NOT marked CANCELLED and inventory is NOT restocked
              throw err;
            }
          }

          // Step 2D: IMMEDIATELY and DURABLY persist refundId and refundStatus = 'completed'
          // This survives any failure in the subsequent MongoDB transaction!
          refundId = providerRefund.refundId;
          refundAmount = providerRefund.amount;
          await orderRepository.updatePaymentRefundState(order._id, {
            refundStatus: 'completed',
            refundId,
            refundedAt: new Date(),
            refundAmount,
          });
        }
      }
    }

    // Step 3: Atomic Local MongoDB ACID Transaction
    // Re-read order
    const currentOrder = await Order.findById(order._id);
    if (!currentOrder) {
      throw new AppError('Order not found during transaction', HTTP_STATUS.NOT_FOUND);
    }

    const updateSet: Record<string, unknown> = {};
    const updatePush: Record<string, unknown> = {};

    // Only transition status and push history if not already CANCELLED
    if (currentOrder.status !== 'CANCELLED') {
      updateSet.status = 'CANCELLED';
      updateSet.cancellation = {
        reason: reason || 'Customer/Admin cancellation',
        cancelledAt: new Date(),
        cancelledBy: userId ? new Types.ObjectId(userId) : undefined,
      };
      updatePush.history = {
        previousStatus: currentOrder.status,
        newStatus: 'CANCELLED',
        changedAt: new Date(),
        changedBy: userId ? new Types.ObjectId(userId) : new Types.ObjectId(),
      };
    }

    // Finalize payment state
    if (isPaid || refundId) {
      updateSet['paymentInfo.status'] = 'refunded';
      updateSet['paymentInfo.refundStatus'] = 'completed';
      if (refundId) updateSet['paymentInfo.refundId'] = refundId;
      updateSet['paymentInfo.refundedAt'] = currentOrder.paymentInfo.refundedAt || new Date();
      if (refundAmount) updateSet['paymentInfo.refundAmount'] = refundAmount;
    }

    const updateDoc: Record<string, unknown> = { $set: updateSet };
    if (Object.keys(updatePush).length > 0) {
      updateDoc.$push = updatePush;
    }

    const finalOrder = await Order.findByIdAndUpdate(order._id, updateDoc, {
      new: true,
    });

    // Restock inventory line items
    // decrementSold is true only if order was verified-paid and inventory was actually consumed
    const shouldDecrementSold = isPaid;
    for (const item of currentOrder.items) {
      await inventoryRepository.restockProduct(
        item.productId,
        item.quantity,
        currentOrder._id,
        undefined,
        shouldDecrementSold
      );
    }

    if (!finalOrder) {
      throw new AppError(
        'Failed to finalize order cancellation',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return orderMapper.toAdminOrderDetailDTO(finalOrder);
  }
}

export const orderService = new OrderService();
