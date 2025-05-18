
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Product = require('../models/productModel');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Existing data cleared.');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });

    console.log('Admin user created:', admin.email);

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      addresses: [
        {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA',
          isDefault: true,
        },
      ],
    });

    console.log('Regular user created:', user.email);

    // Create products focused on hand-knitted items
    const products = [
      {
        name: 'Hand-Knitted Wool Beanie',
        description: 'Cozy hand-knitted beanie made with premium merino wool. Perfect for cold weather with a stylish cable knit pattern.',
        price: 29.99,
        images: ['/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png'],
        brand: 'WollyWay',
        category: 'Knitted Hats',
        countInStock: 15,
        rating: 4.8,
        numReviews: 12,
        featured: true,
      },
      {
        name: 'Hand-Knitted Wool Scarf',
        description: 'Luxurious hand-knitted scarf crafted with the softest alpaca wool. Features a classic ribbed pattern that provides both warmth and style.',
        price: 39.99,
        images: ['/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png'],
        brand: 'WollyWay',
        category: 'Knitted Scarves',
        countInStock: 20,
        rating: 4.9,
        numReviews: 8,
        featured: true,
      },
      {
        name: 'Hand-Knitted Winter Mittens',
        description: 'Warm and comfortable mittens hand-knitted with premium wool and lined with soft fleece. Perfect for keeping your hands cozy during winter activities.',
        price: 24.99,
        images: ['/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png'],
        brand: 'WollyWay',
        category: 'Knitted Gloves',
        countInStock: 18,
        rating: 4.7,
        numReviews: 10,
        featured: true,
      },
      {
        name: 'Hand-Knitted Wool Headband',
        description: 'Stylish hand-knitted headband with beautiful cable knit pattern and soft fleece lining for extra warmth and comfort.',
        price: 18.99,
        images: ['/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png'],
        brand: 'WollyWay',
        category: 'Knitted Headbands',
        countInStock: 25,
        rating: 4.6,
        numReviews: 6,
        featured: false,
      },
    ];

    await Product.insertMany(products);
    console.log(`${products.length} products created.`);

    // Add a review
    const product = await Product.findOne();
    product.reviews.push({
      user: user._id,
      name: user.name,
      rating: 5,
      comment: 'Beautiful knitting work! The wool is so soft and the headband keeps my ears warm while looking stylish. Highly recommended!',
    });
    await product.save();
    console.log('Sample review added.');

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};
