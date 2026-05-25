import express from 'express';
import { getAdminStats, getAdminRevenueStats, getAdminLeadsTrend, getAdminDeals, getDealBids } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getAllWithdrawals, processWithdrawal } from '../controllers/withdrawal.controller.js';

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

// Withdrawal management
router.get('/withdrawals', getAllWithdrawals);
router.patch('/withdrawals/:id', processWithdrawal);

export default router;
