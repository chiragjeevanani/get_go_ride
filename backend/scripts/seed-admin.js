/**
 * Admin Seed Script
 * Run once: node scripts/seed-admin.js
 *
 * Creates the first superadmin account in the database.
 * Never call this through an API endpoint.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.model.js';

const ADMIN_DATA = {
  name: 'Super Admin',
  email: 'admin@safarsetto.com',
  password: 'Admin@1234',  // Change immediately after first login
  isSuperAdmin: true,
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Admin.findOne({ email: ADMIN_DATA.email });
    if (existing) {
      console.log(`⚠️  Admin already exists: ${ADMIN_DATA.email}`);
      process.exit(0);
    }

    await Admin.create(ADMIN_DATA);
    console.log(`✅ Admin created successfully!`);
    console.log(`   Email:    ${ADMIN_DATA.email}`);
    console.log(`   Password: ${ADMIN_DATA.password}`);
    console.log(`\n⚠️  IMPORTANT: Change this password immediately after first login!\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
