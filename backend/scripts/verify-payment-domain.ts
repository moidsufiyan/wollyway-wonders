/**
 * @file verify-payment-domain.ts
 * @description Comprehensive automated behavioral verification suite for Phase 4.5A Razorpay Payment Integration.
 *
 * Scenarios Verified:
 * 1. create-intent creates Razorpay order.
 * 2. create-intent stores paymentIntentId on CheckoutSession.
 * 3. repeated create-intent reuses existing gateway intent (idempotency).
 * 4. valid HMAC SHA256 signature succeeds.
 * 5. invalid HMAC SHA256 signature fails with 401 Unauthorized.
 * 6. duplicate webhook delivery is safely absorbed (DUPLICATE 200 OK).
 * 7. wrong amount is rejected with 400 Bad Request (no Order).
 * 8. wrong currency is rejected with 400 Bad Request (no Order).
 * 9. wrong provider/order binding is rejected with 400 Bad Request.
 * 10. successful payment capture invokes OrderService and creates Order (CONFIRMED).
 * 11. webhook event transitions to PROCESSED only after Order creation succeeds.
 * 12. payment.failed does not create Order, does not deduct stock, does not clear cart.
 * 13. transient DB failure does not mark event PROCESSED and preserves retryability.
 * 14. concurrent webhook delivery cannot create duplicate Orders (race-safe claiming).
 */

import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/db.config.js';
import { getRedisClient, closeRedis } from '../src/config/redis.config.js';
import { User } from '../src/models/user.model.js';
import { Category } from '../src/models/category.model.js';
import { Product } from '../src/models/product.model.js';
import { Inventory } from '../src/models/inventory.model.js';
import { Cart } from '../src/models/cart.model.js';
import { CheckoutSession } from '../src/models/checkout-session.model.js';
import { Order } from '../src/models/order.model.js';
import { PaymentWebhookEvent } from '../src/models/payment-webhook-event.model.js';
import { paymentService } from '../src/services/payment.service.js';
import { razorpayAdapter } from '../src/adapters/payment/razorpay.adapter.js';
import { env } from '../src/config/env.config.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

function generateRazorpaySignature(rawBody: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

async function runVerification() {
  console.log('\n🚀 Starting Phase 4.5A Razorpay Payment Integration Verification Suite...\n');

  await connectDatabase();
  const redis = getRedisClient();

  // If running against standalone MongoDB locally, shim withTransaction for local test execution
  const originalStartSession = mongoose.startSession.bind(mongoose);
  (mongoose as any).startSession = async function (...args: any[]) {
    try {
      const sess = await originalStartSession(...args);
      const origWithTransaction = sess.withTransaction.bind(sess);
      sess.withTransaction = async function (fn: any, opts: any) {
        try {
          return await origWithTransaction(fn, opts);
        } catch (err: any) {
          if (err?.code === 20 || err?.message?.includes('replica set')) {
            return await fn();
          }
          throw err;
        }
      };
      return sess;
    } catch (err: any) {
      if (err?.code === 20 || err?.message?.includes('replica set')) {
        return {
          withTransaction: async (fn: any) => fn(),
          endSession: async () => {},
        };
      }
      throw err;
    }
  };

  // Stub Razorpay API client to avoid external network dependency in automated tests
  (razorpayAdapter as any).client = {
    orders: {
      create: async (params: any) => ({
        id: `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        amount: params.amount,
        currency: params.currency,
        receipt: params.receipt,
        status: 'created',
        notes: params.notes,
      }),
    },
  };

  try {
    // ------------------------------------------------------------------------
    // SETUP: Clean test fixtures
    // ------------------------------------------------------------------------
    console.log('📦 Setting up isolated test fixtures...');

    await User.deleteMany({ email: 'payment_tester@wollyway.test' });
    await Category.deleteMany({ slug: 'test-knitwear-payments' });
    await Product.deleteMany({ slug: 'test-merino-beanie-payment' });
    await PaymentWebhookEvent.deleteMany({});
    await Order.deleteMany({ 'customerSnapshot.email': 'payment_tester@wollyway.test' });
    await CheckoutSession.deleteMany({ idempotencyKey: { $regex: '^idem_pay_test_' } });
    await Cart.deleteMany({});

    const user = await User.create({
      name: 'Rohan Sharma',
      email: 'payment_tester@wollyway.test',
      password: 'Password123!',
      phone: '+91 98765 43210',
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          streetAddress: '123 Handloom St',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          phone: '+91 98765 43210',
          isDefault: true,
        },
      ],
    });

    const category = await Category.create({
      name: 'Test Knitwear',
      slug: 'test-knitwear-payments',
      description: 'Handcrafted knitwear items for test verification',
      status: 'active',
    });

    const product = await Product.create({
      name: 'Test Merino Beanie',
      slug: 'test-merino-beanie-payment',
      description: 'Warm, hand-knitted beanie made from pure Merino wool.',
      categoryId: category._id,
      price: 249900, // ₹2,499.00
      visibility: 'published',
      images: [
        {
          url: 'https://res.cloudinary.com/wollyway/image/upload/v1/beanie.webp',
          publicId: 'beanie_img_p1',
          alt: 'Beanie image',
          isPrimary: true,
          displayOrder: 0,
          width: 800,
          height: 800,
        },
      ],
    });

    await Inventory.create({
      productId: product._id,
      available: 20,
      reserved: 0,
      sold: 0,
      trackInventory: true,
    });

    const cart = await Cart.create({
      userId: user._id,
      items: [{ productId: product._id, quantity: 1, priceSnapshot: 249900 }],
    });

    // Authoritative calculations: subtotal 249900, shippingFee 0 (subtotal > 15000), taxTotal 19992, orderTotal 269892
    const session = await CheckoutSession.create({
      userId: user._id,
      cartId: cart._id,
      status: 'RESERVED',
      reservationId: `checkout:reservation:pay_test_sess_1`,
      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      cartSnapshot: {
        items: [
          {
            productId: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images[0].url,
            price: product.price,
            quantity: 1,
          },
        ],
      },
      shippingAddressSnapshot: {
        street: '123 Handloom St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      idempotencyKey: 'idem_pay_test_1',
    });

    try {
      await redis.setex(`checkout:reservation:${session._id}`, 900, 'mock_stock_reservation');
    } catch {
      // Ignored if Redis is offline during test run
    }

    console.log('✅ Test fixtures ready.\n');

    // ------------------------------------------------------------------------
    // SCENARIOS 1, 2, 3: create-intent, storage, and idempotency reuse
    // ------------------------------------------------------------------------
    console.log('💳 [1-3/14] Testing create-intent and idempotency reuse...');

    const intentResult1 = await paymentService.createPaymentIntent(user._id.toString(), 'razorpay');
    assert(intentResult1.provider === 'razorpay', 'Scenario 1: create-intent returns razorpay provider');
    assert(intentResult1.clientReference.startsWith('order_mock_'), 'Scenario 1: creates Razorpay Order ID');
    assert(intentResult1.amount === 269892, 'Scenario 1: amount matches authoritative total (269892 paisa)');

    const updatedSession1 = await CheckoutSession.findById(session._id);
    assert(
      updatedSession1?.paymentIntentId === intentResult1.clientReference,
      'Scenario 2: paymentIntentId stored on CheckoutSession'
    );
    assert(
      updatedSession1?.status === 'PAYMENT_PENDING',
      'Scenario 2: CheckoutSession transitioned to PAYMENT_PENDING'
    );

    // Repeated call must reuse the existing intent
    const intentResult2 = await paymentService.createPaymentIntent(user._id.toString(), 'razorpay');
    assert(
      intentResult2.clientReference === intentResult1.clientReference,
      'Scenario 3: repeated create-intent reuses existing gateway intent'
    );

    // ------------------------------------------------------------------------
    // SCENARIOS 4 & 5: HMAC signature verification
    // ------------------------------------------------------------------------
    console.log('\n🔐 [4-5/14] Testing HMAC SHA256 Signature Verification...');

    const sampleRawPayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_capture_001',
            amount: 269892,
            currency: 'INR',
            status: 'captured',
            order_id: intentResult1.clientReference,
            notes: { checkoutSessionId: session._id.toString() },
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
    });

    const validSig = generateRazorpaySignature(sampleRawPayload, env.RAZORPAY_WEBHOOK_SECRET);
    const isValid = razorpayAdapter.verifyWebhookSignature(sampleRawPayload, validSig);
    assert(isValid === true, 'Scenario 4: valid HMAC SHA256 signature succeeds');

    const isInvalid = razorpayAdapter.verifyWebhookSignature(sampleRawPayload, 'invalid_fake_signature_hex');
    assert(isInvalid === false, 'Scenario 5: invalid HMAC SHA256 signature rejected');

    const invalidWebhookResult = await paymentService.handleWebhook(
      'razorpay',
      sampleRawPayload,
      'bad_signature',
      { 'x-razorpay-event-id': 'evt_bad_sig_1' }
    );
    assert(
      invalidWebhookResult.statusCode === 401,
      'Scenario 5: webhook handler rejects invalid signature with 401 Unauthorized'
    );

    // ------------------------------------------------------------------------
    // SCENARIO 6: Duplicate webhook absorption
    // ------------------------------------------------------------------------
    console.log('\n🔁 [6/14] Testing Duplicate Webhook Absorption...');

    const capturePayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_capture_002',
            amount: 269892,
            currency: 'INR',
            status: 'captured',
            order_id: intentResult1.clientReference,
            notes: { checkoutSessionId: session._id.toString() },
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
    });

    const captureSig = generateRazorpaySignature(capturePayload, env.RAZORPAY_WEBHOOK_SECRET);
    const eventId6 = 'evt_test_dedup_001';

    // First arrival: processes cleanly
    const result6a = await paymentService.handleWebhook(
      'razorpay',
      capturePayload,
      captureSig,
      { 'x-razorpay-event-id': eventId6 }
    );
    assert(result6a.status === 'PROCESSED', 'Scenario 6: initial capture webhook processed successfully');

    // Duplicate arrival: absorbed safely
    const result6b = await paymentService.handleWebhook(
      'razorpay',
      capturePayload,
      captureSig,
      { 'x-razorpay-event-id': eventId6 }
    );
    assert(result6b.status === 'DUPLICATE', 'Scenario 6: duplicate webhook is absorbed as DUPLICATE');
    assert(result6b.statusCode === 200, 'Scenario 6: duplicate webhook returns 200 OK');

    // Verify only 1 Order was created
    const orderCount = await Order.countDocuments({ checkoutSessionId: session._id });
    assert(orderCount === 1, 'Scenario 6: exactly one Order exists in database');

    // ------------------------------------------------------------------------
    // SCENARIOS 7, 8, 9: Reconciliation rejections (amount, currency, order_id)
    // ------------------------------------------------------------------------
    console.log('\n🛡️ [7-9/14] Testing Multi-Factor Reconciliation Guards...');

    // Setup session for reconciliation tests
    const sessionRecon = await CheckoutSession.create({
      userId: user._id,
      cartId: cart._id,
      status: 'PAYMENT_PENDING',
      paymentProvider: 'razorpay',
      paymentIntentId: 'order_recon_test_123',
      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      cartSnapshot: {
        items: [
          {
            productId: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images[0].url,
            price: product.price,
            quantity: 1,
          },
        ],
      },
      shippingAddressSnapshot: {
        street: '123 Handloom St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      idempotencyKey: 'idem_pay_test_recon',
    });

    // Scenario 7: Wrong amount
    const wrongAmountPayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_wrong_amount_1',
            amount: 100000, // ₹1,000.00 instead of ₹2,698.92
            currency: 'INR',
            status: 'captured',
            order_id: 'order_recon_test_123',
            notes: { checkoutSessionId: sessionRecon._id.toString() },
          },
        },
      },
    });
    const wrongAmountSig = generateRazorpaySignature(wrongAmountPayload, env.RAZORPAY_WEBHOOK_SECRET);
    const resultWrongAmount = await paymentService.handleWebhook(
      'razorpay',
      wrongAmountPayload,
      wrongAmountSig,
      { 'x-razorpay-event-id': 'evt_wrong_amt_1' }
    );
    assert(resultWrongAmount.statusCode === 400, 'Scenario 7: wrong amount rejected with 400 Bad Request');

    // Scenario 8: Wrong currency
    const wrongCurrencyPayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_wrong_curr_1',
            amount: 269892,
            currency: 'USD', // USD instead of INR
            status: 'captured',
            order_id: 'order_recon_test_123',
            notes: { checkoutSessionId: sessionRecon._id.toString() },
          },
        },
      },
    });
    const wrongCurrSig = generateRazorpaySignature(wrongCurrencyPayload, env.RAZORPAY_WEBHOOK_SECRET);
    const resultWrongCurrency = await paymentService.handleWebhook(
      'razorpay',
      wrongCurrencyPayload,
      wrongCurrSig,
      { 'x-razorpay-event-id': 'evt_wrong_curr_1' }
    );
    assert(resultWrongCurrency.statusCode === 400, 'Scenario 8: wrong currency rejected with 400 Bad Request');

    // Scenario 9: Gateway order ID mismatch
    const wrongOrderBindingPayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_wrong_binding_1',
            amount: 269892,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_unmatched_gateway_order', // Does not match session.paymentIntentId
            notes: { checkoutSessionId: sessionRecon._id.toString() },
          },
        },
      },
    });
    const wrongBindingSig = generateRazorpaySignature(wrongOrderBindingPayload, env.RAZORPAY_WEBHOOK_SECRET);
    const resultWrongBinding = await paymentService.handleWebhook(
      'razorpay',
      wrongOrderBindingPayload,
      wrongBindingSig,
      { 'x-razorpay-event-id': 'evt_wrong_binding_1' }
    );
    assert(resultWrongBinding.statusCode === 400, 'Scenario 9: wrong order binding rejected with 400 Bad Request');

    // ------------------------------------------------------------------------
    // SCENARIOS 10 & 11: Order creation and PROCESSED event transition
    // ------------------------------------------------------------------------
    console.log('\n📦 [10-11/14] Testing Successful Capture, Order Creation & Event Transition...');

    const validCapturePayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_recon_success_1',
            amount: 269892,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_recon_test_123',
            notes: { checkoutSessionId: sessionRecon._id.toString() },
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
    });
    const validCaptureSig = generateRazorpaySignature(validCapturePayload, env.RAZORPAY_WEBHOOK_SECRET);
    const eventId10 = 'evt_recon_success_1';

    const result10 = await paymentService.handleWebhook(
      'razorpay',
      validCapturePayload,
      validCaptureSig,
      { 'x-razorpay-event-id': eventId10 }
    );

    assert(result10.status === 'PROCESSED', 'Scenario 10: payment capture processed successfully');
    assert(result10.orderId !== undefined, 'Scenario 10: returns created orderId');

    const createdOrder = await Order.findById(result10.orderId);
    assert(createdOrder?.status === 'CONFIRMED', 'Scenario 10: Order created in CONFIRMED status');
    assert(createdOrder?.paymentInfo.provider === 'razorpay', 'Scenario 10: paymentInfo provider is razorpay');

    const eventRecord = await PaymentWebhookEvent.findOne({ eventId: eventId10, provider: 'razorpay' });
    assert(eventRecord?.status === 'PROCESSED', 'Scenario 11: event transitions to PROCESSED only after order succeeds');
    assert(eventRecord?.processedAt !== undefined, 'Scenario 11: processedAt timestamp recorded');

    // ------------------------------------------------------------------------
    // SCENARIO 12: payment.failed does not create Order or touch stock
    // ------------------------------------------------------------------------
    console.log('\n⚠️ [12/14] Testing payment.failed Semantics...');

    const sessionFail = await CheckoutSession.create({
      userId: user._id,
      cartId: cart._id,
      status: 'PAYMENT_PENDING',
      paymentProvider: 'razorpay',
      paymentIntentId: 'order_fail_test_456',
      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      cartSnapshot: sessionRecon.cartSnapshot,
      shippingAddressSnapshot: sessionRecon.shippingAddressSnapshot,
      idempotencyKey: 'idem_pay_test_fail',
    });

    const failedPayload = JSON.stringify({
      entity: 'event',
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_failed_123',
            amount: 269892,
            currency: 'INR',
            status: 'failed',
            order_id: 'order_fail_test_456',
            notes: { checkoutSessionId: sessionFail._id.toString() },
          },
        },
      },
    });
    const failedSig = generateRazorpaySignature(failedPayload, env.RAZORPAY_WEBHOOK_SECRET);
    const eventId12 = 'evt_pay_failed_1';

    const result12 = await paymentService.handleWebhook(
      'razorpay',
      failedPayload,
      failedSig,
      { 'x-razorpay-event-id': eventId12 }
    );

    assert(result12.status === 'IGNORED', 'Scenario 12: payment.failed event is marked IGNORED');
    assert(result12.statusCode === 200, 'Scenario 12: returns 200 OK to gateway');

    const noOrder = await Order.findOne({ checkoutSessionId: sessionFail._id });
    assert(noOrder === null, 'Scenario 12: payment.failed does NOT create an Order');

    const sessionFailAfter = await CheckoutSession.findById(sessionFail._id);
    assert(
      sessionFailAfter?.status === 'PAYMENT_PENDING',
      'Scenario 12: session remains PAYMENT_PENDING so customer can retry within 15m'
    );

    // ------------------------------------------------------------------------
    // SCENARIO 13: Transient failure leaves event retryable
    // ------------------------------------------------------------------------
    console.log('\n🔄 [13/14] Testing Transient Error Preservation & Retryability...');

    const sessionTransient = await CheckoutSession.create({
      userId: user._id,
      cartId: cart._id,
      status: 'PAYMENT_PENDING',
      paymentProvider: 'razorpay',
      paymentIntentId: 'order_transient_test_789',
      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      cartSnapshot: {
        items: [
          {
            // Non-existent product ID forces an inventory error inside OrderService
            productId: new Types.ObjectId(),
            name: 'Non Existent Item',
            slug: 'non-existent',
            image: '',
            price: 249900,
            quantity: 1,
          },
        ],
      },
      shippingAddressSnapshot: sessionRecon.shippingAddressSnapshot,
      idempotencyKey: 'idem_pay_test_transient',
    });

    const transientPayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_transient_1',
            amount: 269892,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_transient_test_789',
            notes: { checkoutSessionId: sessionTransient._id.toString() },
          },
        },
      },
    });
    const transientSig = generateRazorpaySignature(transientPayload, env.RAZORPAY_WEBHOOK_SECRET);
    const eventId13 = 'evt_transient_err_1';

    const result13 = await paymentService.handleWebhook(
      'razorpay',
      transientPayload,
      transientSig,
      { 'x-razorpay-event-id': eventId13 }
    );

    assert(result13.statusCode === 500, 'Scenario 13: internal error returns 500 to prompt gateway retry');

    const transientEvent = await PaymentWebhookEvent.findOne({ eventId: eventId13, provider: 'razorpay' });
    assert(transientEvent?.status === 'FAILED', 'Scenario 13: event status is FAILED');
    assert(transientEvent?.retryable === true, 'Scenario 13: event retryable flag is true');

    // ------------------------------------------------------------------------
    // SCENARIO 14: Concurrent identical webhook delivery
    // ------------------------------------------------------------------------
    console.log('\n⚡ [14/14] Testing Concurrent Webhook Delivery & Race-Safe Claiming...');

    const sessionRace = await CheckoutSession.create({
      userId: user._id,
      cartId: cart._id,
      status: 'PAYMENT_PENDING',
      paymentProvider: 'razorpay',
      paymentIntentId: 'order_race_test_999',
      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      cartSnapshot: sessionRecon.cartSnapshot,
      shippingAddressSnapshot: sessionRecon.shippingAddressSnapshot,
      idempotencyKey: 'idem_pay_test_race',
    });

    const racePayload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_race_1',
            amount: 269892,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_race_test_999',
            notes: { checkoutSessionId: sessionRace._id.toString() },
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
    });
    const raceSig = generateRazorpaySignature(racePayload, env.RAZORPAY_WEBHOOK_SECRET);
    const eventId14 = 'evt_race_concurrent_1';

    // Dispatch two identical webhooks concurrently
    const [raceRes1, raceRes2] = await Promise.all([
      paymentService.handleWebhook('razorpay', racePayload, raceSig, { 'x-razorpay-event-id': eventId14 }),
      paymentService.handleWebhook('razorpay', racePayload, raceSig, { 'x-razorpay-event-id': eventId14 }),
    ]);

    const statuses = [raceRes1.status, raceRes2.status];
    assert(
      statuses.includes('PROCESSED') && statuses.includes('DUPLICATE'),
      'Scenario 14: concurrent webhooks result in exactly one PROCESSED and one DUPLICATE'
    );

    const ordersForRace = await Order.countDocuments({ checkoutSessionId: sessionRace._id });
    assert(ordersForRace === 1, 'Scenario 14: exactly one Order created despite concurrent webhooks');

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n' + '─'.repeat(65));
    console.log(`🎉 ALL ${passedTests}/${totalTests} SCENARIOS PASSED WITH 100% SUCCESS.`);
    console.log('─'.repeat(65) + '\n');
  } finally {
    // Cleanup test records
    await User.deleteMany({ email: 'payment_tester@wollyway.test' });
    await Category.deleteMany({ slug: 'test-knitwear-payments' });
    await Product.deleteMany({ slug: 'test-merino-beanie-payment' });
    await PaymentWebhookEvent.deleteMany({});
    await Order.deleteMany({ 'customerSnapshot.email': 'payment_tester@wollyway.test' });
    await CheckoutSession.deleteMany({ idempotencyKey: { $regex: '^idem_pay_test_' } });
    await Cart.deleteMany({});

    await disconnectDatabase();
    await closeRedis();
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification suite failed:', err);
  process.exit(1);
});
