import 'dotenv/config';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

// Force mock OTP for all tests
process.env.OTP_PROVIDER = 'mock';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';

const TEST_DB = 'mongodb://localhost:27017/safarsetto_test';

beforeAll(async () => {
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }
});

afterEach(async () => {
  // Clean all collections between tests for isolation
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

