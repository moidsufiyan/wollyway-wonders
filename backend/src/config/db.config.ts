import mongoose from 'mongoose';
import { env } from './env.config.js';


export const connectDatabase = async (): Promise<void> => {
  try {
    const connectionOptions = {
      maxPoolSize: env.NODE_ENV === 'production' ? 50 : 10,
      autoIndex: true,
    };

    mongoose.connection.on('connected', () => {
      console.log('💚 Connected to MongoDB database successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection disconnected.');
    });

    await mongoose.connect(env.MONGO_URI, connectionOptions);
  } catch (error) {
    console.error('❌ Failed to establish initial MongoDB connection:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('💤 MongoDB connection closed successfully.');
  } catch (error) {
    console.error('❌ Error during MongoDB disconnection:', error);
  }
};
