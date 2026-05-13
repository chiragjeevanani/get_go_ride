import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Vendor from '../src/models/Vendor.model.js';
import Requirement from '../src/models/Requirement.model.js';
import Bid from '../src/models/Bid.model.js';
import Message from '../src/models/Message.model.js';
import jwt from 'jsonwebtoken';

let userToken;
let driverToken;
let userId;
let driverId;
let requirementId;
let bidId;

beforeEach(async () => {
  // 1. Create Customer
  const customer = await User.create({
    phone: '9999988888',
    name: 'Customer John',
    email: 'customer@getgoload.com',
  });
  userId = customer._id;
  userToken = jwt.sign({ id: customer._id, role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // 2. Create Driver (Vendor)
  const driver = await Vendor.create({
    phone: '7777766666',
    name: 'Driver Vijay',
    email: 'driver@getgoload.com',
    businessName: 'Vijay Cargo',
    isVerified: true,
  });
  driverId = driver._id;
  driverToken = jwt.sign({ id: driver._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });

  // 3. Create Requirement
  const requirement = await Requirement.create({
    user: customer._id,
    serviceType: 'house-shifting',
    pickup: { address: 'Colaba, Mumbai', lat: 18.92, lon: 72.82 },
    drops: [{ address: 'Andheri, Mumbai', lat: 19.11, lon: 72.87 }],
    weight: '1500kg',
    date: new Date(),
    time: '12:00 PM',
    items: 'Household furniture and electronics',
    vehicleType: 'Tata Ace',
    requirementId: 'REQ-99999',
  });
  requirementId = requirement._id;

  // 4. Create Bid
  const bid = await Bid.create({
    requirement: requirement._id,
    vendor: driver._id,
    amount: 3000,
    notes: 'Can arrange 2 helpers.',
    status: 'pending',
  });
  bidId = bid._id;
});

describe('Chat & Active Negotiations Module API', () => {
  describe('GET /api/chats/user/active', () => {
    it('should retrieve active negotiations for the customer user', async () => {
      const res = await request(app)
        .get('/api/chats/user/active')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].amount).toBe(3000);
      expect(res.body.data[0].vendor.name).toBe('Driver Vijay');
    });

    it('should prevent drivers from querying customer endpoint', async () => {
      const res = await request(app)
        .get('/api/chats/user/active')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/chats/driver/active', () => {
    it('should retrieve active negotiations for the driver vendor', async () => {
      const res = await request(app)
        .get('/api/chats/driver/active')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].requirement.serviceType).toBe('house-shifting');
    });
  });

  describe('GET /api/chats/:bidId/messages', () => {
    it('should retrieve the message history for a negotiation room', async () => {
      // Create a test message in DB first
      await Message.create({
        requirement: requirementId,
        bid: bidId,
        sender: userId,
        senderModel: 'User',
        senderRole: 'user',
        text: 'Hello Driver, is ₹3000 finalized?',
        type: 'text',
      });

      const res = await request(app)
        .get(`/api/chats/${bidId}/messages`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.messages).toHaveLength(1);
      expect(res.body.data.messages[0].text).toBe('Hello Driver, is ₹3000 finalized?');
      expect(res.body.data.bid.amount).toBe(3000);
    });
  });

  describe('POST /api/chats/:bidId/messages', () => {
    it('should allow customer to transmit standard messages', async () => {
      const res = await request(app)
        .post(`/api/chats/${bidId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ text: 'Are you available in morning slots?', type: 'text' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.senderRole).toBe('user');
      expect(res.body.data.text).toBe('Are you available in morning slots?');

      // Verify insertion in database
      const count = await Message.countDocuments({ bid: bidId });
      expect(count).toBe(1);
    });
  });

  describe('POST /api/chats/:bidId/offer', () => {
    it('should submit a counter-offer, modifying the Bid model in database', async () => {
      const res = await request(app)
        .post(`/api/chats/${bidId}/offer`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 2500 });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('offer');
      expect(res.body.data.price).toBe(2500);

      // Verify that the Bid amount is updated directly in DB (Option B: Active Bid Syncing)
      const updatedBid = await Bid.findById(bidId);
      expect(updatedBid.amount).toBe(2500);
    });

    it('should reject non-positive amounts', async () => {
      const res = await request(app)
        .post(`/api/chats/${bidId}/offer`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: -100 });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/chats/:bidId/accept', () => {
    it('should accept the proposal, locking requirement and rejecting competing bids', async () => {
      // Create a second driver and a second bid to verify they get auto-rejected
      const secondDriver = await Vendor.create({
        phone: '1234512345',
        name: 'Driver Rahul',
        email: 'rahul@getgoload.com',
      });
      const competingBid = await Bid.create({
        requirement: requirementId,
        vendor: secondDriver._id,
        amount: 3500,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/api/chats/${bidId}/accept`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify selected bid status is accepted
      const updatedBid = await Bid.findById(bidId);
      expect(updatedBid.status).toBe('accepted');

      // Verify requirement is updated with accepted status and references acceptedBid
      const updatedReq = await Requirement.findById(requirementId);
      expect(updatedReq.status).toBe('accepted');
      expect(updatedReq.acceptedBid.toString()).toBe(bidId.toString());

      // Verify that competing bid is auto-rejected
      const updatedCompeting = await Bid.findById(competingBid._id);
      expect(updatedCompeting.status).toBe('rejected');
    });

    it('should block drivers from accepting their own proposal', async () => {
      const res = await request(app)
        .post(`/api/chats/${bidId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/chats/:bidId/reopen', () => {
    it('should successfully reopen a previously accepted deal and reset all statuses to pending', async () => {
      // 1. Setup competing bid
      const secondDriver = await Vendor.create({
        phone: '1234512345',
        name: 'Driver Rahul',
        email: 'rahul@getgoload.com',
      });
      const competingBid = await Bid.create({
        requirement: requirementId,
        vendor: secondDriver._id,
        amount: 3500,
        status: 'pending',
      });

      // 2. Accept first bid to transition everything into accepted status
      await request(app)
        .post(`/api/chats/${bidId}/accept`)
        .set('Authorization', `Bearer ${userToken}`);

      // Verify lock state
      let req = await Requirement.findById(requirementId);
      expect(req.status).toBe('accepted');

      // 3. Call reopen endpoint
      const res = await request(app)
        .post(`/api/chats/${bidId}/reopen`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 4. Verify everything was correctly restored/unlocked
      const reopenedBid = await Bid.findById(bidId);
      expect(reopenedBid.status).toBe('pending');

      req = await Requirement.findById(requirementId);
      expect(req.status).toBe('bidding');
      expect(req.acceptedBid).toBeNull();

      const competingReopened = await Bid.findById(competingBid._id);
      expect(competingReopened.status).toBe('pending');

      // Verify that a system warning log message was created
      const msg = await Message.findOne({ bid: bidId, text: /⚠️ DEAL REOPENED!/ });
      expect(msg).not.toBeNull();
    });

    it('should block unauthorized users from reopening the deal', async () => {
      const res = await request(app)
        .post(`/api/chats/${bidId}/reopen`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(403);
    });
  });
});
