import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createRequirement,
  getMyRequirements,
  getRequirementDetails,
  getAllRequirements,
  updateRequirementStatus,
  deleteRequirement
} from '../controllers/requirement.controller.js';
import { getBidsForRequirement } from '../controllers/bid.controller.js';

const router = express.Router();

router.use(authenticate);

// User posting routes
router.post('/', requireRole('user'), createRequirement);
router.get('/my', requireRole('user'), getMyRequirements);
router.delete('/:id', requireRole('user'), deleteRequirement);

// Common details
router.get('/:id', getRequirementDetails);

// View bids for a requirement
router.get('/:id/bids', getBidsForRequirement);

// --- Admin Facing ---
router.get('/', requireRole('admin'), getAllRequirements);
router.patch('/:id/status', requireRole('admin'), updateRequirementStatus);

export default router;
