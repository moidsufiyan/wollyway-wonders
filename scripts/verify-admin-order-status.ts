import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), 'backend/.env') });

import { Order, IOrder } from '../backend/src/models/order.model.js';
import { User } from '../backend/src/models/user.model.js';
import { orderService } from '../backend/src/services/order.service.js';
import { orderRepository } from '../backend/src/repositories/order.repository.js';
import { OrderStatus } from '../backend/src/types/order.types.js';

let adminUserId: string;

async function setup() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw new Error('No admin found');
  adminUserId = admin._id.toString();
}

async function teardown() {
  await mongoose.disconnect();
}

async function createTestOrder(status: OrderStatus = 'CONFIRMED'): Promise<IOrder> {
  const order = new Order({
    userId: new mongoose.Types.ObjectId(),
    orderNumber: `TEST-${Date.now()}`,
    status,
    items: [{
      productId: new mongoose.Types.ObjectId(),
      name: 'Test Product',
      price: 100,
      quantity: 1,
    }],
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'Test Country',
    },
    financials: {
      subtotal: 100,
      shippingFee: 0,
      taxTotal: 0,
      orderTotal: 100,
      currency: 'INR',
    },
    paymentInfo: {
      provider: 'razorpay',
      status: 'paid',
      transactionId: 'txn_test123',
    },
    customerSnapshot: {
      name: 'Test Customer',
      email: 'test@example.com',
    }
  });

  return await order.save();
}

async function runTests() {
  await setup();
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`✅ ${msg}`);
      passed++;
    } else {
      console.error(`❌ ${msg}`);
      failed++;
    }
  };

  try {
    // 1. Valid Transition: CONFIRMED -> PROCESSING
    let order = await createTestOrder('CONFIRMED');
    await orderService.updateOrderStatus(order._id.toString(), { status: 'PROCESSING' }, adminUserId);
    order = await Order.findById(order._id) as IOrder;
    assert(order.status === 'PROCESSING', 'Allows CONFIRMED -> PROCESSING');
    assert(order.history.length === 1, 'History array appended');
    assert(order.history[0].previousStatus === 'CONFIRMED', 'History previousStatus is correct');

    // 2. Valid Transition: PROCESSING -> SHIPPED
    await orderService.updateOrderStatus(order._id.toString(), { status: 'SHIPPED' }, adminUserId);
    order = await Order.findById(order._id) as IOrder;
    assert(order.status === 'SHIPPED', 'Allows PROCESSING -> SHIPPED');
    assert(order.fulfillment?.shippedAt != null, 'Shipped timestamp is set');
    assert(order.history.length === 2, 'History array has 2 entries');

    // 3. Valid Transition: SHIPPED -> DELIVERED
    await orderService.updateOrderStatus(order._id.toString(), { status: 'DELIVERED' }, adminUserId);
    order = await Order.findById(order._id) as IOrder;
    assert(order.status === 'DELIVERED', 'Allows SHIPPED -> DELIVERED');
    assert(order.fulfillment?.deliveredAt != null, 'Delivered timestamp is set');

    // 4. Invalid Transition: Terminal state modification
    try {
      await orderService.updateOrderStatus(order._id.toString(), { status: 'SHIPPED' }, adminUserId);
      assert(false, 'Should not allow transition from DELIVERED');
    } catch (e: any) {
      assert(e.statusCode === 400, 'Rejects transition from terminal state DELIVERED');
    }

    // 5. Invalid Transition: Skipping states (CONFIRMED -> DELIVERED)
    order = await createTestOrder('CONFIRMED');
    try {
      await orderService.updateOrderStatus(order._id.toString(), { status: 'DELIVERED' }, adminUserId);
      assert(false, 'Should not allow CONFIRMED -> DELIVERED');
    } catch (e: any) {
      assert(e.statusCode === 400, 'Rejects skipping states (CONFIRMED -> DELIVERED)');
    }

    // 6. Invalid Target: CANCELLED
    try {
      await orderService.updateOrderStatus(order._id.toString(), { status: 'CANCELLED' as OrderStatus }, adminUserId);
      assert(false, 'Should not allow CANCELLED via status update endpoint');
    } catch (e: any) {
      assert(e.statusCode === 400, 'Rejects transition to CANCELLED');
    }

    // 7. Concurrency Test: Atomic update ensures no overwrite
    order = await createTestOrder('CONFIRMED');
    // Simulate concurrent modification where DB changes before our update
    await Order.updateOne({ _id: order._id }, { $set: { status: 'PROCESSING' } });
    
    // orderService gets CONFIRMED if we mock it, or if we pass expectedCurrentStatus it fails
    // actually orderService fetches the order first. We can mock findById to return CONFIRMED but db is PROCESSING
    const originalFindById = Order.findById;
    Order.findById = function(id: any) {
      return {
        select: () => ({
          lean: async () => ({ ...order.toObject(), status: 'CONFIRMED' }) // mock what service sees
        })
      } as any;
    };

    try {
      await orderService.updateOrderStatus(order._id.toString(), { status: 'PROCESSING' }, adminUserId);
      assert(false, 'Should have failed due to concurrent modification');
    } catch (e: any) {
      assert(e.statusCode === 409, 'Atomic concurrency check detects conflicting status update');
    } finally {
      Order.findById = originalFindById;
    }

    // Clean up
    await Order.deleteMany({ orderNumber: /^TEST-/ });

  } catch (err) {
    console.error('Fatal error during tests:', err);
  } finally {
    console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
    await teardown();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
