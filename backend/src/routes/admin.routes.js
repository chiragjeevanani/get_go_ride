import express from 'express';
import { getAdminStats, getAdminRevenueStats, getAdminLeadsTrend, getAdminDeals, getDealBids } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/revenue', getAdminRevenueStats);
router.get('/leads-trend', getAdminLeadsTrend);

// Deal management - see final bids between users and vendors
router.get('/deals', getAdminDeals);
router.get('/deals/:id/bids', getDealBids);

export default router;
