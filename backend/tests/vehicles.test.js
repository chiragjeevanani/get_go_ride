import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Vehicle from '../src/models/Vehicle.model.js';
import jwt from 'jsonwebtoken';

let adminToken;
let userToken;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
  userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  await Vehicle.deleteMany({});
});

describe('Vehicles API', () => {
  // ─── GET /api/vehicles (Public) ───────────────────────────────────────────────
  describe('GET /api/vehicles', () => {
    it('should return empty array when no vehicles exist', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return active vehicles sorted by order', async () => {
      await Vehicle.create([
        { name: 'Vehicle B', capacity: '1 Ton', categorySlug: 'test', order: 2, isActive: true },
        { name: 'Vehicle A', capacity: '500 kg', categorySlug: 'test', order: 1, isActive: true },
        { name: 'Inactive', capacity: '2 Ton', categorySlug: 'test', order: 3, isActive: false }
      ]);

      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe('Vehicle A');
    });

    it('should filter vehicles by category', async () => {
      await Vehicle.create([
        { name: 'Truck', capacity: '5 Ton', categorySlug: 'trucking', isActive: true },
        { name: 'Bike', capacity: '50 kg', categorySlug: 'delivery', isActive: true }
      ]);

      const res = await request(app).get('/api/vehicles?category=trucking');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Truck');
    });

    it('should filter vehicles by categorySlugs array', async () => {
      await Vehicle.create([
        { name: 'Mini Truck', capacity: '1 Ton', categorySlugs: ['trucking', 'local'], isActive: true },
        { name: 'Large Truck', capacity: '10 Ton', categorySlugs: ['trucking'], isActive: true }
      ]);

      const res = await request(app).get('/api/vehicles?category=local');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Mini Truck');
    });
  });

  // ─── POST /api/vehicles (Admin Only) ───────────────────────────────────────────
  describe('POST /api/vehicles', () => {
    it('should create vehicle with valid admin token', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Tata Ace', capacity: '1 Ton', categorySlug: 'local-delivery' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Tata Ace');
      expect(res.body.data.capacity).toBe('1 Ton');
    });

    it('should create vehicle with multiple category slugs', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Truck', capacity: '5 Ton', categorySlugs: ['trucking', 'intercity'] });

      expect(res.status).toBe(201);
      expect(res.body.data.categorySlugs).toContain('trucking');
      expect(res.body.data.categorySlugs).toContain('intercity');
    });

    it('should create vehicle with isMostBooked flag', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Popular Truck', capacity: '3 Ton', categorySlug: 'trucking', isMostBooked: true });

      expect(res.status).toBe(201);
      expect(res.body.data.isMostBooked).toBe(true);
    });

    it('should reject when name is missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ capacity: '1 Ton', categorySlug: 'test' });

      expect(res.status).toBe(400);
    });

    it('should reject when capacity is missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Truck', categorySlug: 'test' });

      expect(res.status).toBe(400);
    });

    it('should reject when category is missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Truck', capacity: '1 Ton' });

      expect(res.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test', capacity: '1 Ton', categorySlug: 'test' });

      expect(res.status).toBe(403);
    });
  });

  // ─── PATCH /api/vehicles/:id (Admin Only) ──────────────────────────────────────
  describe('PATCH /api/vehicles/:id', () => {
    let vehicleId;

    beforeEach(async () => {
      const vehicle = await Vehicle.create({
        name: 'Original',
        capacity: '1 Ton',
        categorySlug: 'test'
      });
      vehicleId = vehicle._id;
    });

    it('should update vehicle name', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Vehicle' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Vehicle');
    });

    it('should update vehicle capacity', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ capacity: '2 Ton' });

      expect(res.status).toBe(200);
      expect(res.body.data.capacity).toBe('2 Ton');
    });

    it('should update isActive status', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should update category slugs', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categorySlugs: ['new-cat-1', 'new-cat-2'] });

      expect(res.status).toBe(200);
      expect(res.body.data.categorySlugs).toContain('new-cat-1');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const res = await request(app)
        .patch('/api/vehicles/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /api/vehicles/:id (Admin Only) ─────────────────────────────────────
  describe('DELETE /api/vehicles/:id', () => {
    it('should delete existing vehicle', async () => {
      const vehicle = await Vehicle.create({ name: 'To Delete', capacity: '1 Ton', categorySlug: 'test' });

      const res = await request(app)
        .delete(`/api/vehicles/${vehicle._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const deleted = await Vehicle.findById(vehicle._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent vehicle', async () => {
      const res = await request(app)
        .delete('/api/vehicles/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});