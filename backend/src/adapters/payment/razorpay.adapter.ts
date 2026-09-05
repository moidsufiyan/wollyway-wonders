import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env.config.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/AppError.js';
import { HTTP_STATUS } from '../../constants/index.js';
import {
  IPaymentProvider,
  PaymentProviderType,
  CreatePaymentIntentInput,
  PaymentIntentResult,
  NormalizedWebhookEvent,
} from '../../types/payment.types.js';

export class RazorpayAdapter implements IPaymentProvider {
  public readonly providerName: PaymentProviderType = 'razorpay';
  private client: Razorpay | null = null;

  constructor() {
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      this.client = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  private getClient(): Razorpay {
    if (!this.client) {
      if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new AppError(
          'Razorpay credentials are not configured on server',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
      this.client = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    }
    return this.client;
  }

  /**
   * Reconciles whether an order already exists at Razorpay with this deterministic receipt.
   */
  public async findOrderByReceipt(receipt: string): Promise<PaymentIntentResult | null> {
    const razorpay = this.getClient();
    try {
      const response = (await razorpay.orders.all({ receipt })) as {
        entity?: string;
        count?: number;
        items?: Array<{
          id: string;
          amount: number | string;
          currency: string;
          receipt?: string;
          status: string;
        }>;
      };

      if (response && response.items && response.items.length > 0) {
        const order = response.items[0];
        logger.info(
          { gatewayOrderId: order.id, receipt, status: order.status },
          'Reconciled existing Razorpay order by deterministic receipt'
        );
        return {
          provider: this.providerName,
          clientReference: order.id,
          amount: typeof order.amount === 'string' ? parseInt(order.amount, 10) : order.amount,
          currency: order.currency,
          keyId: env.RAZORPAY_KEY_ID,
          extra: {
            receipt: order.receipt,
          },
        };
      }
      return null;
    } catch (err: unknown) {
      logger.error(
        { err, receipt },
        'Failed to query Razorpay orders by receipt for reconciliation'
      );
      throw new AppError(
        'Unable to reconcile payment gateway state. Please retry in a moment.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        { isUnknownOutcome: true }
      );
    }
  }

  /**
   * Generates a new Razorpay Order for customer checkout.
   */
  public async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const razorpay = this.getClient();

    // Deterministic receipt derived stably from checkoutSessionId (max 40 chars)
    const receipt = input.receipt || `rcpt_${input.checkoutSessionId}`;

    try {
      const order = await razorpay.orders.create({
        amount: input.amount, // Integer paisa (e.g. 249900 = ₹2,499.00)
        currency: 'INR',
        receipt,
        notes: {
          checkoutSessionId: input.checkoutSessionId,
          customerName: input.customer.name,
          customerEmail: input.customer.email,
          ...(input.notes || {}),
        },
      });

      logger.info(
        {
          provider: this.providerName,
          gatewayOrderId: order.id,
          checkoutSessionId: input.checkoutSessionId,
          amount: input.amount,
        },
        'Razorpay payment intent created successfully'
      );

      return {
        provider: this.providerName,
        clientReference: order.id,
        amount: order.amount as number,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
        extra: {
          receipt: order.receipt,
        },
      };
    } catch (err: unknown) {
      logger.error(
        {
          err,
          checkoutSessionId: input.checkoutSessionId,
        },
        'Failed to create Razorpay Order'
      );

      const anyErr = err as Record<string, unknown>;
      const statusCode = (anyErr?.statusCode as number) || (anyErr?.status as number);
      const isDefiniteRejection =
        typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;

      if (isDefiniteRejection) {
        const errObj = anyErr?.error as Record<string, unknown> | undefined;
        const desc =
          (errObj?.description as string) ||
          (anyErr?.message as string) ||
          'Provider rejected payment intent creation';
        throw new AppError(
          `Payment initialization rejected by provider: ${desc}`,
          HTTP_STATUS.BAD_REQUEST,
          { isDefiniteRejection: true }
        );
      }

      // Network errors, timeouts, connection resets, 5xx responses represent unknown gateway outcomes
      throw new AppError(
        'Payment gateway response timed out or is uncertain. Please retry in a moment.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        { isUnknownOutcome: true }
      );
    }
  }

  /**
   * Cryptographically verifies the raw webhook body using HMAC SHA256 and timingSafeEqual.
   * Defends against side-channel timing attacks and malformed/truncated signatures.
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!signature || typeof signature !== 'string' || !env.RAZORPAY_WEBHOOK_SECRET) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(signature.trim(), 'utf8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch (err) {
      logger.error({ err }, 'Exception during Razorpay webhook signature verification');
      return false;
    }
  }

  /**
   * Transforms the raw Razorpay webhook payload into a provider-agnostic event.
   */
  public normalizeWebhookEvent(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ): NormalizedWebhookEvent {
    let payload: Record<string, unknown>;

    try {
      payload =
        typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new AppError('Invalid JSON payload in webhook body', HTTP_STATUS.BAD_REQUEST);
    }

    const eventType = (payload.event as string) || 'unknown';
    const payloadContainer = (payload.payload as Record<string, unknown>) || {};
    const paymentEntity =
      ((payloadContainer.payment as Record<string, unknown>)?.entity as Record<string, unknown>) ||
      null;
    const orderEntity =
      ((payloadContainer.order as Record<string, unknown>)?.entity as Record<string, unknown>) ||
      null;

    // Resolve event ID (from header or composite fallback)
    const headerEventId =
      (headers['x-razorpay-event-id'] as string) || (headers['X-Razorpay-Event-Id'] as string);

    const transactionId = (paymentEntity?.id as string) || '';
    const gatewayOrderId = (paymentEntity?.order_id as string) || (orderEntity?.id as string) || '';

    const eventId =
      headerEventId ||
      (transactionId ? `${eventType}:${transactionId}` : `${eventType}:${gatewayOrderId}`);

    // Determine payment success
    const isPaymentSuccess =
      (eventType === 'payment.captured' && paymentEntity?.status === 'captured') ||
      (eventType === 'order.paid' && orderEntity?.status === 'paid');

    const amount = (paymentEntity?.amount ?? orderEntity?.amount ?? 0) as number;
    const currency = (paymentEntity?.currency ?? orderEntity?.currency ?? 'INR') as string;

    const createdAtSeconds = (paymentEntity?.created_at ??
      payload.created_at ??
      Math.floor(Date.now() / 1000)) as number;
    const paidAt = new Date(createdAtSeconds * 1000);

    const paymentNotes = (paymentEntity?.notes as Record<string, string>) || {};
    const orderNotes = (orderEntity?.notes as Record<string, string>) || {};

    const checkoutSessionId =
      paymentNotes.checkoutSessionId || orderNotes.checkoutSessionId || undefined;
    const userId = paymentNotes.userId || orderNotes.userId || undefined;

    return {
      eventId,
      eventType,
      isPaymentSuccess,
      provider: this.providerName,
      transactionId,
      gatewayOrderId,
      amount,
      currency,
      paidAt,
      metadata: {
        checkoutSessionId,
        userId,
      },
      rawPayload: payload,
    };
  }
}

export const razorpayAdapter = new RazorpayAdapter();
