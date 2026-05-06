/**
 * Admin Seed Script
 * Run once: node scripts/seed-admin.js
 *
 * Creates or updates the first superadmin account in the database.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.model.js';

const ADMIN_DATA = {
  name: 'Super Admin',
  email: 'admin@gmail.com',
  password: '1234qwer',
  isSuperAdmin: true,
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let admin = await Admin.findOne({ email: ADMIN_DATA.email });
    if (admin) {
      console.log(`ℹ️  Admin with email ${ADMIN_DATA.email} already exists. Updating password...`);
      admin.password = ADMIN_DATA.password;
      await admin.save();
      console.log(`✅ Password updated successfully!`);
    } else {
      await Admin.create(ADMIN_DATA);
      console.log(`✅ Admin created successfully!`);
    }

    console.log(`   Email:    ${ADMIN_DATA.email}`);
    console.log(`   Password: ${ADMIN_DATA.password}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
