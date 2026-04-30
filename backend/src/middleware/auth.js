import jwt from 'jsonwebtoken';
import { error } from '../utils/response.js';

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'No token provided', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};

/**
 * Role guard middleware factory.
 * Usage: requireRole('admin') or requireRole('admin', 'vendor')
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Unauthorized', 401, 'UNAUTHORIZED');
  if (!roles.includes(req.user.role)) {
    return error(res, 'Access denied', 403, 'FORBIDDEN');
  }
  next();
};
