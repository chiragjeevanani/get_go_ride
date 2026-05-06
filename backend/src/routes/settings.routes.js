import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(authenticate, requireRole('admin'), updateSettings);

export default router;
