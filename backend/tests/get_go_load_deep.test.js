import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Vendor from '../src/models/Vendor.model.js';
import Category from '../src/models/Category.model.js';
import Vehicle from '../src/models/Vehicle.model.js';
import jwt from 'jsonwebtoken';

let userToken, vendorToken, adminToken;
let userId, vendorId;

beforeAll(() => {
  adminToken = jwt.sign(
    { id: 'admin123_deep', role: 'admin' }, 
    process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_for_vitest', 
    { expiresIn: '1h' }
  );
});

beforeEach(async () => {
  // Clear collections for deterministic deep testing
  await User.deleteMany({});
  await Vendor.deleteMany({});
  await Category.deleteMany({});
  await Vehicle.deleteMany({});

  // Setup Test User
  const user = await User.create({ phone: '9000000001', name: 'Deep User' });
  userId = user._id;
  userToken = jwt.sign(
    { id: user._id, role: 'user' }, 
    process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_for_vitest', 
    { expiresIn: '1h' }
  );

  // Setup Test Vendor
  const vendor = await Vendor.create({ 
    phone: '9000000002', 
    name: 'Deep Vendor', 
    serviceCategories: ['goods'],
    onboardingComplete: true,
    isVerified: true,
    status: 'Verified'
  });
  vendorId = vendor._id;
  vendorToken = jwt.sign(
    { id: vendor._id, role: 'vendor' }, 
    process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_for_vitest', 
    { expiresIn: '1h' }
  );
});

describe('Get Go Load — Deep Backend Integration & Security Tests', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Dynamic Category & Vehicle Class CRUD + Data Integrity
  // ──────────────────────────────────────────────────────────────────────────
  describe('Dynamic Categories & Vehicle Class Management', () => {
    it('should allow admin to manage categories and vehicles, and expose them correctly to users', async () => {
      // Step A: Create category
      const catRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Heavy Moving',
          slug: 'heavy_moving',
          description: 'Large trucks and trailers for industrial logistics',
          icon: 'Truck'
        });
      
      expect(catRes.status).toBe(201);
      expect(catRes.body.success).toBe(true);
      expect(catRes.body.data.slug).toBe('heavy_moving');

      const categoryId = catRes.body.data._id;

      // Step B: Create a vehicle class under this category slug
      const vehicleRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Mega Loader Pro',
          capacity: '5.5 Tonnes',
          details: 'Heavy Duty • 6 Tyres • Closed Container',
          categorySlug: 'heavy_moving',
          isMostBooked: true,
          isActive: true,
          order: 1
        });
      
      expect(vehicleRes.status).toBe(201);
      expect(vehicleRes.body.success).toBe(true);
      expect(vehicleRes.body.data.name).toBe('Mega Loader Pro');
      expect(vehicleRes.body.data.capacity).toBe('5.5 Tonnes');
      expect(vehicleRes.body.data.details).toBe('Heavy Duty • 6 Tyres • Closed Container');

      const vehicleId = vehicleRes.body.data._id;

      // Step C: Fetch vehicles on user side under category "heavy_moving"
      const userVehiclesRes = await request(app)
        .get('/api/vehicles?categorySlug=heavy_moving');
      
      expect(userVehiclesRes.status).toBe(200);
      expect(userVehiclesRes.body.success).toBe(true);
      expect(Array.isArray(userVehiclesRes.body.data)).toBe(true);
      expect(userVehiclesRes.body.data.length).toBe(1);
      
      const matchedVehicle = userVehiclesRes.body.data[0];
      expect(matchedVehicle.name).toBe('Mega Loader Pro');
      expect(matchedVehicle.capacity).toBe('5.5 Tonnes');
      expect(matchedVehicle.details).toBe('Heavy Duty • 6 Tyres • Closed Container');

      // Step D: Admin updates vehicle details
      const updateRes = await request(app)
        .patch(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          capacity: '6.0 Tonnes',
          details: 'Upgraded • 6 Tyres • Air Suspended'
        });
      
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.capacity).toBe('6.0 Tonnes');
      expect(updateRes.body.data.details).toBe('Upgraded • 6 Tyres • Air Suspended');

      // Step E: Admin deletes vehicle
      const deleteRes = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify removal
      const checkRes = await request(app)
        .get('/api/vehicles?categorySlug=heavy_moving');
      expect(checkRes.body.data.length).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Access Control (Security Audits - IDOR / Privilege Escalation)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Strict Role-based Access Control', () => {
    it('should prevent unauthorized users or vendors from accessing admin routes', async () => {
      // Attempt to create a category as standard user -> should fail 403
      const userCatRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Forbidden Goods',
          slug: 'forbidden'
        });
      expect(userCatRes.status).toBe(403);

      // Attempt to create a vehicle class as vendor -> should fail 403
      const vendorVehRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Ghost Carrier',
          capacity: '1 Tonne',
          categorySlug: 'goods'
        });
      expect(vendorVehRes.status).toBe(403);

      // Attempt to view administrative leads without auth header -> should fail 401
      const noAuthRes = await request(app)
        .get('/api/requirements');
      expect(noAuthRes.status).toBe(401);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Scheduling Date & Time Past Restrictions (Hardened API Safeguard)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Scheduling Past Time Prevention Checks', () => {
    it('should reject booking requirements with past dates or times', async () => {
      // Case A: Select yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const resPastDate = await request(app)
        .post('/api/requirements')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'goods',
          vehicleType: 'Tata Ace',
          pickup: { address: 'Indore' },
          drops: [{ address: 'Ujjain' }],
          items: 'Steel rods',
          weight: '1.2 Tonnes',
          date: yesterdayStr,
          time: '12:00'
        });

      // Assert that past booking is rejected
      expect(resPastDate.status).toBe(400);
      expect(resPastDate.body.success).toBe(false);
      expect(resPastDate.body.message).toContain('past');

      // Case B: Select current date, but past time
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      now.setHours(now.getHours() - 1); // 1 hour ago
      const pastTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const resPastTime = await request(app)
        .post('/api/requirements')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'goods',
          vehicleType: 'Tata Ace',
          pickup: { address: 'Indore' },
          drops: [{ address: 'Ujjain' }],
          items: 'Steel rods',
          weight: '1.2 Tonnes',
          date: todayStr,
          time: pastTimeStr
        });

      // Assert that past time is rejected
      expect(resPastTime.status).toBe(400);
      expect(resPastTime.body.success).toBe(false);
      expect(resPastTime.body.message).toContain('past');
    });

    it('should accept requirements scheduled in the future normally', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const resFuture = await request(app)
        .post('/api/requirements')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'goods',
          vehicleType: 'Tata Ace',
          pickup: { address: 'Indore' },
          drops: [{ address: 'Ujjain' }],
          items: 'Steel rods',
          weight: '1.2 Tonnes',
          date: tomorrowStr,
          time: '18:00'
        });

      expect(resFuture.status).toBe(201);
      expect(resFuture.body.success).toBe(true);
      expect(resFuture.body.data.date.split('T')[0]).toBe(tomorrowStr);
    });
  });
});
