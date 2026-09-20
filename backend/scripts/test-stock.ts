import mongoose from 'mongoose';
import { env } from '../src/config/env.config.js';
import { Product } from '../src/models/product.model.js';
import { Inventory } from '../src/models/inventory.model.js';

async function test() {
  try {
    await mongoose.connect(env.MONGO_URI);
    
    const products = await Product.find({});
    console.log('Products:', products.length);
    for (const p of products) {
      const inv = await Inventory.findOne({ productId: p._id });
      console.log(`Product ${p.name} (ID: ${p._id}): Stock = ${inv?.available}, Reserved = ${inv?.reserved}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
