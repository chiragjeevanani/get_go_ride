import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import SubscriptionPlan from '../src/models/SubscriptionPlan.model.js';
import Vendor from '../src/models/Vendor.model.js';
import jwt from 'jsonwebtoken';

let adminToken;
let vendorToken;
let vendorId;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  await SubscriptionPlan.deleteMany({});
  await Vendor.deleteMany({});

  // Create vendor
  const vendor = await Vendor.create({ phone: '9876543211', name: 'Test Vendor' });
  vendorId = vendor._id;
  vendorToken = jwt.sign({ id: vendor._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

describe('Plans API', () => {
  // ─── GET /api/plans (Public) ─────────────────────────────────────────────────
  describe('GET /api/plans', () => {
    it('should return active plans', async () => {
      await SubscriptionPlan.create([
        { name: 'Free Plan', price: 0, durationDays: 30, isActive: true },
        { name: 'Basic Plan', price: 499, durationDays: 30, isActive: true }
      ]);

      const res = await request(app).get('/api/plans');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should auto-create default plans if none exist', async () => {
      const res = await request(app).get('/api/plans');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── GET /api/plans/admin/all (Admin) ─────────────────────────────────────────────
  describe('GET /api/plans/admin/all', () => {
    it('should return all plans including inactive', async () => {
      await SubscriptionPlan.create([
        { name: 'Active Plan', price: 100, durationDays: 30, isActive: true },
        { name: 'Inactive Plan', price: 200, durationDays: 30, isActive: false }
      ]);

      const res = await request(app)
        .get('/api/plans/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should reject non-admin user', async () => {
      const res = await request(app)
        .get('/api/plans/admin/all')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /api/plans/:id ─────────────────────────────────────────────────────
  describe('GET /api/plans/:id', () => {
    it('should return a specific plan', async () => {
      const plan = await SubscriptionPlan.create({ name: 'Test Plan', price: 499, durationDays: 30, isActive: true });

      const res = await request(app).get(`/api/plans/${plan._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Plan');
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app).get('/api/plans/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/plans (Admin) ────────────────────────────────────────────────
  describe('POST /api/plans', () => {
    it('should create a new plan with admin token', async () => {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Premium Plan',
          price: 999,
          durationDays: 30,
          leadQuota: { type: 'limited', limit: 20, period: 'day' },
          features: { verifiedBadge: true }
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Premium Plan');
      expect(res.body.data.price).toBe(999);
    });

    it('should create plan with unlimited lead quota', async () => {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Unlimited Plan',
          price: 1999,
          durationDays: 30,
          leadQuota: { type: 'unlimited' }
        });

      expect(res.status).toBe(201);
      expect(res.body.data.leadQuota.type).toBe('unlimited');
    });

    it('should reject when name is missing', async () => {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 499, durationDays: 30 });

      expect(res.status).toBe(400);
    });

    it('should reject when price is missing', async () => {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Plan', durationDays: 30 });

      expect(res.status).toBe(400);
    });

    it('should reject when durationDays is missing', async () => {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Plan', price: 499 });

      expect(res.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ name: 'Test Plan', price: 499, durationDays: 30 });

      expect(res.status).toBe(403);
    });
  });

  // ─── PATCH /api/plans/:id (Admin) ────────────────────────────────────────────
  describe('PATCH /api/plans/:id', () => {
    let planId;

    beforeEach(async () => {
      const plan = await SubscriptionPlan.create({ name: 'Original', price: 499, durationDays: 30, isActive: true });
      planId = plan._id;
    });

    it('should update plan name', async () => {
      const res = await request(app)
        .patch(`/api/plans/${planId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Plan' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Plan');
    });

    it('should update plan price', async () => {
      const res = await request(app)
        .patch(`/api/plans/${planId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 799 });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(799);
    });

    it('should deactivate plan', async () => {
      const res = await request(app)
        .patch(`/api/plans/${planId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .patch('/api/plans/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /api/plans/:id (Admin - Soft Delete) ─────────────────────────────
  describe('DELETE /api/plans/:id', () => {
    it('should soft delete (deactivate) a plan', async () => {
      const plan = await SubscriptionPlan.create({ name: 'To Delete', price: 499, durationDays: 30, isActive: true });

      const res = await request(app)
        .delete(`/api/plans/${plan._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .delete('/api/plans/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/plans/:id/subscribe (Vendor) ────────────────────────────────
  describe('POST /api/plans/:id/subscribe', () => {
    it('should subscribe to a plan', async () => {
      const plan = await SubscriptionPlan.create({
        name: 'Test Plan',
        price: 499,
        durationDays: 30,
        features: { verifiedBadge: true },
        isActive: true
      });

      const res = await request(app)
        .post(`/api/plans/${plan._id}/subscribe`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vendor.subscriptionStatus).toBe('Active');
      expect(res.body.data.vendor.hasVerifiedBadge).toBe(true);
    });

    it('should reject inactive plan', async () => {
      const plan = await SubscriptionPlan.create({ name: 'Inactive', price: 499, durationDays: 30, isActive: false });

      const res = await request(app)
        .post(`/api/plans/${plan._id}/subscribe`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/plans/:id/subscribe-order (Vendor) ───────────────────────────
  describe('POST /api/plans/:id/subscribe-order', () => {
    it('should create Razorpay order for paid plan', async () => {
      const plan = await SubscriptionPlan.create({ name: 'Paid Plan', price: 499, durationDays: 30, isActive: true });

      const res = await request(app)
        .post(`/api/plans/${plan._id}/subscribe-order`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBeDefined();
    });

    it('should skip order for free plan', async () => {
      const plan = await SubscriptionPlan.create({ name: 'Free Plan', price: 0, durationDays: 30, isActive: true });

      const res = await request(app)
        .post(`/api/plans/${plan._id}/subscribe-order`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isFree).toBe(true);
    });
  });

  // ─── GET /api/plans/me/quota (Vendor) ────────────────────────────────────
  describe('GET /api/plans/me/quota', () => {
    it('should return no active subscription for non-subscribed vendor', async () => {
      const res = await request(app)
        .get('/api/plans/me/quota')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.allowed).toBe(false);
    });

    it('should allow unlimited for unlimited plan', async () => {
      const plan = await SubscriptionPlan.create({
        name: 'Unlimited Plan',
        price: 999,
        durationDays: 30,
        leadQuota: { type: 'unlimited' },
        isActive: true
      });

      await Vendor.findByIdAndUpdate(vendorId, {
        activeSubscription: plan._id,
        subscriptionStatus: 'Active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .get('/api/plans/me/quota')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.quota).toBe('unlimited');
    });
  });
});