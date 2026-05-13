import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { acceptBid } from '../controllers/bid.controller.js';

const router = express.Router();

router.use(authenticate);

// User accepting a bid
router.patch('/:id/accept', requireRole('user'), acceptBid);

export default router;
