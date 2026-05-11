import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Bid from '../src/models/Bid.model.js';
import Requirement from '../src/models/Requirement.model.js';
import User from '../src/models/User.model.js';
import Vendor from '../src/models/Vendor.model.js';
import jwt from 'jsonwebtoken';

let userToken;
let vendorToken;
let adminToken;
let userId;
let vendorId;
let requirementId;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  await Bid.deleteMany({});
  await Requirement.deleteMany({});
  await User.deleteMany({});
  await Vendor.deleteMany({});

  // Create user
  const user = await User.create({ phone: '9876543210', name: 'Test User' });
  userId = user._id;
  userToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // Create vendor
  const vendor = await Vendor.create({
    phone: '9876543211',
    name: 'Test Vendor',
    serviceCategories: ['goods'],
    onboardingComplete: true,
    subscriptionStatus: 'Active',
  });
  vendorId = vendor._id;
  vendorToken = jwt.sign({ id: vendor._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // Create requirement
  const requirement = await Requirement.create({
    user: userId,
    serviceType: 'goods',
    vehicleType: 'truck',
    pickup: { address: 'Pickup Address', lat: 12.34, lon: 56.78 },
    drops: [{ address: 'Drop Address', lat: 12.35, lon: 56.79 }],
    items: 'Furniture',
    weight: '500kg',
    date: new Date('2026-12-31'),
    time: '10:00',
    status: 'pending'
  });
  requirementId = requirement._id;
});

describe('Bids API', () => {
  // ─── POST /api/leads/:id/bid ───────────────────────────────────────────────────
  describe('POST /api/leads/:id/bid', () => {
    it('should place a bid on a pending requirement', async () => {
      const res = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1500, notes: 'Can deliver by tomorrow' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(1500);
      expect(res.body.data.vendor.toString()).toBe(vendorId.toString());
    });

    it('should update requirement status to bidding', async () => {
      await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1500 });

      const req = await Requirement.findById(requirementId);
      expect(req.status).toBe('bidding');
    });

    it('should reject duplicate bid from same vendor', async () => {
      await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1500 });

      const res = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 2000 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ALREADY_BID');
    });

    it('should reject bid on non-existent requirement', async () => {
      const res = await request(app)
        .post('/api/leads/507f1f77bcf86cd799439011/bid')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1500 });

      expect(res.status).toBe(404);
    });

    it('should reject bid on accepted requirement', async () => {
      await Requirement.findByIdAndUpdate(requirementId, { status: 'accepted' });

      const res = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1500 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('CLOSED');
    });

    it('should reject unauthenticated bid', async () => {
      const res = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .send({ amount: 1500 });

      expect(res.status).toBe(401);
    });

    it('should reject user from placing bid', async () => {
      const res = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 1500 });

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /api/requirements/:id/bids ───────────────────────────────────────────
  describe('GET /api/requirements/:id/bids', () => {
    it('should return bids for requirement owner', async () => {
      await Bid.create({ requirement: requirementId, vendor: vendorId, amount: 1500 });

      const res = await request(app)
        .get(`/api/requirements/${requirementId}/bids`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return bids for admin', async () => {
      await Bid.create({ requirement: requirementId, vendor: vendorId, amount: 1500 });

      const res = await request(app)
        .get(`/api/requirements/${requirementId}/bids`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should reject non-owner vendor', async () => {
      await Bid.create({ requirement: requirementId, vendor: vendorId, amount: 1500 });

      const res = await request(app)
        .get(`/api/requirements/${requirementId}/bids`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent requirement', async () => {
      const res = await request(app)
        .get('/api/requirements/507f1f77bcf86cd799439011/bids')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── PATCH /api/bids/:id/accept ───────────────────────────────────────────────
  describe('PATCH /api/bids/:id/accept', () => {
    let bidId;

    beforeEach(async () => {
      const bid = await Bid.create({ requirement: requirementId, vendor: vendorId, amount: 1500 });
      bidId = bid._id;
    });

    it('should accept a bid and lock requirement', async () => {
      const res = await request(app)
        .patch(`/api/bids/${bidId}/accept`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('accepted');

      const req = await Requirement.findById(requirementId);
      expect(req.status).toBe('accepted');
      expect(req.acceptedBid.toString()).toBe(bidId.toString());
    });

    it('should reject other bids when one is accepted', async () => {
      // Create another vendor and bid
      const vendor2 = await Vendor.create({ phone: '9876543212', name: 'Vendor 2', serviceCategories: ['test'], subscriptionStatus: 'Active' });
      const vendor2Token = jwt.sign({ id: vendor2._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

      await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendor2Token}`)
        .send({ amount: 1200 });

      // Accept first bid
      await request(app)
        .patch(`/api/bids/${bidId}/accept`)
        .set('Authorization', `Bearer ${userToken}`);

      // Check other bids are rejected
      const otherBids = await Bid.find({ requirement: requirementId, _id: { $ne: bidId } });
      expect(otherBids[0].status).toBe('rejected');
    });

    it('should reject non-owner from accepting bid', async () => {
      const res = await request(app)
        .patch(`/api/bids/${bidId}/accept`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject if requirement already has accepted bid', async () => {
      await Requirement.findByIdAndUpdate(requirementId, { status: 'accepted' });

      const res = await request(app)
        .patch(`/api/bids/${bidId}/accept`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ALREADY_ACCEPTED');
    });
  });
});