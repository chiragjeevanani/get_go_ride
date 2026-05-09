import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getUserActiveChats,
  getDriverActiveChats,
  getMessages,
  sendMessage,
  sendOffer,
  acceptDeal,
  reopenDeal,
  acceptDealWithWallet,
  createAcceptDealOrder,
  verifyAcceptDealPayment,
} from '../controllers/chat.controller.js';

const router = express.Router();

router.use(authenticate);

// List active chats
router.get('/user/active', requireRole('user'), getUserActiveChats);
router.get('/driver/active', requireRole('vendor'), getDriverActiveChats);

// Specific room details & sending messages (By Bid ID)
router.get('/:bidId/messages', getMessages);
router.post('/:bidId/messages', sendMessage);
router.post('/:bidId/offer', sendOffer);
router.post('/:bidId/accept', requireRole('user'), acceptDeal);
router.post('/:bidId/accept-wallet', requireRole('user'), acceptDealWithWallet);
router.post('/:bidId/accept-order', requireRole('user'), createAcceptDealOrder);
router.post('/:bidId/accept-verify', requireRole('user'), verifyAcceptDealPayment);
router.post('/:bidId/reopen', requireRole('user'), reopenDeal);

// Specific room details & sending messages (By Request + Vendor ID composite)
router.get('/messages/:requestId/:vendorId', getMessages);
router.post('/messages/:requestId/:vendorId', sendMessage);
router.post('/offer/:requestId/:vendorId', sendOffer);
router.post('/accept/:requestId/:vendorId', requireRole('user'), acceptDeal);
router.post('/accept-wallet/:requestId/:vendorId', requireRole('user'), acceptDealWithWallet);
router.post('/accept-order/:requestId/:vendorId', requireRole('user'), createAcceptDealOrder);
router.post('/accept-verify/:requestId/:vendorId', requireRole('user'), verifyAcceptDealPayment);
router.post('/reopen/:requestId/:vendorId', requireRole('user'), reopenDeal);

export default router;
