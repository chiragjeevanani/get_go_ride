import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return 200 with success message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
describe('POST /api/auth/send-otp', () => {
  it('should send OTP and return _devOtp in development mode', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '9876543210', role: 'user' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phone).toBe('9876543210');
    expect(res.body.data._devOtp).toBeDefined();
    expect(res.body.data._devOtp).toHaveLength(4);
  });

  it('should return 400 if phone is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '12345', role: 'user' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if role is missing', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '9876543210' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if role is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '9876543210', role: 'admin' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
describe('POST /api/auth/verify-otp', () => {
  it('should verify OTP and return tokens + create new user', async () => {
    // Step 1: Send OTP
    const sendRes = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '9000000001', role: 'user' });

    const otp = sendRes.body.data._devOtp;
    expect(otp).toBeDefined();

    // Step 2: Verify OTP
    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '9000000001', otp, role: 'user' });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.accessToken).toBeDefined();
    expect(verifyRes.body.data.refreshToken).toBeDefined();
    expect(verifyRes.body.data.isNewUser).toBe(true);
    expect(verifyRes.body.data.user).toBeDefined();
    expect(verifyRes.body.data.user.phone).toBe('9000000001');
  });

  it('should return isNewUser=false for existing user on second login', async () => {
    const phone = '9000000002';

    // First login — creates user
    const send1 = await request(app).post('/api/auth/send-otp').send({ phone, role: 'user' });
    await request(app).post('/api/auth/verify-otp').send({ phone, otp: send1.body.data._devOtp, role: 'user' });

    // Second login — user already exists
    const send2 = await request(app).post('/api/auth/send-otp').send({ phone, role: 'user' });
    const verify2 = await request(app).post('/api/auth/verify-otp').send({ phone, otp: send2.body.data._devOtp, role: 'user' });

    expect(verify2.status).toBe(200);
    expect(verify2.body.data.isNewUser).toBe(false);
  });

  it('should create a new vendor account on first vendor login', async () => {
    const phone = '9000000003';
    const send = await request(app).post('/api/auth/send-otp').send({ phone, role: 'vendor' });
    const verify = await request(app).post('/api/auth/verify-otp').send({ phone, otp: send.body.data._devOtp, role: 'vendor' });

    expect(verify.status).toBe(200);
    expect(verify.body.data.isNewUser).toBe(true);
    expect(verify.body.data.vendor).toBeDefined();
  });

  it('should return 400 for wrong OTP', async () => {
    const phone = '9000000004';
    // Must send OTP first so session exists
    await request(app).post('/api/auth/send-otp').send({ phone, role: 'user' });

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone, otp: '0000', role: 'user' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('OTP_INVALID');
  });

  it('should return 400 if OTP not found (not sent)', async () => {
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '9999999999', otp: '1234', role: 'user' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('OTP_EXPIRED');
  });

  it('should return 400 for OTP shorter than 4 digits', async () => {
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '9876543210', otp: '12', role: 'user' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

// ─── POST /api/auth/admin/login ───────────────────────────────────────────────
describe('POST /api/auth/admin/login', () => {
  it('should return 401 for non-existent admin', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'nobody@getgoload.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'notanemail', password: 'Admin@1234' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
describe('POST /api/auth/refresh', () => {
  it('should return new access token with valid refresh token', async () => {
    // Get a real refresh token via OTP flow
    const phone = '9000000005';
    const send = await request(app).post('/api/auth/send-otp').send({ phone, role: 'user' });
    const verify = await request(app).post('/api/auth/verify-otp').send({ phone, otp: send.body.data._devOtp, role: 'user' });
    const { refreshToken } = verify.body.data;

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return 401 for invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'bad.token.here' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('should return 400 if refreshToken is missing', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});
