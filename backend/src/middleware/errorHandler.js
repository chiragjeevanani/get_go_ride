import { error } from '../utils/response.js';

/**
 * Global error handler middleware.
 * Must be registered LAST in app.js (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  // Extract error message dynamically, especially for non-standard third-party error objects (like Razorpay SDK)
  let errMsg = err.message;
  if (!errMsg && err.error && typeof err.error === 'object') {
    errMsg = err.error.description || err.error.message;
  }
  if (!errMsg && err.description) {
    errMsg = err.description;
  }
  if (!errMsg) {
    errMsg = 'Internal server error';
  }

  console.error(`[ERROR] ${req.method} ${req.path}:`, errMsg);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return error(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return error(res, `${field} already exists`, 409, 'DUPLICATE_KEY');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Zod validation errors (thrown manually from validate middleware)
  if (err.name === 'ZodError') {
    const details = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return error(res, 'Invalid request body', 400, 'VALIDATION_ERROR', details);
  }

  // Default
  let statusCode = err.statusCode || 500;
  // Protect client session: Never propagate third-party 401/403 errors (like Razorpay) as server auth failures
  if (statusCode === 401 || statusCode === 403) {
    statusCode = 400;
  }

  return error(res, errMsg, statusCode, 'SERVER_ERROR');
};

export default errorHandler;
