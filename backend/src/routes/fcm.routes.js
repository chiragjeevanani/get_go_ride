import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { saveToken, removeToken, sendTestNotification, adminSendNotification } from '../controllers/fcm.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/save', saveToken);
router.delete('/remove', removeToken);
router.post('/test', sendTestNotification);

// Admin-only target testing and broadcasts
router.post('/admin/send', requireRole('admin'), adminSendNotification);

export default router;
