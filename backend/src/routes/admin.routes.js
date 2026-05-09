import express from 'express';
import { getAdminStats, getAdminRevenueStats, getAdminLeadsTrend } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/revenue', getAdminRevenueStats);
router.get('/leads-trend', getAdminLeadsTrend);

export default router;
