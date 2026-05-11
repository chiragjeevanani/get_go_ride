import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Vendor from '../src/models/Vendor.model.js';
import Requirement from '../src/models/Requirement.model.js';
import Bid from '../src/models/Bid.model.js';
import SubscriptionPlan from '../src/models/SubscriptionPlan.model.js';
import SystemSetting from '../src/models/SystemSetting.model.js';
import jwt from 'jsonwebtoken';

let adminToken;
let userToken, userId;
let vendorToken, vendorId;
let planId;

beforeAll(async () => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // Create test subscription plan
  const plan = await SubscriptionPlan.create({
    name: 'Revenue Test Plan',
    price: 500,
    durationDays: 30,
    features: [],
    leadQuota: { type: 'limited', limit: 10, period: 'day' },
    isActive: true,
  });
  planId = plan._id;

  // Setup revenue model defaults
  await SystemSetting.findOneAndUpdate(
    { key: 'revenueModel' },
    { key: 'revenueModel', value: 'subscription' },
    { upsert: true }
  );
  await SystemSetting.findOneAndUpdate(
    { key: 'commissionRate' },
    { key: 'commissionRate', value: 10 },
    { upsert: true }
  );
});

afterAll(async () => {
  await User.deleteMany({ phone: { $in: ['9988771101', '9988771102'] } });
  await Vendor.deleteMany({ phone: { $in: ['9988771102'] } });
  await Requirement.deleteMany({});
  await Bid.deleteMany({});
  await SubscriptionPlan.deleteMany({ name: 'Revenue Test Plan' });
  await SystemSetting.deleteMany({ key: { $in: ['revenueModel', 'commissionRate'] } });
});

beforeEach(async () => {
  // Clean up
  await User.deleteMany({ phone: { $in: ['9988771101', '9988771102'] } });
  await Vendor.deleteMany({ phone: { $in: ['9988771102'] } });
  await Requirement.deleteMany({});
  await Bid.deleteMany({});

  // Create user
  const user = await User.create({ phone: '9988771101', name: 'Revenue Test User' });
  userId = user._id;
  userToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // Create vendor (no subscription by default)
  const vendor = await Vendor.create({
    phone: '9988771102',
    name: 'Revenue Test Vendor',
    serviceCategories: ['goods'],
    onboardingComplete: true,
    subscriptionStatus: 'None',
  });
  vendorId = vendor._id;
  vendorToken = jwt.sign({ id: vendor._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // Reset settings
  await SystemSetting.findOneAndUpdate(
    { key: 'revenueModel' },
    { value: 'subscription' },
    { upsert: true }
  );
  await SystemSetting.findOneAndUpdate(
    { key: 'commissionRate' },
    { value: 10 },
    { upsert: true }
  );
});

// ============================================
// TEST 1: SUBSCRIPTION-ONLY MODEL
// ============================================
describe('Subscription-Only Model', () => {
  test('should block vendor without subscription from accessing leads', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'subscription' });

    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACTIVE_SUBSCRIPTION_REQUIRED');
  });

  test('should block vendor without subscription from placing bids', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'subscription' });

    // Create a requirement
    const req = await Requirement.create({
      user: userId,
      serviceType: 'goods',
      vehicleType: 'Tata Ace',
      pickup: { address: 'A' },
      drops: [{ address: 'B' }],
      items: 'Test',
      date: new Date(),
      time: '12:00',
    });

    const res = await request(app)
      .post(`/api/leads/${req._id}/bid`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ amount: 1000 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACTIVE_SUBSCRIPTION_REQUIRED');
  });

  test('should allow vendor WITH subscription to bid and NOT deduct commission', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'subscription' });

    // Give vendor subscription
    await Vendor.findByIdAndUpdate(vendorId, {
      subscriptionStatus: 'Active',
      activeSubscription: planId,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create requirement
    const req = await Requirement.create({
      user: userId,
      serviceType: 'goods',
      vehicleType: 'Tata Ace',
      pickup: { address: 'A' },
      drops: [{ address: 'B' }],
      items: 'Test',
      date: new Date(),
      time: '12:00',
    });

    // Place bid via API (creates it)
    const bidRes = await request(app)
      .post(`/api/leads/${req._id}/bid`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ amount: 5000 });

    expect(bidRes.status).toBe(201);

    // Accept the bid
    const bidId = bidRes.body.data._id;

    const acceptRes = await request(app)
      .patch(`/api/bids/${bidId}/accept`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(acceptRes.status).toBe(200);

    // Verify NO commission deducted
    const updatedBid = await Bid.findById(bidId);
    expect(updatedBid.platformCommission).toBe(0);
    expect(updatedBid.vendorEarning).toBe(0); // Not set via acceptBid controller
  });
});

// ============================================
// TEST 2: COMMISSION-ONLY MODEL
// ============================================
describe('Commission-Only Model', () => {
  test('should allow vendor WITHOUT subscription to access leads', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'commission' });

    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
  });

  test('should allow vendor WITHOUT subscription to place bids', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'commission' });

    const req = await Requirement.create({
      user: userId,
      serviceType: 'goods',
      vehicleType: 'Tata Ace',
      pickup: { address: 'A' },
      drops: [{ address: 'B' }],
      items: 'Test',
      date: new Date(),
      time: '12:00',
    });

    const res = await request(app)
      .post(`/api/leads/${req._id}/bid`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ amount: 5000 });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(5000);
  });

  test('should deduct commission when deal accepted in commission mode', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'commission' });
    await SystemSetting.findOneAndUpdate({ key: 'commissionRate' }, { value: 10 });

    // Give vendor a wallet balance for commission deduction
    await Vendor.findByIdAndUpdate(vendorId, {
      wallet: { balance: 1000, transactions: [] },
      totalEarnings: 0,
      platformDues: 0,
    });

    const req = await Requirement.create({
      user: userId,
      serviceType: 'goods',
      vehicleType: 'Tata Ace',
      pickup: { address: 'A' },
      drops: [{ address: 'B' }],
      items: 'Test',
      date: new Date(),
      time: '12:00',
    });

    const bid = await Bid.create({
      requirement: req._id,
      vendor: vendorId,
      amount: 5000,
    });

    const res = await request(app)
      .patch(`/api/bids/${bid._id}/accept`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);

    // Verify vendor earnings updated
    const updatedVendor = await Vendor.findById(vendorId);
    expect(updatedVendor.totalEarnings).toBe(5000);
    expect(updatedVendor.platformDues).toBe(500); // 10% of 5000
    expect(updatedVendor.wallet.balance).toBe(500); // 1000 - 500 commission
  });

  test('should use custom commission rate (15%)', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'commission' });
    await SystemSetting.findOneAndUpdate({ key: 'commissionRate' }, { value: 15 });

    await Vendor.findByIdAndUpdate(vendorId, {
      wallet: { balance: 1000, transactions: [] },
      totalEarnings: 0,
      platformDues: 0,
    });

    const req = await Requirement.create({
      user: userId,
      serviceType: 'goods',
      vehicleType: 'Tata Ace',
      pickup: { address: 'A' },
      drops: [{ address: 'B' }],
      items: 'Test',
      date: new Date(),
      time: '12:00',
    });

    const bid = await Bid.create({
      requirement: req._id,
      vendor: vendorId,
      amount: 2000,
    });

    await request(app)
      .patch(`/api/bids/${bid._id}/accept`)
      .set('Authorization', `Bearer ${userToken}`);

    const updatedVendor = await Vendor.findById(vendorId);
    expect(updatedVendor.platformDues).toBe(300); // 15% of 2000
    expect(updatedVendor.wallet.balance).toBe(700); // 1000 - 300
  });
});

// ============================================
// TEST 3: SUBSCRIPTION + COMMISSION MODEL
// ============================================
describe('Subscription + Commission Model', () => {
  test('should require subscription AND deduct commission', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'subscription_commission' });
    await SystemSetting.findOneAndUpdate({ key: 'commissionRate' }, { value: 10 });

    // Give vendor subscription
    await Vendor.findByIdAndUpdate(vendorId, {
      subscriptionStatus: 'Active',
      activeSubscription: planId,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      wallet: { balance: 1000, transactions: [] },
      totalEarnings: 0,
      platformDues: 0,
    });

    const req = await Requirement.create({
      user: userId,
      serviceType: 'goods',
      vehicleType: 'Tata Ace',
      pickup: { address: 'A' },
      drops: [{ address: 'B' }],
      items: 'Test',
      date: new Date(),
      time: '12:00',
    });

    // Vendor can bid (has subscription) - uses API to place bid
    const bidRes = await request(app)
      .post(`/api/leads/${req._id}/bid`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ amount: 5000 });

    expect(bidRes.status).toBe(201);

    // Accept the bid using the returned bid ID
    const bidId = bidRes.body.data._id;

    const acceptRes = await request(app)
      .patch(`/api/bids/${bidId}/accept`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(acceptRes.status).toBe(200);

    // Verify commission deducted
    const updatedVendor = await Vendor.findById(vendorId);
    expect(updatedVendor.totalEarnings).toBe(5000);
    expect(updatedVendor.platformDues).toBe(500); // 10% of 5000
  });

  test('should block vendor without subscription in subscription+commission mode', async () => {
    await SystemSetting.findOneAndUpdate({ key: 'revenueModel' }, { value: 'subscription_commission' });

    // Vendor has no subscription
    const vendor = await Vendor.findById(vendorId);
    expect(vendor.subscriptionStatus).toBe('None');

    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACTIVE_SUBSCRIPTION_REQUIRED');
  });
});

// ============================================
// TEST 4: SETTINGS API
// ============================================
describe('Revenue Model Settings API', () => {
  test('should get revenue model settings', async () => {
    const res = await request(app)
      .get('/api/settings/revenue-model')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.revenueModel).toBeDefined();
    expect(res.body.data.commissionRate).toBeDefined();
    expect(res.body.data.modelOptions).toBeDefined();
  });

  test('should update revenue model', async () => {
    const res = await request(app)
      .put('/api/settings/revenue-model')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ revenueModel: 'commission', commissionRate: 15 });

    expect(res.status).toBe(200);
    expect(res.body.data.revenueModel).toBe('commission');
    expect(res.body.data.commissionRate).toBe(15);
  });

  test('should reject invalid revenue model', async () => {
    const res = await request(app)
      .put('/api/settings/revenue-model')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ revenueModel: 'invalid_model' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_MODEL');
  });

  test('should reject invalid commission rate', async () => {
    const res = await request(app)
      .put('/api/settings/revenue-model')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commissionRate: 150 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_RATE');
  });
});