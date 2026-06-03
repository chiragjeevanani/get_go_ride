import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createAdvanceOrder,
  verifyAdvancePayment,
  getUpcomingGigs,
  getGigHistory,
  getGigStatus,
  markGigStarted,
  selectFinalPaymentMethod,
  completeCashPayment,
  createFinalPaymentLink,
  handlePaymentWebhook,
  verifyFinalPayment,
  markGigArrived,
  verifyGigOtp,
  submitFeedback,
  regenerateGigOtp,
} from '../controllers/payment.controller.js';

const router = express.Router();

// ─── Razorpay Webhook (public, no auth) ──────────────────────────────────────
router.post('/webhook', handlePaymentWebhook);

// ─── User-facing routes ───────────────────────────────────────────────────────
router.post('/advance-order/:bidId', authenticate, requireRole('user'), createAdvanceOrder);
router.post('/advance-verify/:bidId', authenticate, requireRole('user'), verifyAdvancePayment);
router.get('/final-verify/:bidId', authenticate, verifyFinalPayment);
router.post('/feedback/:bidId', authenticate, requireRole('user'), submitFeedback);

// ─── Shared (driver + user) ───────────────────────────────────────────────────
router.get('/upcoming-gigs', authenticate, getUpcomingGigs);
router.get('/gig-history', authenticate, getGigHistory);
router.get('/gig-status/:bidId', authenticate, getGigStatus);
router.post('/regenerate-otp/:bidId', authenticate, regenerateGigOtp);

// ─── Driver-facing routes ─────────────────────────────────────────────────────
router.post('/gig-start/:bidId', authenticate, requireRole('vendor'), markGigStarted);
router.post('/gig-arrived/:bidId', authenticate, requireRole('vendor'), markGigArrived);
router.post('/verify-otp/:bidId', authenticate, requireRole('vendor'), verifyGigOtp);
router.post('/payment-method/:bidId', authenticate, requireRole('vendor'), selectFinalPaymentMethod);
router.post('/cash-complete/:bidId', authenticate, requireRole('vendor'), completeCashPayment);
router.post('/final-order/:bidId', authenticate, requireRole('vendor'), createFinalPaymentLink);

export default router;
