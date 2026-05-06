import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Vendor from '../src/models/Vendor.model.js';
import Requirement from '../src/models/Requirement.model.js';
import Bid from '../src/models/Bid.model.js';
import jwt from 'jsonwebtoken';

let userToken, vendorToken, adminToken;
let userId, vendorId, requirementId;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  // Setup User
  const user = await User.create({ phone: '9000000001', name: 'Req User' });
  userId = user._id;
  userToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // Setup Vendor
  const vendor = await Vendor.create({ 
    phone: '9000000002', 
    name: 'Req Vendor', 
    serviceCategories: ['goods', 'construction'],
    onboardingComplete: true,
    isVerified: true,
    status: 'Verified'
  });
  vendorId = vendor._id;
  vendorToken = jwt.sign({ id: vendor._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

describe('Requirement & Lead System', () => {
  describe('POST /api/requirements', () => {
    it('should create a new requirement', async () => {
      const res = await request(app)
        .post('/api/requirements')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'goods',
          vehicleType: 'Tata Ace',
          pickup: { address: 'Indore Market' },
          drops: [{ address: 'Vijay Nagar' }],
          items: 'Electronics',
          weight: '200kg',
          date: '2026-05-10',
          time: '14:00'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.data.serviceType).toBe('goods');
      requirementId = res.body.data._id;
    });
  });

  describe('GET /api/requirements/my', () => {
    it('should return user requirements', async () => {
      await Requirement.create({
        user: userId,
        serviceType: 'house',
        vehicleType: 'Bolero',
        pickup: { address: 'A' },
        drops: [{ address: 'B' }],
        items: 'Furniture',
        date: new Date(),
        time: '10:00'
      });

      const res = await request(app)
        .get('/api/requirements/my')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/leads', () => {
    it('should return leads matching vendor categories', async () => {
      await Requirement.create({
        user: userId,
        serviceType: 'goods',
        vehicleType: 'Tata Ace',
        pickup: { address: 'LeadLoc' },
        drops: [{ address: 'DropLoc' }],
        items: 'Box',
        date: new Date(),
        time: '12:00',
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${vendorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.some(l => l.items === 'Box')).toBe(true);
    });
  });

  describe('Bidding System', () => {
    let testReqId;

    beforeEach(async () => {
      const req = await Requirement.create({
        user: userId,
        serviceType: 'goods',
        vehicleType: 'Tata Ace',
        pickup: { address: 'A' },
        drops: [{ address: 'B' }],
        items: 'C',
        date: new Date(),
        time: '10:00'
      });
      testReqId = req._id;
    });

    it('should allow vendor to place a bid', async () => {
      const res = await request(app)
        .post(`/api/leads/${testReqId}/bid`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ amount: 1500, notes: 'Available immediately' });
      
      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(1500);
    });

    it('should allow user to view bids and accept one', async () => {
      const bid = await Bid.create({
        requirement: testReqId,
        vendor: vendorId,
        amount: 2000
      });

      const res = await request(app)
        .patch(`/api/bids/${bid._id}/accept`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('accepted');
      
      const updatedReq = await Requirement.findById(testReqId);
      expect(updatedReq.status).toBe('accepted');
      expect(updatedReq.acceptedBid.toString()).toBe(bid._id.toString());
    });
  });
});
