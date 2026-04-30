import { error } from '../utils/response.js';

/**
 * Global error handler middleware.
 * Must be registered LAST in app.js (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

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
  return error(res, err.message || 'Internal server error', err.statusCode || 500, 'SERVER_ERROR');
};

export default errorHandler;
