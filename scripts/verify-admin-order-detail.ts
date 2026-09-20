import mongoose from 'mongoose';
import { orderService } from '../backend/src/services/order.service.js';
import { orderRepository } from '../backend/src/repositories/order.repository.js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wollyway');
  console.log('Connected to MongoDB');

  try {
    const { orders } = await orderRepository.findAdminOrders({}, 0, 1);
    if (orders.length === 0) {
      console.log('No orders found to verify against.');
      return;
    }

    const testOrderId = orders[0]._id.toString();
    console.log(`Verifying getAdminOrderById for order ${testOrderId}...`);

    const orderDetailDTO = await orderService.getAdminOrderById(testOrderId);
    
    // Check envelope locally by simulating controller if needed, but here we just check DTO.
    console.log('AdminOrderDetailDTO keys:', Object.keys(orderDetailDTO));
    
    const requiredKeys = ['id', 'orderNumber', 'createdAt', 'updatedAt', 'status', 'paymentStatus', 'customer', 'shipping', 'items', 'financials', 'payment', 'lifecycle'];
    const hasAllKeys = requiredKeys.every(k => Object.keys(orderDetailDTO).includes(k));
    
    if (hasAllKeys) {
      console.log('✅ DTO contains all required keys.');
    } else {
      console.error('❌ DTO missing required keys!');
    }

    // Check no Mongoose raw leakage
    const strObj = JSON.stringify(orderDetailDTO);
    if (strObj.includes('_id') || strObj.includes('__v')) {
      console.error('❌ DTO leaks Mongoose internal fields (_id, __v)!');
    } else {
      console.log('✅ DTO does not leak Mongoose internals.');
    }

    console.log('Verification completed successfully.');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
