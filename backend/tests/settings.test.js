import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import SystemSetting from '../src/models/SystemSetting.model.js';
import jwt from 'jsonwebtoken';

let adminToken;
let userToken;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
  userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  await SystemSetting.deleteMany({});
});

describe('Settings API', () => {
  // ─── GET /api/settings (Public) ──────────────────────────────────────────────
  describe('GET /api/settings', () => {
    it('should return default settings when none exist', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.walletSignupBonus).toBe(50);
      expect(res.body.data.maxWalletUsage).toBe(500);
    });

    it('should return stored settings', async () => {
      await SystemSetting.create([
        { key: 'testKey1', value: 'testValue1' },
        { key: 'testKey2', value: 'testValue2' }
      ]);

      const res = await request(app).get('/api/settings');
      expect(res.status).toBe(200);
      expect(res.body.data.testKey1).toBe('testValue1');
      expect(res.body.data.testKey2).toBe('testValue2');
    });
  });

  // ─── PUT /api/settings (Admin Only) ───────────────────────────────────────────
  describe('PUT /api/settings', () => {
    it('should update settings with admin token', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newSetting: 'newValue', anotherSetting: 'anotherValue' });

      expect(res.status).toBe(200);
      expect(res.body.data.newSetting).toBe('newValue');
      expect(res.body.data.anotherSetting).toBe('anotherValue');
    });

    it('should update existing setting', async () => {
      await SystemSetting.create({ key: 'existingKey', value: 'oldValue' });

      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ existingKey: 'newValue' });

      expect(res.status).toBe(200);
      expect(res.body.data.existingKey).toBe('newValue');
    });

    it('should reject non-admin user', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ testKey: 'testValue' });

      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .put('/api/settings')
        .send({ testKey: 'testValue' });

      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/settings/razorpay-key (Public) ────────────────────────────────
  describe('GET /api/settings/razorpay-key', () => {
    it('should return Razorpay key', async () => {
      const res = await request(app).get('/api/settings/razorpay-key');
      expect(res.status).toBe(200);
      expect(res.body.data.keyId).toBeDefined();
    });
  });
});