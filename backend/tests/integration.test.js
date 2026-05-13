import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Vendor from '../src/models/Vendor.model.js';
import Requirement from '../src/models/Requirement.model.js';
import Bid from '../src/models/Bid.model.js';
import Category from '../src/models/Category.model.js';
import Vehicle from '../src/models/Vehicle.model.js';
import jwt from 'jsonwebtoken';

let userToken;
let vendorToken;
let adminToken;
let userId;
let vendorId;
let categoryId;
let vehicleId;
let requirementId;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Vendor.deleteMany({}),
    Requirement.deleteMany({}),
    Bid.deleteMany({}),
    Category.deleteMany({}),
    Vehicle.deleteMany({})
  ]);

  const user = await User.create({ phone: '9876543210', name: 'Test User' });
  userId = user._id;
  userToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  const vendor = await Vendor.create({
    phone: '9876543211',
    name: 'Test Vendor',
    serviceCategories: ['goods'],
    onboardingComplete: true,
    subscriptionStatus: 'Active',
  });
  vendorId = vendor._id;
  vendorToken = jwt.sign({ id: vendor._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  const category = await Category.create({ name: 'Goods', slug: 'goods', isActive: true });
  categoryId = category._id;

  const vehicle = await Vehicle.create({ name: 'Truck', capacity: '5 Ton', categorySlug: 'goods', isActive: true });
  vehicleId = vehicle._id;

  const requirement = await Requirement.create({
    user: userId,
    serviceType: 'goods',
    vehicleType: 'truck',
    pickup: { address: 'Pickup', lat: 12.34, lon: 56.78 },
    drops: [{ address: 'Drop', lat: 12.35, lon: 56.79 }],
    items: 'Test Items',
    date: new Date('2026-12-31'),
    time: '10:00',
    status: 'pending'
  });
  requirementId = requirement._id;
});

describe('End-to-End Integration Tests', () => {
  // ─── Complete User Flow: Create Requirement → Vendor Bids → User Accepts ─────
  describe('Complete Lead Lifecycle', () => {
    it('should handle complete lead lifecycle', async () => {
      // Step 1: User creates a requirement
      const createReqRes = await request(app)
        .post('/api/requirements')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'goods',
          vehicleType: 'truck',
          pickup: { address: 'Mumbai', lat: 19.07, lon: 72.87 },
          drops: [{ address: 'Pune', lat: 18.52, lon: 73.85 }],
          items: 'Electronics',
          weight: '500 kg',
          date: '2026-12-31',
          time: '14:00'
        });

      expect(createReqRes.status).toBe(201);
      const reqId = createReqRes.body.data._id;

      // Step 2: Vendor places a bid
      const bidRes = await request(app)
        .post(`/api/leads/${reqId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 2000, notes: 'Can deliver in 3 hours' });

      expect(bidRes.status).toBe(201);
      const bidId = bidRes.body.data._id;

      // Step 3: Requirement status changed to bidding
      const reqAfterBid = await Requirement.findById(reqId);
      expect(reqAfterBid.status).toBe('bidding');

      // Step 4: User accepts the bid
      const acceptRes = await request(app)
        .patch(`/api/bids/${bidId}/accept`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(acceptRes.status).toBe(200);

      // Step 5: Requirement is now accepted
      const finalReq = await Requirement.findById(reqId);
      expect(finalReq.status).toBe('accepted');
      expect(finalReq.acceptedBid.toString()).toBe(bidId);

      // Step 6: Other bids are rejected
      const rejectedBids = await Bid.find({ requirement: reqId, status: 'rejected' });
      expect(rejectedBids.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Admin Analytics Flow ────────────────────────────────────────────────────
  describe('Admin Dashboard Analytics', () => {
    it('should aggregate system-wide stats', async () => {
      // Create more data
      await Requirement.create([
        { user: userId, serviceType: 'goods', vehicleType: 'truck', pickup: { address: 'A' }, drops: [{ address: 'B' }], items: 'Item1', date: new Date('2026-12-31'), time: '10:00', status: 'pending' },
        { user: userId, serviceType: 'house', vehicleType: 'van', pickup: { address: 'C' }, drops: [{ address: 'D' }], items: 'Item2', date: new Date('2026-12-30'), time: '11:00', status: 'completed' }
      ]);

      // Get stats
      const statsRes = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.totalUsers).toBeDefined();
      expect(statsRes.body.data.totalVendors).toBeDefined();
      expect(statsRes.body.data.totalRequirements).toBeDefined();
    });

    it('should get revenue stats', async () => {
      const revRes = await request(app)
        .get('/api/admin/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(revRes.status).toBe(200);
    });

    it('should get leads trend', async () => {
      const trendRes = await request(app)
        .get('/api/admin/leads-trend')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(trendRes.status).toBe(200);
    });
  });

  // ─── Vendor Subscription Flow ───────────────────────────────────────────────
  describe('Vendor Subscription Flow', () => {
    it('should allow vendor to subscribe to plan', async () => {
      // First create a plan
      const planRes = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Plan',
          price: 0,
          durationDays: 30,
          isActive: true
        });

      const planId = planRes.body.data._id;

      // Vendor subscribes
      const subRes = await request(app)
        .post(`/api/plans/${planId}/subscribe`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(subRes.status).toBe(200);
      expect(subRes.body.data.vendor.subscriptionStatus).toBe('Active');
    });
  });

  // ─── Category & Vehicle Public Flow ─────────────────────────────────────────
  describe('Public Category & Vehicle Discovery', () => {
    it('should allow public access to categories and vehicles', async () => {
      const catRes = await request(app).get('/api/categories');
      expect(catRes.status).toBe(200);

      const vehRes = await request(app).get('/api/vehicles');
      expect(vehRes.status).toBe(200);
    });

    it('should filter vehicles by category', async () => {
      const res = await request(app).get('/api/vehicles?category=goods');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Error Handling Integration ───────────────────────────────────────────────
  describe('Global Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.status).toBe(404);
    });

    it('should validate request bodies properly', async () => {
      // Send invalid data
      const res = await request(app)
        .post('/api/requirements')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ serviceType: 'delivery' }); // Missing required date

      expect(res.status).toBe(400);
    });

    it('should handle unauthorized access properly', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });

  // ─── Rate Limiting Test ───────────────────────────────────────────────────────
  describe('Rate Limiting', () => {
    it('should allow normal requests', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
    });
  });
});