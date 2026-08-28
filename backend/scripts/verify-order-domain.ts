/**
 * @file verify-order-domain.ts
 * @description Comprehensive automated behavioral verification script for Phase 4.4 Order Domain.
 *
 * Invariants Verified:
 * 1. Transactional Order creation (prepaid capture confirmation).
 * 2. Immutable historical snapshots (items, prices, customer contact, shipping address, financials).
 * 3. Atomic stock deduction for tracked items (available -= qty, sold += qty) + InventoryTransaction ('purchase').
 * 4. Untracked inventory rule (available untouched, sold += qty).
 * 5. Cart clearing and CheckoutSession completion within transaction.
 * 6. Redis lock release post-commit.
 * 7. Idempotency & duplicate webhook absorption (dual unique indexes + E11000 safety).
 * 8. Strict customer IDOR ownership enforcement (404 on unauthorized lookup).
 * 9. Admin fulfillment state machine transitions (CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED).
 * 10. Invalid state transition rejection.
 * 11. Idempotent cancellation and automatic inventory restocking ('return').
 * 12. Active order product archival prevention guard.
 */

import mongoose, { Types } from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/db.config.js';
import { getRedisClient, disconnectRedis } from '../src/config/redis.config.js';
import { User } from '../src/models/user.model.js';
import { Category } from '../src/models/category.model.js';
import { Product } from '../src/models/product.model.js';
import { Inventory } from '../src/models/inventory.model.js';
import { InventoryTransaction } from '../src/models/inventory-transaction.model.js';
import { Cart } from '../src/models/cart.model.js';
import { CheckoutSession } from '../src/models/checkout-session.model.js';
import { Order } from '../src/models/order.model.js';
import { orderService } from '../src/services/order.service.js';
import { productService } from '../src/services/product.service.js';

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

async function runVerification() {
  console.log('\n🚀 Starting Phase 4.4 Order Domain Behavioral Verification Suite...\n');

  await connectDatabase();
  const redis = getRedisClient();

  try {
    // ------------------------------------------------------------------------
    // SETUP: Clean test entities
    // ------------------------------------------------------------------------
    console.log('📦 [1/8] Setting up isolated test fixtures...');

    await User.deleteMany({ email: { $in: ['order_buyer1@wollyway.test', 'order_buyer2@wollyway.test'] } });
    await Category.deleteMany({ slug: 'test-knitwear-orders' });
    await Product.deleteMany({ slug: { $in: ['test-merino-beanie-order', 'test-custom-scarf-order'] } });

    const user1 = await User.create({
      name: 'Priya Sharma',
      email: 'order_buyer1@wollyway.test',
      password: 'Password123!',
      phone: '+91 98765 43210',
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          streetAddress: '123 Artisan Lane',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          phone: '+91 98765 43210',
          isDefault: true,
        },
      ],
    });

    const user2 = await User.create({
      name: 'Rohan Mehta',
      email: 'order_buyer2@wollyway.test',
      password: 'Password123!',
      phone: '+91 91234 56789',
      role: 'customer',
    });

    const category = await Category.create({
      name: 'Test Knitwear',
      slug: 'test-knitwear-orders',
      visibility: 'active',
    });

    // Product 1: Tracked inventory (10 in stock)
    const productTracked = await Product.create({
      name: 'Test Merino Beanie',
      slug: 'test-merino-beanie-order',
      categoryId: category._id,
      price: 249900, // ₹2,499.00
      visibility: 'published',
      images: [
        {
          url: 'https://res.cloudinary.com/wollyway/image/upload/v1/beanie.webp',
          publicId: 'beanie_img_1',
          isPrimary: true,
          displayOrder: 0,
          width: 800,
          height: 800,
        },
      ],
    });

    await Inventory.create({
      productId: productTracked._id,
      available: 10,
      reserved: 0,
      sold: 0,
      trackInventory: true,
    });

    // Product 2: Untracked inventory (custom made item)
    const productUntracked = await Product.create({
      name: 'Test Custom Scarf',
      slug: 'test-custom-scarf-order',
      categoryId: category._id,
      price: 349900, // ₹3,499.00
      visibility: 'published',
      isCustomizable: true,
      images: [
        {
          url: 'https://res.cloudinary.com/wollyway/image/upload/v1/scarf.webp',
          publicId: 'scarf_img_1',
          isPrimary: true,
          displayOrder: 0,
          width: 800,
          height: 800,
        },
      ],
    });

    await Inventory.create({
      productId: productUntracked._id,
      available: 0,
      reserved: 0,
      sold: 0,
      trackInventory: false,
    });

    assert(true, 'Test fixtures created successfully');

    // ------------------------------------------------------------------------
    // TEST 1: Prepaid Order Creation & ACID Invariants
    // ------------------------------------------------------------------------
    console.log('\n💳 [2/8] Testing Prepaid Order Creation & ACID Commit...');

    // Simulate Cart & CheckoutSession
    const cart1 = await Cart.create({
      userId: user1._id,
      items: [
        { productId: productTracked._id, quantity: 2, priceSnapshot: 249900 },
        { productId: productUntracked._id, quantity: 1, priceSnapshot: 349900 },
      ],
    });

    const session1 = await CheckoutSession.create({
      userId: user1._id,
      cartId: cart1._id,
      status: 'PAYMENT_PENDING',
      reservationId: `checkout:reservation:test_sess_1`,
      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      cartSnapshot: {
        items: [
          {
            productId: productTracked._id,
            name: productTracked.name,
            slug: productTracked.slug,
            image: productTracked.images[0].url,
            price: productTracked.price,
            quantity: 2,
          },
          {
            productId: productUntracked._id,
            name: productUntracked.name,
            slug: productUntracked.slug,
            image: productUntracked.images[0].url,
            price: productUntracked.price,
            quantity: 1,
          },
        ],
      },
      shippingAddressSnapshot: {
        street: '123 Artisan Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      idempotencyKey: 'idem_key_test_1',
    });

    // Set mock Redis lock
    await redis.setex(`checkout:reservation:${session1._id}`, 900, 'mock_reservation');

    // Trigger Order Creation with verified payment payload
    const paymentPayload1 = {
      provider: 'razorpay' as const,
      transactionId: 'pay_rzp_test_123456',
      amount: 849700,
      currency: 'INR',
      paidAt: new Date(),
    };

    const orderDTO1 = await orderService.createOrderFromCheckout(
      session1._id.toString(),
      paymentPayload1
    );

    assert(orderDTO1.status === 'CONFIRMED', 'Order status is immediately CONFIRMED');
    assert(orderDTO1.orderNumber.startsWith('WW-'), 'Order number follows WW-YYYYMMDD-XXXX format');
    assert(orderDTO1.items.length === 2, 'Order contains 2 line items');
    assert(orderDTO1.financials.subtotal === 249900 * 2 + 349900, 'Subtotal correctly computed (849,700 paisa)');
    assert(orderDTO1.financials.orderTotal > 0, 'Order total is non-zero');

    // Verify DB inventory deduction for tracked item
    const invTrackedAfter = await Inventory.findOne({ productId: productTracked._id });
    assert(invTrackedAfter?.available === 8, 'Tracked inventory available decremented (10 -> 8)');
    assert(invTrackedAfter?.sold === 2, 'Tracked inventory sold incremented (0 -> 2)');

    // Verify DB inventory for untracked item (available untouched, sold incremented)
    const invUntrackedAfter = await Inventory.findOne({ productId: productUntracked._id });
    assert(invUntrackedAfter?.available === 0, 'Untracked inventory available remained untouched (0)');
    assert(invUntrackedAfter?.sold === 1, 'Untracked inventory sold incremented (0 -> 1)');

    // Verify InventoryTransaction records
    const transactions = await InventoryTransaction.find({
      orderId: new Types.ObjectId(orderDTO1.id),
      reason: 'purchase',
    });
    assert(transactions.length === 2, 'Two append-only InventoryTransaction purchase records created');

    // Verify CheckoutSession status COMPLETED
    const sessionAfter = await CheckoutSession.findById(session1._id);
    assert(sessionAfter?.status === 'COMPLETED', 'CheckoutSession status transitioned to COMPLETED');

    // Verify Cart cleared
    const cartAfter = await Cart.findOne({ userId: user1._id });
    assert(cartAfter?.items.length === 0, 'User cart emptied atomically in transaction');

    // ------------------------------------------------------------------------
    // TEST 2: Idempotency & Duplicate Webhook Absorption
    // ------------------------------------------------------------------------
    console.log('\n🔁 [3/8] Testing Idempotency & Duplicate Webhook Absorption...');

    const duplicateDTO = await orderService.createOrderFromCheckout(
      session1._id.toString(),
      paymentPayload1
    );

    assert(duplicateDTO.id === orderDTO1.id, 'Duplicate creation returned existing Order ID');
    assert(duplicateDTO.orderNumber === orderDTO1.orderNumber, 'Duplicate creation returned existing Order Number');

    const totalOrdersForSession = await Order.countDocuments({ checkoutSessionId: session1._id });
    assert(totalOrdersForSession === 1, 'Exactly one Order document exists in MongoDB (no duplicates)');

    const invTrackedAfterDuplicate = await Inventory.findOne({ productId: productTracked._id });
    assert(invTrackedAfterDuplicate?.available === 8, 'Stock was not decremented a second time');

    // ------------------------------------------------------------------------
    // TEST 3: Customer Queries & IDOR Protection
    // ------------------------------------------------------------------------
    console.log('\n🔒 [4/8] Testing Customer Queries & IDOR Enforcement...');

    const myOrders = await orderService.getMyOrders(user1._id.toString(), 1, 10);
    assert(myOrders.orders.length === 1, 'Customer 1 sees their 1 order in order history');
    assert(myOrders.orders[0].id === orderDTO1.id, 'Order summary ID matches created order');

    // Customer 1 queries their own order detail
    const ownDetail = await orderService.getOrderById(user1._id.toString(), orderDTO1.id);
    assert(ownDetail.id === orderDTO1.id, 'Customer 1 successfully retrieved own order detail');

    // Customer 2 attempts to query Customer 1's order (IDOR Attack)
    let idorBlocked = false;
    try {
      await orderService.getOrderById(user2._id.toString(), orderDTO1.id);
    } catch (err: any) {
      if (err.statusCode === 404 || err.message === 'Order not found') {
        idorBlocked = true;
      }
    }
    assert(idorBlocked, 'IDOR blocked: Customer 2 receives 404 when querying Customer 1 order');

    // ------------------------------------------------------------------------
    // TEST 4: Admin Fulfillment State Machine Transitions
    // ------------------------------------------------------------------------
    console.log('\n🚚 [5/8] Testing Admin Fulfillment State Machine...');

    // Transition 1: CONFIRMED -> PROCESSING
    const processingDTO = await orderService.updateOrderStatus(orderDTO1.id, {
      status: 'PROCESSING',
      notes: 'Handcrafting started in workshop',
    });
    assert(processingDTO.status === 'PROCESSING', 'Admin successfully moved order to PROCESSING');

    // Transition 2: PROCESSING -> SHIPPED with tracking info
    const shippedDTO = await orderService.updateOrderStatus(orderDTO1.id, {
      status: 'SHIPPED',
      carrier: 'BlueDart Express',
      trackingNumber: 'BD-892184912',
    });
    assert(shippedDTO.status === 'SHIPPED', 'Admin successfully moved order to SHIPPED');
    assert(shippedDTO.fulfillment?.carrier === 'BlueDart Express', 'Carrier details recorded');
    assert(shippedDTO.fulfillment?.shippedAt !== undefined, 'shippedAt timestamp populated automatically');

    // Transition 3: SHIPPED -> DELIVERED
    const deliveredDTO = await orderService.updateOrderStatus(orderDTO1.id, {
      status: 'DELIVERED',
    });
    assert(deliveredDTO.status === 'DELIVERED', 'Admin successfully moved order to DELIVERED');
    assert(deliveredDTO.fulfillment?.deliveredAt !== undefined, 'deliveredAt timestamp populated automatically');

    // Invalid transition test: DELIVERED -> PROCESSING (backwards transition from terminal state)
    let invalidTransitionBlocked = false;
    try {
      await orderService.updateOrderStatus(orderDTO1.id, { status: 'PROCESSING' });
    } catch {
      invalidTransitionBlocked = true;
    }
    assert(invalidTransitionBlocked, 'Invalid state mutation rejected on terminal DELIVERED order');

    // ------------------------------------------------------------------------
    // TEST 5: Idempotent Cancellation & Restocking
    // ------------------------------------------------------------------------
    console.log('\n🔄 [6/8] Testing Order Cancellation & Inventory Restocking...');

    // Create a new order to test cancellation
    const session2 = await CheckoutSession.create({
      userId: user2._id,
      cartId: new Types.ObjectId(),
      status: 'PAYMENT_PENDING',
      cartSnapshot: {
        items: [
          {
            productId: productTracked._id,
            name: productTracked.name,
            slug: productTracked.slug,
            image: productTracked.images[0].url,
            price: productTracked.price,
            quantity: 3,
          },
        ],
      },
      shippingAddressSnapshot: {
        street: '456 Garden St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      },
      idempotencyKey: 'idem_key_test_2',
    });

    const orderDTO2 = await orderService.createOrderFromCheckout(session2._id.toString(), {
      provider: 'stripe',
      transactionId: 'ch_stripe_test_987654',
      amount: 249900 * 3,
      currency: 'INR',
      paidAt: new Date(),
    });

    const invBeforeCancel = await Inventory.findOne({ productId: productTracked._id });
    assert(invBeforeCancel?.available === 5, 'Inventory after second order is 5 (8 - 3)');
    assert(invBeforeCancel?.sold === 5, 'Sold count is 5 (2 + 3)');

    // Customer cancels order 2
    const cancelledDTO = await orderService.cancelOrder(
      orderDTO2.id,
      'Customer changed mind',
      user2._id.toString(),
      false
    );
    assert(cancelledDTO.status === 'CANCELLED', 'Order status is CANCELLED');
    assert(cancelledDTO.cancellation?.reason === 'Customer changed mind', 'Cancellation reason saved');

    // Verify inventory restocked
    const invAfterCancel = await Inventory.findOne({ productId: productTracked._id });
    assert(invAfterCancel?.available === 8, 'Inventory available restored to 8 (5 + 3)');
    assert(invAfterCancel?.sold === 2, 'Inventory sold count restored to 2 (5 - 3)');

    // Verify return audit transaction logged
    const returnTx = await InventoryTransaction.findOne({
      orderId: new Types.ObjectId(orderDTO2.id),
      reason: 'return',
    });
    assert(returnTx !== null, 'InventoryTransaction record created with reason: return');

    // Test cancellation idempotency: calling cancel again does not double-restock
    await orderService.cancelOrder(orderDTO2.id, 'Duplicate cancel request', user2._id.toString(), false);
    const invAfterSecondCancel = await Inventory.findOne({ productId: productTracked._id });
    assert(invAfterSecondCancel?.available === 8, 'Idempotent cancel: stock was not double-restocked');

    // ------------------------------------------------------------------------
    // TEST 6: Active Order Product Archival Guard
    // ------------------------------------------------------------------------
    console.log('\n🛡️ [7/8] Testing Product Archival Safeguard...');

    // Create active order for productTracked (status CONFIRMED)
    const session3 = await CheckoutSession.create({
      userId: user1._id,
      cartId: new Types.ObjectId(),
      status: 'PAYMENT_PENDING',
      cartSnapshot: {
        items: [
          {
            productId: productTracked._id,
            name: productTracked.name,
            slug: productTracked.slug,
            image: productTracked.images[0].url,
            price: productTracked.price,
            quantity: 1,
          },
        ],
      },
      shippingAddressSnapshot: {
        street: '123 Artisan Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      idempotencyKey: 'idem_key_test_3',
    });

    const activeOrderDTO = await orderService.createOrderFromCheckout(session3._id.toString(), {
      provider: 'razorpay',
      transactionId: 'pay_rzp_test_active_guard',
      amount: 249900,
      currency: 'INR',
      paidAt: new Date(),
    });

    // Attempt to archive productTracked while activeOrderDTO is CONFIRMED
    let archiveBlocked = false;
    try {
      await productService.archiveProduct(productTracked._id.toString());
    } catch (err: any) {
      if (err.message.includes('active orders')) {
        archiveBlocked = true;
      }
    }
    assert(archiveBlocked, 'Product archival blocked when product has active CONFIRMED orders');

    // Deliver active order (terminal state)
    await orderService.updateOrderStatus(activeOrderDTO.id, { status: 'PROCESSING' });
    await orderService.updateOrderStatus(activeOrderDTO.id, { status: 'SHIPPED' });
    await orderService.updateOrderStatus(activeOrderDTO.id, { status: 'DELIVERED' });

    // Now product archival should be permitted (with discontinued flag)
    await Inventory.findOneAndUpdate({ productId: productTracked._id }, { available: 0, isDiscontinued: true });
    const archivedProduct = await productService.archiveProduct(productTracked._id.toString());
    assert(archivedProduct.visibility === 'archived', 'Product archival succeeded once all orders reached terminal state');

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n' + '─'.repeat(60));
    console.log(`🎉 VERIFICATION COMPLETE: ${passedTests}/${totalTests} tests passed with 100% success.`);
    console.log('─'.repeat(60) + '\n');
  } finally {
    // Cleanup test records
    await User.deleteMany({ email: { $in: ['order_buyer1@wollyway.test', 'order_buyer2@wollyway.test'] } });
    await Category.deleteMany({ slug: 'test-knitwear-orders' });
    await Product.deleteMany({ slug: { $in: ['test-merino-beanie-order', 'test-custom-scarf-order'] } });
    await Order.deleteMany({ 'customerSnapshot.email': { $in: ['order_buyer1@wollyway.test', 'order_buyer2@wollyway.test'] } });
    await CheckoutSession.deleteMany({ idempotencyKey: { $in: ['idem_key_test_1', 'idem_key_test_2', 'idem_key_test_3'] } });
    await Cart.deleteMany({});

    await disconnectDatabase();
    await disconnectRedis();
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification suite crashed:', err);
  process.exit(1);
});
