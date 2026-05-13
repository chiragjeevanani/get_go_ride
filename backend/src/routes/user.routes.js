import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getMyProfile,
  updateMyProfile,
  getMyWallet,
  addMoneyToWallet,
  createWalletOrder,
  verifyWalletPayment,
  getMyAddresses,
  saveAddress,
  deleteAddress,
  getAllUsers,
  getUserById,
  updateUserStatus
} from '../controllers/user.controller.js';

const router = express.Router();

// --- User Routes (Require 'user' role) ---
router.use('/me', authenticate, requireRole('user'));

router.route('/me')
  .get(getMyProfile)
  .patch(updateMyProfile);

router.get('/me/wallet', getMyWallet);
router.post('/me/wallet/add-money', addMoneyToWallet);
router.post('/me/wallet/create-order', createWalletOrder);
router.post('/me/wallet/verify-payment', verifyWalletPayment);

router.route('/me/addresses')
  .get(getMyAddresses)
  .post(saveAddress);

router.delete('/me/addresses/:addressId', deleteAddress);

// --- Admin Routes (Require 'admin' role) ---
router.use('/', authenticate, requireRole('admin'));

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById);

router.route('/:id/status')
  .patch(updateUserStatus);

export default router;
