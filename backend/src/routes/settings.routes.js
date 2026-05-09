import express from 'express';
import { getSettings, updateSettings, getRazorpayKey } from '../controllers/settings.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/razorpay-key', getRazorpayKey);

router.route('/')
  .get(getSettings)
  .put(authenticate, requireRole('admin'), updateSettings);

export default router;
