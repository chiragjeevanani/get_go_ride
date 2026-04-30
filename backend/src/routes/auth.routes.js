import { Router } from 'express';
import { z } from 'zod';
import {
  sendOtpHandler,
  verifyOtpHandler,
  adminLoginHandler,
  refreshTokenHandler,
} from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { otpLimiter, authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Validation schemas
const sendOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  role: z.enum(['user', 'vendor'], { message: 'Role must be user or vendor' }),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  otp: z.string().length(4, 'OTP must be 4 digits'),
  role: z.enum(['user', 'vendor']),
});

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Routes
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), sendOtpHandler);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOtpHandler);
router.post('/admin/login', authLimiter, validate(adminLoginSchema), adminLoginHandler);
router.post('/refresh', validate(refreshSchema), refreshTokenHandler);

export default router;
