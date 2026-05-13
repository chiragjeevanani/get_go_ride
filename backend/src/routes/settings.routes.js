import express from 'express';
import { getSettings, updateSettings, getRazorpayKey, getRevenueModel, updateRevenueModel } from '../controllers/settings.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/razorpay-key', getRazorpayKey);

// Revenue model settings
router.get('/revenue-model', authenticate, requireRole('admin'), getRevenueModel);
router.put('/revenue-model', authenticate, requireRole('admin'), updateRevenueModel);

router.route('/')
  .get(getSettings)
  .put(authenticate, requireRole('admin'), updateSettings);

export default router;
