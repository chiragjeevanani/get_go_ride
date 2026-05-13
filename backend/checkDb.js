import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/getgoload';

console.log('Connecting to MongoDB at:', mongoUri);

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    // Check users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`\n--- USERS (${users.length}) ---`);
    users.forEach(u => {
      console.log(`ID: ${u._id}, Phone: ${u.phone}, Role: ${u.role || 'user'}`);
    });

    // Check vendors
    const vendors = await mongoose.connection.db.collection('vendors').find({}).toArray();
    console.log(`\n--- VENDORS (${vendors.length}) ---`);
    vendors.forEach(v => {
      console.log(`ID: ${v._id}, Name: ${v.name}, Phone: ${v.phone}, OnboardingComplete: ${v.onboardingComplete}, Status: ${v.status}`);
    });

  } catch (err) {
    console.error('Error during database diagnostics:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

run();
