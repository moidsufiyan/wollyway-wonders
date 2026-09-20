import mongoose from 'mongoose';
import { env } from '../src/config/env.config.js';
import { User } from '../src/models/user.model.js';

async function run() {
  try {
    await mongoose.connect(env.MONGO_URI);
    const result = await User.updateMany({}, { role: 'admin' });
    console.log('Upgraded users to admin:', result.modifiedCount);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
