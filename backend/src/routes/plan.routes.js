import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getAllPlans,
  getAllPlansAdmin,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  subscribeToPlan,
  checkLeadQuota,
  incrementLeadQuota,
} from '../controllers/plan.controller.js';

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', getAllPlans);
router.get('/:id', getPlanById);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, requireRole('admin'), getAllPlansAdmin);
router.post('/', authenticate, requireRole('admin'), createPlan);
router.patch('/:id', authenticate, requireRole('admin'), updatePlan);
router.delete('/:id', authenticate, requireRole('admin'), deletePlan);

// ─── Vendor routes ────────────────────────────────────────────────────────────
router.post('/:id/subscribe', authenticate, requireRole('vendor'), subscribeToPlan);
router.get('/me/quota', authenticate, requireRole('vendor'), checkLeadQuota);
router.post('/me/quota/increment', authenticate, requireRole('vendor'), incrementLeadQuota);

export default router;
