import { IOrder } from '../models/order.model.js';
import { OrderSummaryDTO, OrderDetailDTO, OrderItemDTO } from '../types/order.types.js';
import { DashboardRecentOrderDTO } from '../types/dashboard.types.js';
import { AdminOrderSummaryDTO, AdminOrderDetailDTO } from '../types/admin-order.types.js';

export class OrderMapper {
  /**
   * Transforms an order document into a lightweight summary DTO for customer order history.
   */
  public toSummaryDTO(order: IOrder): OrderSummaryDTO {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      itemCount: totalQuantity,
      itemsPreview: order.items.map((item) => ({
        name: item.name,
        image: item.image,
        quantity: item.quantity,
      })),
      orderTotal: order.financials.orderTotal,
      currency: order.financials.currency,
      createdAt: order.createdAt,
    };
  }

  /**
   * Transforms an order document into a detailed receipt DTO for the purchasing customer.
   * Strips internal payment transaction IDs and admin audit metadata to avoid data leakage.
   */
  public toDetailDTO(order: IOrder): OrderDetailDTO {
    const items: OrderItemDTO[] = order.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity,
    }));

    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      items,
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
      financials: {
        subtotal: order.financials.subtotal,
        shippingFee: order.financials.shippingFee,
        taxTotal: order.financials.taxTotal,
        orderTotal: order.financials.orderTotal,
        currency: order.financials.currency,
      },
      paymentInfo: {
        provider: order.paymentInfo.provider,
        status: order.paymentInfo.status,
        paidAt: order.paymentInfo.paidAt,
      },
      fulfillment: order.fulfillment
        ? {
            carrier: order.fulfillment.carrier,
            trackingNumber: order.fulfillment.trackingNumber,
            shippedAt: order.fulfillment.shippedAt,
            deliveredAt: order.fulfillment.deliveredAt,
          }
        : {},
      createdAt: order.createdAt,
    };
  }

  /**
   * Transforms an order document into a comprehensive admin detail DTO with full audit metadata.
   */
  public toAdminOrderDetailDTO(order: IOrder): AdminOrderDetailDTO {
    const paymentStatus = order.paymentInfo.status === 'refunded' ? 'refunded' : 'paid';

    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      status: order.status,
      paymentStatus,
      customer: {
        id: order.userId.toString(),
        name: order.customerSnapshot.name,
        email: order.customerSnapshot.email,
        phone: order.customerSnapshot.phone || undefined,
      },
      shipping: {
        recipientName: order.customerSnapshot.name,
        phone: order.customerSnapshot.phone || undefined,
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
      items: order.items.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        slug: item.slug,
        image: item.image || undefined,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal: item.price * item.quantity,
      })),
      financials: {
        subtotal: order.financials.subtotal,
        shippingFee: order.financials.shippingFee,
        taxTotal: order.financials.taxTotal,
        orderTotal: order.financials.orderTotal,
        currency: order.financials.currency,
      },
      payment: {
        method: order.paymentInfo.provider,
        status: paymentStatus,
        transactionId: order.paymentInfo.transactionId || undefined,
        paidAt: order.paymentInfo.paidAt ? order.paymentInfo.paidAt.toISOString() : undefined,
        refundedAt: order.paymentInfo.refundedAt
          ? order.paymentInfo.refundedAt.toISOString()
          : undefined,
        refundId: order.paymentInfo.refundId || undefined,
        refundAmount: order.paymentInfo.refundAmount || undefined,
      },
      lifecycle: {
        status: order.status,
        paymentStatus,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        fulfillment: order.fulfillment
          ? {
              carrier: order.fulfillment.carrier || undefined,
              trackingNumber: order.fulfillment.trackingNumber || undefined,
              shippedAt: order.fulfillment.shippedAt
                ? order.fulfillment.shippedAt.toISOString()
                : undefined,
              deliveredAt: order.fulfillment.deliveredAt
                ? order.fulfillment.deliveredAt.toISOString()
                : undefined,
            }
          : undefined,
        cancellation: order.cancellation
          ? {
              reason: order.cancellation.reason || undefined,
              cancelledAt: order.cancellation.cancelledAt
                ? order.cancellation.cancelledAt.toISOString()
                : undefined,
              cancelledBy: order.cancellation.cancelledBy?.toString(),
            }
          : undefined,
      },
      fulfillment: order.fulfillment
        ? {
            carrier: order.fulfillment.carrier || undefined,
            trackingNumber: order.fulfillment.trackingNumber || undefined,
            shippedAt: order.fulfillment.shippedAt
              ? order.fulfillment.shippedAt.toISOString()
              : undefined,
            deliveredAt: order.fulfillment.deliveredAt
              ? order.fulfillment.deliveredAt.toISOString()
              : undefined,
          }
        : undefined,
      cancellation: order.cancellation
        ? {
            reason: order.cancellation.reason || undefined,
            cancelledAt: order.cancellation.cancelledAt
              ? order.cancellation.cancelledAt.toISOString()
              : undefined,
            cancelledBy: order.cancellation.cancelledBy?.toString(),
          }
        : undefined,
      history: (order.history || []).map((h) => ({
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy.toString(),
      })),
    };
  }

  /**
   * Transforms an order document into a lightweight DTO for admin dashboard display.
   */
  public toDashboardRecentOrderDTO(order: IOrder): DashboardRecentOrderDTO {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        name: order.customerSnapshot?.name || 'Customer',
        email: order.customerSnapshot?.email || '',
      },
      status: order.status,
      orderTotal: order.financials.orderTotal,
      currency: order.financials.currency,
      itemCount: totalQuantity,
      createdAt: order.createdAt,
    };
  }

  /**
   * Transforms an order document into a summary DTO for the admin listing page.
   */
  public toAdminOrderSummaryDTO(order: IOrder): AdminOrderSummaryDTO {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    // Default to 'paid' if the actual order isn't refunded, as Wollyway uses razorpay.
    // If we have proper tracking of refund status on the payment object, we'd use it here.
    const paymentStatus = order.paymentInfo.status === 'refunded' ? 'refunded' : 'paid';

    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        id: order.userId.toString(),
        displayName: order.customerSnapshot?.name || 'Customer',
        name: order.customerSnapshot?.name || 'Customer',
        email: order.customerSnapshot?.email || '',
      },
      status: order.status,
      paymentStatus,
      total: order.financials.orderTotal,
      currency: order.financials.currency,
      itemCount: totalQuantity,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

export const orderMapper = new OrderMapper();
