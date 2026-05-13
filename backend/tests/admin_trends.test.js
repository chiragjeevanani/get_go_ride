import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Requirement from '../src/models/Requirement.model.js';
import jwt from 'jsonwebtoken';

let adminToken, userToken;
let userId;

beforeAll(async () => {
  adminToken = jwt.sign(
    { id: 'admin123', role: 'admin' },
    process.env.JWT_ACCESS_SECRET || 'test_access_secret',
    { expiresIn: '1h' }
  );

  const user = await User.create({ phone: '9111111111', name: 'Regular User' });
  userId = user._id;
  userToken = jwt.sign(
    { id: user._id, role: 'user' },
    process.env.JWT_ACCESS_SECRET || 'test_access_secret',
    { expiresIn: '1h' }
  );
});

describe('Admin Leads Trend API', () => {
  it('should block non-admin requests with 403 or 401', async () => {
    // No token
    const res1 = await request(app).get('/api/admin/leads-trend');
    expect(res1.status).toBe(401);

    // Regular user token (role='user')
    const res2 = await request(app)
      .get('/api/admin/leads-trend')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res2.status).toBe(403);
  });

  it('should return 7 days of daily statistics by default with zero filled arrays', async () => {
    const res = await request(app)
      .get('/api/admin/leads-trend')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(7);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('leads', 0);
  });

  it('should correctly aggregate booking requests on the appropriate dates', async () => {
    // Create a requirement created today
    await Requirement.create({
      user: userId,
      serviceType: 'goods',
      vehicleType: 'Mini Truck',
      pickup: { address: 'A' },
      drops: [{ address: 'B' }],
      items: 'Cargo',
      date: new Date(),
      time: '12:00'
    });

    const res = await request(app)
      .get('/api/admin/leads-trend')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const dayNum = String(today.getUTCDate()).padStart(2, '0');
    const monthName = months[today.getUTCMonth()];
    const todayLabel = `${dayNum} ${monthName}`;
    const todayStat = res.body.data.find(d => d.name === todayLabel);
    
    expect(todayStat).toBeDefined();
    expect(todayStat.leads).toBe(1);
  });

  it('should return 30 days of daily statistics when range=30days', async () => {
    const res = await request(app)
      .get('/api/admin/leads-trend?range=30days')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(30);
  });

  it('should support custom date range queries', async () => {
    // Queries from 2026-05-01 to 2026-05-05 (5 days inclusive)
    const res = await request(app)
      .get('/api/admin/leads-trend?range=custom&startDate=2026-05-01&endDate=2026-05-05')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.data[0].name).toBe('01 May');
    expect(res.body.data[4].name).toBe('05 May');
  });
});
