import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Faq from '../src/models/Faq.model.js';
import jwt from 'jsonwebtoken';

let adminToken;
let userToken;

beforeAll(() => {
  adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
  userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_ACCESS_SECRET || 'test_access_secret', { expiresIn: '1h' });
});

beforeEach(async () => {
  await Faq.deleteMany({});
});

describe('FAQs API', () => {
  // ─── GET /api/faqs (Public) ───────────────────────────────────────────────────
  describe('GET /api/faqs', () => {
    it('should return FAQs sorted by order', async () => {
      await Faq.create([
        { question: 'Third FAQ', answer: 'Answer 3', order: 3 },
        { question: 'First FAQ', answer: 'Answer 1', order: 1 },
        { question: 'Second FAQ', answer: 'Answer 2', order: 2 }
      ]);

      const res = await request(app).get('/api/faqs');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].question).toBe('First FAQ');
    });

    it('should seed default FAQs when none exist', async () => {
      const res = await request(app).get('/api/faqs');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ─── POST /api/faqs (Admin Only) ──────────────────────────────────────────────
  describe('POST /api/faqs', () => {
    it('should create FAQ with admin token', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'New Question?', answer: 'New Answer', order: 1 });

      expect(res.status).toBe(201);
      expect(res.body.data.question).toBe('New Question?');
      expect(res.body.data.answer).toBe('New Answer');
    });

    it('should create FAQ with auto-generated order', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'Test Question?', answer: 'Test Answer' });

      expect(res.status).toBe(201);
      expect(res.body.data.order).toBe(1);
    });

    it('should shift existing orders when inserting at specific order', async () => {
      await Faq.create({ question: 'Existing', answer: 'Answer', order: 1 });

      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'New', answer: 'New Answer', order: 1 });

      expect(res.status).toBe(201);
      const faqs = await Faq.find().sort({ order: 1 });
      expect(faqs).toHaveLength(2);
      expect(faqs[0].question).toBe('New');
      expect(faqs[1].question).toBe('Existing');
    });

    it('should reject when question is missing', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ answer: 'Answer only' });

      expect(res.status).toBe(400);
    });

    it('should reject when answer is missing', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'Question only' });

      expect(res.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ question: 'Test?', answer: 'Test' });

      expect(res.status).toBe(403);
    });
  });

  // ─── PATCH /api/faqs/:id (Admin Only) ─────────────────────────────────────────
  describe('PATCH /api/faqs/:id', () => {
    let faqId;

    beforeEach(async () => {
      const faq = await Faq.create({ question: 'Original Question?', answer: 'Original Answer', order: 1 });
      faqId = faq._id;
    });

    it('should update question', async () => {
      const res = await request(app)
        .patch(`/api/faqs/${faqId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'Updated Question?' });

      expect(res.status).toBe(200);
      expect(res.body.data.question).toBe('Updated Question?');
    });

    it('should update answer', async () => {
      const res = await request(app)
        .patch(`/api/faqs/${faqId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ answer: 'Updated Answer' });

      expect(res.status).toBe(200);
      expect(res.body.data.answer).toBe('Updated Answer');
    });

    it('should update order and shift other FAQs', async () => {
      await Faq.create({ question: 'Second FAQ', answer: 'Answer 2', order: 2 });

      const res = await request(app)
        .patch(`/api/faqs/${faqId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ order: 3 });

      expect(res.status).toBe(200);
      expect(res.body.data.order).toBe(3);
    });

    it('should return 404 for non-existent FAQ', async () => {
      const res = await request(app)
        .patch('/api/faqs/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /api/faqs/:id (Admin Only) ───────────────────────────────────────
  describe('DELETE /api/faqs/:id', () => {
    it('should delete existing FAQ', async () => {
      const faq = await Faq.create({ question: 'To Delete', answer: 'Answer' });

      const res = await request(app)
        .delete(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const deleted = await Faq.findById(faq._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent FAQ', async () => {
      const res = await request(app)
        .delete('/api/faqs/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});