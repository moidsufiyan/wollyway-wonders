import { IOrder } from '../models/order.model.js';
import {
  OrderSummaryDTO,
  OrderDetailDTO,
  AdminOrderDetailDTO,
  OrderItemDTO,
} from '../types/order.types.js';

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
  public toAdminDetailDTO(order: IOrder): AdminOrderDetailDTO {
    const baseDTO = this.toDetailDTO(order);

    return {
      ...baseDTO,
      userId: order.userId.toString(),
      customer: {
        name: order.customerSnapshot.name,
        email: order.customerSnapshot.email,
        phone: order.customerSnapshot.phone,
      },
      checkoutSessionId: order.checkoutSessionId.toString(),
      paymentTransactionId: order.paymentInfo.transactionId,
      cancellation: order.cancellation
        ? {
            reason: order.cancellation.reason,
            cancelledAt: order.cancellation.cancelledAt,
            cancelledBy: order.cancellation.cancelledBy?.toString(),
          }
        : undefined,
      updatedAt: order.updatedAt,
    };
  }
}

export const orderMapper = new OrderMapper();
