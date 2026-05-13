import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import jwt from 'jsonwebtoken';

let userToken;
let adminToken;
let userId;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  const user = await User.create({
    phone: '9876543210',
    name: 'Test User',
    email: 'test@getgoload.com',
  });
  userId = user._id;

  userToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

describe('User Module API', () => {
  describe('GET /api/users/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    it('should return own profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('9876543210');
      expect(res.body.data.name).toBe('Test User');
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update profile name and email', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name', email: 'updated@getgoload.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.email).toBe('updated@getgoload.com');
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'notanemail' });
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/me/wallet', () => {
    it('should return wallet details', async () => {
      const res = await request(app)
        .get('/api/users/me/wallet')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.balance).toBeDefined();
      expect(res.body.data.transactions).toBeDefined();
    });
  });

  describe('POST /api/users/me/addresses', () => {
    it('should add a saved address', async () => {
      const res = await request(app)
        .post('/api/users/me/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ label: 'Home', address: '123 Main St', lat: 12.34, lon: 56.78 });
      
      expect(res.status).toBe(201);
      expect(res.body.data.savedAddresses).toHaveLength(1);
      expect(res.body.data.savedAddresses[0].label).toBe('Home');
    });
  });

  describe('DELETE /api/users/me/addresses/:addressId', () => {
    it('should delete a saved address', async () => {
      // Add address first
      await request(app)
        .post('/api/users/me/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ label: 'Work', address: '456 Business Rd', lat: 10, lon: 20 });

      // Get user to find the address ID
      const userRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);
      
      const addressId = userRes.body.data.savedAddresses[0]._id;

      const res = await request(app)
        .delete(`/api/users/me/addresses/${addressId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.savedAddresses).toHaveLength(0);
    });
  });

  describe('Admin Routes', () => {
    it('GET /api/users should return all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/users/:id should return single user', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data._id.toString()).toBe(userId.toString());
    });

    it('PATCH /api/users/:id/status should block a user', async () => {
      const res = await request(app)
        .patch(`/api/users/${userId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Blocked' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Blocked');
    });

    it('should reject non-admin from admin routes', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
    });
  });
});
