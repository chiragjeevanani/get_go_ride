import rateLimit from 'express-rate-limit';

// Rate limiters are disabled in non-production environments to avoid blocking test OTP requests
const shouldBypass = process.env.NODE_ENV !== 'production';

const noLimit = (req, res, next) => next();

export const otpLimiter = shouldBypass ? noLimit : rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'RATE_LIMIT', message: 'Too many OTP requests. Try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = shouldBypass ? noLimit : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'RATE_LIMIT', message: 'Too many auth requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = shouldBypass ? noLimit : rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'RATE_LIMIT', message: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

