/**
 * Seed script for initial subscription plans.
 * Run once: node src/seed/seedPlans.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import SubscriptionPlan from '../models/SubscriptionPlan.model.js';

const PLANS = [
  {
    name: 'Free Trial',
    price: 0,
    durationDays: 30,
    leadQuota: { type: 'limited', limit: 5, period: 'day' },
    features: {
      verifiedBadge: false,
      prioritySupport: false,
      freeMarketing: false,
      custom: ['Access to basic leads', '5 Leads per day'],
    },
    isActive: true,
  },
  {
    name: 'Basic Monthly',
    price: 499,
    durationDays: 30,
    leadQuota: { type: 'limited', limit: 10, period: 'day' },
    features: {
      verifiedBadge: false,
      prioritySupport: false,
      freeMarketing: false,
      custom: ['Basic Support'],
    },
    isActive: true,
  },
  {
    name: 'Premium Monthly',
    price: 999,
    durationDays: 30,
    leadQuota: { type: 'unlimited' },
    features: {
      verifiedBadge: true,
      prioritySupport: true,
      freeMarketing: false,
      custom: [],
    },
    isActive: true,
  },
  {
    name: 'Premium Yearly',
    price: 8999,
    durationDays: 365,
    leadQuota: { type: 'unlimited' },
    features: {
      verifiedBadge: true,
      prioritySupport: true,
      freeMarketing: true,
      custom: [],
    },
    isActive: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await SubscriptionPlan.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  ${existing} plans already exist. Skipping seed.`);
    process.exit(0);
  }

  const created = await SubscriptionPlan.insertMany(PLANS);
  console.log(`✅ Seeded ${created.length} plans:`);
  created.forEach(p => console.log(`   - ${p.name} (₹${p.price})`));
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
