import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getMyProfile,
  updateMyProfile,
  submitOnboarding,
  uploadDocument,
  getAllVendors,
  getVendorById,
  verifyVendor,
  verifyDocument
} from '../controllers/vendor.controller.js';

const router = express.Router();

// --- Vendor Routes (Require 'vendor' role) ---
router.use('/me', authenticate, requireRole('vendor'));

router.route('/me')
  .get(getMyProfile)
  .patch(updateMyProfile);

router.post('/me/onboarding', submitOnboarding);
router.post('/me/documents', upload.single('document'), uploadDocument);

// --- Admin Routes (Require 'admin' role) ---
router.use('/', authenticate, requireRole('admin'));

router.route('/')
  .get(getAllVendors);

router.route('/:id')
  .get(getVendorById);

router.route('/:id/verify')
  .patch(verifyVendor);

router.route('/:id/document/:docId')
  .patch(verifyDocument);

export default router;
