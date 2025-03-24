
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

    // Create products
    const products = [
      {
        name: 'Super Hero Keychain',
        description: 'Handcrafted superhero themed keychain made with premium materials. Comes with metal clasp.',
        price: 19.99,
        images: ['/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png'],
        brand: 'WollyWay',
        category: 'Keychains',
        countInStock: 50,
        rating: 4.5,
        numReviews: 12,
        featured: true,
      },
      {
        name: 'Friendship Bracelets Set',
        description: 'Set of handwoven friendship bands with custom designs. Perfect gift for friends.',
        price: 24.99,
        images: ['/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png'],
        brand: 'WollyWay',
        category: 'Bracelets',
        countInStock: 30,
        rating: 4.8,
        numReviews: 8,
        featured: true,
      },
      {
        name: 'Batman Inspired Band',
        description: 'Superhero-inspired handwoven band with iconic pattern. Durable and stylish.',
        price: 22.99,
        images: ['/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png'],
        brand: 'WollyWay',
        category: 'Bands',
        countInStock: 25,
        rating: 4.7,
        numReviews: 10,
        featured: false,
        discount: 10,
      },
      {
        name: 'Colorful Woven Bracelet',
        description: 'Vibrant woven bracelet made with sustainable materials. Adjustable size.',
        price: 16.99,
        images: ['/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png'],
        brand: 'WollyWay',
        category: 'Bracelets',
        countInStock: 40,
        rating: 4.2,
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
      comment: 'Great product, highly recommended!',
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
