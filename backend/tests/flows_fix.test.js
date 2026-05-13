import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import SubscriptionPlan from '../src/models/SubscriptionPlan.model.js';
import Vendor from '../src/models/Vendor.model.js';
import Requirement from '../src/models/Requirement.model.js';
import Bid from '../src/models/Bid.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

let vendorToken;
let vendorId;
let requirementId;

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = 'test_access_secret';
  process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret_key';
});

beforeEach(async () => {
  await SubscriptionPlan.deleteMany({});
  await Vendor.deleteMany({});
  await Requirement.deleteMany({});
  await Bid.deleteMany({});

  // Create vendor
  const vendor = await Vendor.create({ 
    phone: '9876543211', 
    name: 'Flow Test Vendor',
    serviceCategories: ['house', 'general']
  });
  vendorId = vendor._id;
  vendorToken = jwt.sign({ id: vendor._id, role: 'vendor' }, 'test_access_secret', { expiresIn: '1h' });

  // Create requirement/lead
  const reqObj = await Requirement.create({
    user: '507f1f77bcf86cd799439011',
    serviceType: 'house',
    vehicleType: 'Tata Ace',
    pickup: { address: 'Pickup Location', lat: 12.97, lon: 77.59 },
    drops: [{ address: 'Drop Location', lat: 12.93, lon: 77.57 }],
    items: 'Some Items',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '12:00',
    price: 1500
  });
  requirementId = reqObj._id;
});

describe('New Gated Flow Fixes Integration Tests', () => {
  
  // ─── Component 2 Tests: Active Subscription & Quota checks ───
  describe('Vendor Lead Discovery Subscription Guard', () => {
    it('should block browsing leads if vendor has no active subscription', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('ACTIVE_SUBSCRIPTION_REQUIRED');
    });

    it('should block placing a bid if vendor has no active subscription', async () => {
      const res = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1200, notes: 'Can do it' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('ACTIVE_SUBSCRIPTION_REQUIRED');
    });

    it('should allow browsing leads and bidding if vendor has an active subscription', async () => {
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

      const browseRes = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(browseRes.status).toBe(200);
      expect(browseRes.body.success).toBe(true);

      const bidRes = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1200, notes: 'Can do it' });

      expect(bidRes.status).toBe(201);
      expect(bidRes.body.success).toBe(true);
    });

    it('should enforce quota limit on bidding and decrement on placement', async () => {
      const plan = await SubscriptionPlan.create({
        name: 'Limited Plan',
        price: 499,
        durationDays: 30,
        leadQuota: { type: 'limited', limit: 1, period: 'day' },
        isActive: true
      });

      await Vendor.findByIdAndUpdate(vendorId, {
        activeSubscription: plan._id,
        subscriptionStatus: 'Active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        leadQuotaUsed: 0,
        leadQuotaResetAt: new Date()
      });

      // Place first bid (should succeed)
      const bidRes1 = await request(app)
        .post(`/api/leads/${requirementId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1200, notes: 'First bid' });

      expect(bidRes1.status).toBe(201);
      
      const vendorAfter = await Vendor.findById(vendorId);
      expect(vendorAfter.leadQuotaUsed).toBe(1);

      // Create a second lead to bid on
      const reqObj2 = await Requirement.create({
        user: '507f1f77bcf86cd799439011',
        serviceType: 'house',
        vehicleType: 'Tata Ace',
        pickup: { address: 'Pickup 2' },
        drops: [{ address: 'Drop 2' }],
        items: 'Some other items',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '14:00'
      });

      // Place second bid (should exceed quota)
      const bidRes2 = await request(app)
        .post(`/api/leads/${reqObj2._id}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1300, notes: 'Second bid' });

      expect(bidRes2.status).toBe(403);
      expect(bidRes2.body.error).toBe('QUOTA_EXCEEDED');
    });
  });

  // ─── Component 3 Tests: Razorpay Webhook Simulation ───
  describe('Razorpay Webhook Asynchronous Activation', () => {
    it('should reject webhook request if signature is invalid', async () => {
      const payload = {
        event: 'order.paid',
        payload: {
          order: {
            entity: {
              notes: { planId: '507f1f77bcf86cd799439011', vendorId }
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/plans/webhook/razorpay')
        .set('x-razorpay-signature', 'wrong_signature')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully activate vendor subscription on valid webhook event', async () => {
      const plan = await SubscriptionPlan.create({
        name: 'Premium Webhook Plan',
        price: 999,
        durationDays: 30,
        leadQuota: { type: 'unlimited' },
        isActive: true
      });

      const payload = {
        event: 'order.paid',
        payload: {
          order: {
            entity: {
              notes: { 
                planId: plan._id.toString(), 
                vendorId: vendorId.toString() 
              }
            }
          }
        }
      };

      // Generate correct signature
      const shasum = crypto.createHmac('sha256', 'webhook_secret_key');
      shasum.update(JSON.stringify(payload));
      const validSignature = shasum.digest('hex');

      const res = await request(app)
        .post('/api/plans/webhook/razorpay')
        .set('x-razorpay-signature', validSignature)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedVendor = await Vendor.findById(vendorId);
      expect(updatedVendor.subscriptionStatus).toBe('Active');
      expect(updatedVendor.activeSubscription.toString()).toBe(plan._id.toString());
      expect(updatedVendor.leadQuotaUsed).toBe(0);
    });
  });
});
