import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Vendor from '../src/models/Vendor.model.js';
import jwt from 'jsonwebtoken';

let vendorToken;
let adminToken;
let vendorId;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  const vendor = await Vendor.create({
    phone: '9876543211',
    name: 'Test Vendor',
    vehicleType: 'Mini Truck (Tata Ace)',
    serviceCategories: ['Goods Transport']
  });
  vendorId = vendor._id;
  vendorToken = jwt.sign({ id: vendor._id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

describe('Vendor Module API', () => {
  describe('GET /api/vendors/me', () => {
    it('should return own profile', async () => {
      const res = await request(app)
        .get('/api/vendors/me')
        .set('Authorization', `Bearer ${vendorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.phone).toBe('9876543211');
      expect(res.body.data.name).toBe('Test Vendor');
    });
  });

  describe('PATCH /api/vendors/me', () => {
    it('should update profile', async () => {
      const res = await request(app)
        .patch('/api/vendors/me')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ nativeCity: 'Indore' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.nativeCity).toBe('Indore');
    });
  });

  describe('POST /api/vendors/me/onboarding', () => {
    it('should complete onboarding wizard data', async () => {
      const res = await request(app)
        .post('/api/vendors/me/onboarding')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          vehicleRegNumber: 'MP09AB1234',
          vehicleCapacity: '800kg',
          operatingAreas: 'Indore',
          location: 'Bhawarkua'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.vehicleRegNumber).toBe('MP09AB1234');
      expect(res.body.data.onboardingComplete).toBe(true);
    });
  });

  describe('Admin Routes', () => {
    it('GET /api/vendors should return all vendors', async () => {
      const res = await request(app)
        .get('/api/vendors')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/vendors/:id should return single vendor', async () => {
      const res = await request(app)
        .get(`/api/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data._id.toString()).toBe(vendorId.toString());
    });

    it('PATCH /api/vendors/:id/verify should update vendor status', async () => {
      const res = await request(app)
        .patch(`/api/vendors/${vendorId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Verified' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Verified');
      expect(res.body.data.isVerified).toBe(true);
    });
  });
});
