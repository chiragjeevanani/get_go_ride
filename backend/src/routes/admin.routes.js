import express from 'express';
import { getAdminStats, getAdminRevenueStats } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/revenue', getAdminRevenueStats);

export default router;
