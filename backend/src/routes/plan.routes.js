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
  createSubscriptionOrder,
  verifySubscriptionPayment,
  checkLeadQuota,
  incrementLeadQuota,
  handleRazorpayWebhook,
} from '../controllers/plan.controller.js';

const router = express.Router();

// ─── Public Webhook route (Must be public, before any authentication guards) ───
router.post('/webhook/razorpay', handleRazorpayWebhook);

// ─── Public & Static routes ────────────────────────────────────────────────────────────
router.get('/', getAllPlans);

// ─── Vendor routes (Static) ────────────────────────────────────────────────────
router.get('/me/quota', authenticate, requireRole('vendor'), checkLeadQuota);
router.post('/me/quota/increment', authenticate, requireRole('vendor'), incrementLeadQuota);

// ─── Admin routes (Static) ─────────────────────────────────────────────────────
router.get('/admin/all', authenticate, requireRole('admin'), getAllPlansAdmin);
router.post('/', authenticate, requireRole('admin'), createPlan);

// ─── Parameterized routes ──────────────────────────────────────────────────────
router.get('/:id', getPlanById);
router.patch('/:id', authenticate, requireRole('admin'), updatePlan);
router.delete('/:id', authenticate, requireRole('admin'), deletePlan);

// ─── Vendor routes (Parameterized) ─────────────────────────────────────────────
router.post('/:id/subscribe', authenticate, requireRole('vendor'), subscribeToPlan);
router.post('/:id/subscribe-order', authenticate, requireRole('vendor'), createSubscriptionOrder);
router.post('/:id/subscribe-verify', authenticate, requireRole('vendor'), verifySubscriptionPayment);

export default router;
