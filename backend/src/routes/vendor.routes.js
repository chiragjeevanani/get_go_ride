import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getMyProfile,
  updateMyProfile,
  submitOnboarding,
  uploadDocument,
  uploadVehicleImage,
  deleteVehicleImage,
  getAllVendors,
  getVendorById,
  verifyVendor,
  verifyDocument,
  getMyAnalytics
} from '../controllers/vendor.controller.js';

const router = express.Router();

// --- Vendor Routes (Require 'vendor' role) ---
router.use('/me', authenticate, requireRole('vendor'));

router.get('/me/analytics', getMyAnalytics);

router.route('/me')
  .get(getMyProfile)
  .patch(updateMyProfile);

router.post('/me/onboarding', submitOnboarding);
router.post('/me/documents', upload.single('document'), uploadDocument);
router.route('/me/vehicle-images')
  .post(upload.single('image'), uploadVehicleImage)
  .delete(deleteVehicleImage);

// Publicly accessible but authenticated
router.get('/:id', authenticate, getVendorById);

// --- Admin Routes (Require 'admin' role) ---
router.use('/', authenticate, requireRole('admin'));

router.route('/')
  .get(getAllVendors);

router.route('/:id/verify')
  .patch(verifyVendor);

router.route('/:id/document/:docId')
  .patch(verifyDocument);

export default router;
