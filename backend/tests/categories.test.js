import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Category from '../src/models/Category.model.js';
import jwt from 'jsonwebtoken';

let adminToken;
let userToken;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
  userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  await Category.deleteMany({});
});

describe('Categories API', () => {
  // ─── GET /api/categories (Public) ─────────────────────────────────────────────
  describe('GET /api/categories', () => {
    it('should return empty array when no categories exist', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return active categories sorted by order', async () => {
      await Category.create([
        { name: 'Category B', slug: 'cat-b', order: 2, isActive: true },
        { name: 'Category A', slug: 'cat-a', order: 1, isActive: true },
        { name: 'Inactive', slug: 'inactive', order: 3, isActive: false }
      ]);

      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe('Category A');
      expect(res.body.data[1].name).toBe('Category B');
    });
  });

  // ─── POST /api/categories (Admin Only) ─────────────────────────────────────────
  describe('POST /api/categories', () => {
    it('should create category with valid admin token', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Category', description: 'Test description', order: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Category');
      expect(res.body.data.slug).toBe('test-category');
    });

    it('should create category with custom slug', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Custom Slug', slug: 'custom-slug' });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('custom-slug');
    });

    it('should reject duplicate slug', async () => {
      await Category.create({ name: 'Existing', slug: 'existing' });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Duplicate', slug: 'existing' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('BAD_REQUEST');
    });

    it('should reject non-admin user', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test' });

      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  // ─── PATCH /api/categories/:id (Admin Only) ────────────────────────────────────
  describe('PATCH /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const cat = await Category.create({ name: 'Original', slug: 'original' });
      categoryId = cat._id;
    });

    it('should update category name', async () => {
      const res = await request(app)
        .patch(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should update category order', async () => {
      const res = await request(app)
        .patch(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ order: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.order).toBe(5);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .patch('/api/categories/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });

  // ─── DELETE /api/categories/:id (Admin Only) ───────────────────────────────────
  describe('DELETE /api/categories/:id', () => {
    it('should delete existing category', async () => {
      const cat = await Category.create({ name: 'To Delete', slug: 'delete-me' });

      const res = await request(app)
        .delete(`/api/categories/${cat._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const deleted = await Category.findById(cat._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .delete('/api/categories/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});