import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getAvailableLeads, getRequirementDetails } from '../controllers/requirement.controller.js';
import { placeBid, withdrawBid } from '../controllers/bid.controller.js';

const router = express.Router();

router.use(authenticate, requireRole('vendor'));

// Driver browsing leads
router.get('/', getAvailableLeads);
router.get('/:id', getRequirementDetails);

// Driver bidding
router.post('/:id/bid', placeBid);
router.delete('/:id/withdraw', withdrawBid);

export default router;
