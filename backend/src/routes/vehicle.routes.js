import express from 'express';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVehicles);

// Admin only routes
router.post('/', authenticate, requireRole('admin'), createVehicle);
router.patch('/:id', authenticate, requireRole('admin'), updateVehicle);
router.delete('/:id', authenticate, requireRole('admin'), deleteVehicle);

export default router;
