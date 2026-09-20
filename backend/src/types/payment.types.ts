import { PaymentConfirmationPayload } from './order.types.js';

export type PaymentProviderType = 'razorpay' | 'stripe';

export type { PaymentConfirmationPayload };

export interface CreatePaymentIntentInput {
  checkoutSessionId: string;
  amount: number; // Integer paisa (e.g. 249900 for ₹2,499.00)
  currency: string; // 'INR'
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: Record<string, string>;
  receipt?: string;
}

export interface PaymentIntentResult {
  provider: PaymentProviderType;
  clientReference: string; // Gateway Order ID (Razorpay order_id) or Client Secret (Stripe)
  amount: number;
  currency: string;
  keyId?: string; // Public API key required by frontend SDK
  extra?: Record<string, unknown>;
}

export interface NormalizedWebhookEvent {
  eventId: string;
  eventType: string;
  isPaymentSuccess: boolean;
  provider: PaymentProviderType;
  transactionId: string; // Gateway payment / charge ID (e.g. pay_xxx)
  gatewayOrderId: string; // Gateway order ID (e.g. order_xxx)
  amount: number; // Integer paisa
  currency: string;
  paidAt: Date;
  metadata: {
    checkoutSessionId?: string;
    userId?: string;
  };
  rawPayload: Record<string, unknown>;
}

export interface WebhookProcessingResult {
  status: 'PROCESSED' | 'DUPLICATE' | 'IGNORED' | 'FAILED';
  statusCode: 200 | 400 | 401 | 500;
  message: string;
  orderId?: string;
  orderNumber?: string;
}

export interface RefundPaymentInput {
  transactionId: string;
  amount: number; // in currency sub-units (e.g. paisa)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RefundResult {
  refundId: string;
  amount: number; // in currency sub-units (e.g. paisa)
  currency: string;
  status: 'processed' | 'pending' | 'failed';
  /**
   * Internal adapter raw response. Never exposed in API DTOs.
   */
  rawResponse?: Record<string, unknown>;
}

export interface IPaymentProvider {
  readonly providerName: PaymentProviderType;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  findOrderByReceipt?(receipt: string): Promise<PaymentIntentResult | null>;
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;
  normalizeWebhookEvent(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ): NormalizedWebhookEvent;
  refundPayment(input: RefundPaymentInput): Promise<RefundResult>;
  findRefundByReceipt?(
    receipt: string,
    transactionId: string,
    expectedAmount?: number
  ): Promise<RefundResult | null>;
}
