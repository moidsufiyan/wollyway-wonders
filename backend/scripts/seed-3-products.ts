import mongoose from 'mongoose';
import { env } from '../src/config/env.config.js';
import { Category } from '../src/models/category.model.js';
import { Product } from '../src/models/product.model.js';
import { Inventory } from '../src/models/inventory.model.js';

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    // Create or get category
    let category = await Category.findOne({ slug: 'accessories' });
    if (!category) {
      category = await Category.create({
        name: 'Accessories',
        slug: 'accessories',
        description: 'Handcrafted accessories including wrist bands and keychains',
        isActive: true
      });
      console.log('Created category');
    }

    // Clear existing products and inventory for a clean slate
    await Product.deleteMany({});
    await Inventory.deleteMany({});

    const id1 = new mongoose.Types.ObjectId('64a1b2c3d4e5f6a7b8c9d0e1');
    const id2 = new mongoose.Types.ObjectId('64a1b2c3d4e5f6a7b8c9d0e2');
    const id3 = new mongoose.Types.ObjectId('64a1b2c3d4e5f6a7b8c9d0e3');

    // Product 1: Wrist Band 1
    const p1 = await Product.create({
      _id: id1,
      name: 'WollyWay Wrist Band - Classic',
      slug: 'wollyway-wrist-band-classic',
      shortDescription: 'A handcrafted classic wrist band.',
      description: 'Hand-knitted classic wrist band perfect for daily wear.',
      categoryId: category._id,
      price: 29900, // 299 INR in paisa
      featured: true,
      visibility: 'published',
      images: [{
        url: '/uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png',
        publicId: 'wrist-band-1',
        alt: 'Classic Wrist Band',
        width: 800,
        height: 800,
        isPrimary: true,
        displayOrder: 1
      }],
      isCustomizable: false
    });

    // Product 2: Wrist Band 2
    const p2 = await Product.create({
      _id: id2,
      name: 'WollyWay Wrist Band - Premium',
      slug: 'wollyway-wrist-band-premium',
      shortDescription: 'A premium handcrafted wrist band with intricate designs.',
      description: 'Hand-knitted premium wrist band with special attention to detail.',
      categoryId: category._id,
      price: 39900, // 399 INR in paisa
      featured: true,
      visibility: 'published',
      images: [{
        url: '/uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png',
        publicId: 'wrist-band-2',
        alt: 'Premium Wrist Band',
        width: 800,
        height: 800,
        isPrimary: true,
        displayOrder: 1
      }],
      isCustomizable: false
    });

    // Product 3: Keychain
    const p3 = await Product.create({
      _id: id3,
      name: 'WollyWay Handcrafted Keychain',
      slug: 'wollyway-handcrafted-keychain',
      shortDescription: 'A cute and durable handcrafted keychain.',
      description: 'Perfect accessory for your keys or bag, made with high-quality yarn.',
      categoryId: category._id,
      price: 14900, // 149 INR in paisa
      featured: true,
      visibility: 'published',
      images: [{
        url: '/uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png',
        publicId: 'keychain-1',
        alt: 'Handcrafted Keychain',
        width: 800,
        height: 800,
        isPrimary: true,
        displayOrder: 1
      }],
      isCustomizable: false
    });

    console.log('Created 3 products');

    // Create Inventory
    await Inventory.create([
      {
        productId: id1,
        available: 50,
        reserved: 0,
        lowStockThreshold: 5,
        status: 'in_stock'
      },
      {
        productId: id2,
        available: 50,
        reserved: 0,
        lowStockThreshold: 5,
        status: 'in_stock'
      },
      {
        productId: id3,
        available: 50,
        reserved: 0,
        lowStockThreshold: 5,
        status: 'in_stock'
      }
    ]);
    console.log('Created inventory for 3 products');

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
