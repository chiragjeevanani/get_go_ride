import Bid from '../models/Bid.model.js';
import Vendor from '../models/Vendor.model.js';
import Requirement from '../models/Requirement.model.js';
import { success, error } from '../utils/response.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

// ─── Helper: compute advance & final amounts ──────────────────────────────────
const splitAmount = (total) => ({
  advance: Math.round(total * 0.5),
  final: total - Math.round(total * 0.5),
});

// ─────────────────────────────────────────────────────────────────────────────
// USER: Create Razorpay order for 50% advance payment
// POST /api/payments/advance-order/:bidId
// ─────────────────────────────────────────────────────────────────────────────
export const createAdvanceOrder = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('requirement');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');

    // Ensure requesting user owns this requirement
    const requirementUserId = requirement.user?._id ? requirement.user._id.toString() : requirement.user?.toString();
    const reqUserId = req.user.id || req.user._id;
    if (requirementUserId !== reqUserId?.toString()) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (bid.status !== 'accepted' && bid.status !== 'pending') {
      return error(res, 'Only pending or accepted bids can receive advance payment', 400, 'INVALID_STATE');
    }

    if (requirement.status === 'accepted' && requirement.acceptedBid?.toString() !== bid._id.toString()) {
      return error(res, 'This requirement already has another accepted bid', 400, 'ALREADY_ACCEPTED');
    }

    if (bid.paymentStatus !== 'unpaid') {
      return error(res, 'Advance has already been paid for this bid', 400, 'ALREADY_PAID');
    }

    const { advance } = splitAmount(bid.amount);
    
    // Check user wallet balance for partial payment
    const User = (await import('../models/User.model.js')).default;
    const user = await User.findById(req.user.id);
    const walletBalance = user?.wallet?.balance || 0;
    const walletUsed = Math.min(walletBalance, advance);
    const razorpayAmount = advance - walletUsed;

    // If fully covered by wallet — no Razorpay order needed
    if (razorpayAmount === 0) {
      return success(res, {
        walletOnly: true,
        walletUsed,
        razorpayAmount: 0,
        advance,
        finalAmount: bid.amount - advance,
        bidId: bid._id,
      }, 'Advance can be paid fully from wallet');
    }

    const options = {
      amount: Math.round(razorpayAmount * 100), // paise
      currency: 'INR',
      receipt: `adv_${bid._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        bidId: bid._id.toString(),
        requirementId: requirement._id.toString(),
        userId: req.user.id,
        type: 'advance_payment',
        walletUsed: walletUsed.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    success(res, {
      order,
      walletUsed,
      razorpayAmount,
      advance,
      finalAmount: bid.amount - advance,
      bidId: bid._id,
    }, 'Advance order created');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER: Verify advance payment & lock gig
// POST /api/payments/advance-verify/:bidId
// ─────────────────────────────────────────────────────────────────────────────
export const verifyAdvancePayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      walletUsed = 0,
      walletOnly = false,
    } = req.body;

    const bid = await Bid.findById(req.params.bidId).populate('requirement');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    const requirementUserId = requirement.user?._id ? requirement.user._id.toString() : requirement.user?.toString();
    const reqUserId = req.user.id || req.user._id;
    if (requirementUserId !== reqUserId?.toString()) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (bid.paymentStatus !== 'unpaid') {
      return error(res, 'Advance already paid', 400, 'ALREADY_PAID');
    }

    // Verify Razorpay signature (unless fully wallet)
    if (!walletOnly) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return error(res, 'Payment details required', 400, 'VALIDATION_ERROR');
      }

      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generated = hmac.digest('hex');

      if (generated !== razorpay_signature) {
        return error(res, 'Payment signature verification failed', 400, 'PAYMENT_VERIFICATION_FAILED');
      }
    }

    const { advance, final } = splitAmount(bid.amount);

    // Deduct from user wallet if used
    if (walletUsed > 0) {
      const User = (await import('../models/User.model.js')).default;
      const user = await User.findById(req.user.id);
      if (user) {
        user.wallet.balance = (user.wallet.balance || 0) - Number(walletUsed);
        user.wallet.transactions.push({
          type: 'debit',
          amount: Number(walletUsed),
          description: `Advance payment for gig ${bid._id} (wallet portion)`,
          date: new Date(),
        });
        await user.save();
      }
    }

    // Update bid payment and status state
    bid.status = 'accepted';
    bid.paymentStatus = 'advance_paid';
    bid.gigStatus = 'scheduled';
    bid.advanceAmount = advance;
    bid.finalAmount = final;
    if (!walletOnly) {
      bid.advanceOrderId = razorpay_order_id;
      bid.advancePaymentId = razorpay_payment_id;
    } else {
      bid.advanceOrderId = 'wallet_only';
      bid.advancePaymentId = 'wallet_only';
    }
    await bid.save();

    // Update requirement status and lock the accepted bid
    requirement.status = 'accepted';
    requirement.acceptedBid = bid._id;
    await requirement.save();

    // Reject all other bids for this requirement
    await Bid.updateMany(
      { requirement: requirement._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    );

    // Credit driver's pending wallet
    const vendor = await Vendor.findById(bid.vendor);
    if (vendor) {
      vendor.wallet.pendingBalance = (vendor.wallet.pendingBalance || 0) + bid.amount;
      vendor.wallet.transactions.push({
        type: 'advance_hold',
        amount: bid.amount,
        description: `Advance received for gig ${bid._id} — pending gig completion`,
        gigId: bid._id.toString(),
        date: new Date(),
      });
      await vendor.save();
    }

    // Send deal accepted notification to chat
    try {
      const Message = (await import('../models/Message.model.js')).default;
      const msgText = `🤝 DEAL FINALIZED! 50% Advance Paid (₹${advance}). Gig scheduled.`;
      const msg = await Message.create({
        requirement: requirement._id,
        bid: bid._id,
        sender: req.user.id,
        senderModel: 'User',
        senderRole: 'user',
        text: msgText,
        type: 'text',
      });
      const { getIO } = await import('../config/socket.js');
      const io = getIO();
      io.to(bid._id.toString()).emit('receive_message', msg);
      io.to(bid._id.toString()).emit('deal_accepted', { bidId: bid._id });
    } catch (msgErr) {
      console.error('Failed to broadcast deal accepted message:', msgErr);
    }

    success(res, { bid, advance, final }, 'Advance payment verified. Gig is scheduled!');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Get all upcoming (active) gigs
// GET /api/payments/upcoming-gigs
// ─────────────────────────────────────────────────────────────────────────────
export const getUpcomingGigs = async (req, res, next) => {
  try {
    const role = req.user.role;

    let bids;
    if (role === 'vendor') {
      bids = await Bid.find({
        vendor: req.user.id,
        status: 'accepted',
        gigStatus: { $in: ['scheduled', 'in_progress'] },
      })
        .populate('requirement')
        .sort({ updatedAt: -1 });
    } else {
      // user — find via requirements
      const requirements = await Requirement.find({
        user: req.user.id,
        status: 'accepted',
      }).select('_id acceptedBid');

      const bidIds = requirements.map(r => r.acceptedBid).filter(Boolean);
      bids = await Bid.find({
        _id: { $in: bidIds },
        status: 'accepted',
        gigStatus: { $in: ['scheduled', 'in_progress'] },
      })
        .populate('requirement')
        .populate('vendor', 'name phone profileImage rating vehicleType vehicleRegNumber')
        .sort({ updatedAt: -1 });
    }

    success(res, bids, 'Upcoming gigs retrieved');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER/USER: Get all completed gigs history
// GET /api/payments/gig-history
// ─────────────────────────────────────────────────────────────────────────────
export const getGigHistory = async (req, res, next) => {
  try {
    const role = req.user.role;

    let bids;
    if (role === 'vendor') {
      bids = await Bid.find({
        vendor: req.user.id,
        status: 'accepted',
        gigStatus: 'completed',
      })
        .populate('requirement')
        .sort({ updatedAt: -1 });
    } else {
      // user — find via requirements
      const requirements = await Requirement.find({
        user: req.user.id,
        status: 'completed',
      }).select('_id acceptedBid');

      const bidIds = requirements.map(r => r.acceptedBid).filter(Boolean);
      bids = await Bid.find({
        _id: { $in: bidIds },
        status: 'accepted',
        gigStatus: 'completed',
      })
        .populate('requirement')
        .populate('vendor', 'name phone profileImage rating vehicleType vehicleRegNumber')
        .sort({ updatedAt: -1 });
    }

    success(res, bids, 'Gig history retrieved');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER/USER: Get gig status by bidId
// GET /api/payments/gig-status/:bidId
// ─────────────────────────────────────────────────────────────────────────────
export const getGigStatus = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('requirement')
      .populate('vendor', 'name phone profileImage rating vehicleType vehicleRegNumber');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    const role = req.user.role;

    // Access control
    if (role === 'vendor' && bid.vendor._id.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }
    if (role === 'user' && requirement.user.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    success(res, bid, 'Gig status retrieved');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Mark gig as in progress (work started)
// POST /api/payments/gig-start/:bidId
// ─────────────────────────────────────────────────────────────────────────────
export const markGigStarted = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    if (bid.vendor.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (bid.paymentStatus !== 'advance_paid') {
      return error(res, 'Advance must be paid before starting gig', 400, 'ADVANCE_NOT_PAID');
    }

    if (bid.gigStatus !== 'scheduled') {
      return error(res, 'Gig is not in scheduled state', 400, 'INVALID_STATE');
    }

    bid.gigStatus = 'in_progress';
    await bid.save();

    success(res, bid, 'Gig marked as in progress');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Select payment method for remaining 50%
// POST /api/payments/payment-method/:bidId  { method: 'cash' | 'online' }
// ─────────────────────────────────────────────────────────────────────────────
export const selectFinalPaymentMethod = async (req, res, next) => {
  try {
    const { method } = req.body;
    if (!['cash', 'online'].includes(method)) {
      return error(res, 'Method must be cash or online', 400, 'VALIDATION_ERROR');
    }

    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    if (bid.vendor.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (bid.paymentStatus !== 'advance_paid') {
      return error(res, 'Advance must be paid first', 400, 'ADVANCE_NOT_PAID');
    }

    bid.finalPaymentMethod = method;
    await bid.save();

    success(res, { bid, method }, `Payment method set to ${method}`);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Confirm cash collection — complete gig
// POST /api/payments/cash-complete/:bidId
// ─────────────────────────────────────────────────────────────────────────────
export const completeCashPayment = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('requirement');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    if (bid.vendor.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (bid.paymentStatus !== 'advance_paid') {
      return error(res, 'Invalid state for cash completion', 400, 'INVALID_STATE');
    }

    if (bid.finalPaymentMethod !== 'cash') {
      return error(res, 'Payment method is not set to cash', 400, 'WRONG_METHOD');
    }

    bid.paymentStatus = 'completed';
    bid.gigStatus = 'completed';
    bid.finalPaymentId = 'cash';
    await bid.save();

    // Mark requirement as completed
    await Requirement.findByIdAndUpdate(bid.requirement._id, { status: 'completed' });

    // Move entire bid amount from pending → active in driver wallet
    await _releaseDriverWallet(bid);

    success(res, bid, 'Gig completed via cash. Full amount credited to wallet!');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Create Razorpay Payment Link for remaining 50%
// POST /api/payments/final-order/:bidId
// ─────────────────────────────────────────────────────────────────────────────
export const createFinalPaymentLink = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('requirement');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    if (bid.vendor.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (bid.paymentStatus !== 'advance_paid') {
      return error(res, 'Invalid state for final payment', 400, 'INVALID_STATE');
    }

    if (bid.finalPaymentMethod !== 'online') {
      return error(res, 'Payment method is not set to online', 400, 'WRONG_METHOD');
    }

    // If link already created, return it
    if (bid.finalPaymentLinkUrl) {
      return success(res, {
        paymentLinkUrl: bid.finalPaymentLinkUrl,
        finalOrderId: bid.finalOrderId,
        finalAmount: bid.finalAmount,
      }, 'Payment link already created');
    }

    const finalAmount = bid.finalAmount || Math.round(bid.amount * 0.5);

    // Create Razorpay Payment Link
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(finalAmount * 100), // paise
      currency: 'INR',
      description: `Final payment for gig (Req: ${bid.requirement._id})`,
      notify: { sms: false, email: false },
      reminder_enable: false,
      notes: {
        bidId: bid._id.toString(),
        requirementId: bid.requirement._id.toString(),
        type: 'final_payment',
      },
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/gig/${bid._id}`,
      callback_method: 'get',
    });

    bid.finalOrderId = paymentLink.id;
    bid.finalPaymentLinkUrl = paymentLink.short_url;
    await bid.save();

    success(res, {
      paymentLinkUrl: paymentLink.short_url,
      finalOrderId: paymentLink.id,
      finalAmount,
    }, 'Final payment link created');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER/DRIVER: Verify online final payment link manually/polling
// GET /api/payments/final-verify/:bidId
// ─────────────────────────────────────────────────────────────────────────────
export const verifyFinalPayment = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('requirement');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    if (bid.paymentStatus === 'completed') {
      return success(res, bid, 'Payment already completed');
    }

    if (bid.finalPaymentMethod !== 'online' || !bid.finalOrderId) {
      return error(res, 'No active online payment link found for this gig', 400, 'INVALID_METHOD');
    }

    // Fetch payment link status from Razorpay API
    const link = await razorpay.paymentLink.fetch(bid.finalOrderId);
    console.log(`[PAYMENT VERIFY] Payment Link Status for ${bid.finalOrderId}: ${link.status}`);

    if (link.status === 'paid') {
      const paymentId = link.payments?.[0]?.payment_id || 'online_payment';
      bid.paymentStatus = 'completed';
      bid.gigStatus = 'completed';
      bid.finalPaymentId = paymentId;
      await bid.save();

      await Requirement.findByIdAndUpdate(bid.requirement._id, { status: 'completed' });
      await _releaseDriverWallet(bid);

      return success(res, bid, 'Gig completed successfully via verified online payment!');
    }

    return error(res, 'Payment link is not paid yet', 400, 'NOT_PAID');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Razorpay webhook — handle payment_link.paid
// POST /api/payments/webhook
// ─────────────────────────────────────────────────────────────────────────────
export const handlePaymentWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const { event, payload } = req.body;
    console.log(`[PAYMENT WEBHOOK] Event: ${event}`);

    // Handle final payment via payment link
    if (event === 'payment_link.paid') {
      const entity = payload.payment_link?.entity;
      const notes = entity?.notes || {};
      const bidId = notes.bidId;
      const type = notes.type;

      if (bidId && type === 'final_payment') {
        const bid = await Bid.findById(bidId);
        if (bid && bid.paymentStatus === 'advance_paid') {
          const paymentId = payload.payment?.entity?.id || entity.id;
          bid.paymentStatus = 'completed';
          bid.gigStatus = 'completed';
          bid.finalPaymentId = paymentId;
          await bid.save();

          await Requirement.findByIdAndUpdate(bid.requirement, { status: 'completed' });
          await _releaseDriverWallet(bid);

          console.log(`[PAYMENT WEBHOOK] Gig ${bidId} completed via online payment`);
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Move pending → active in driver wallet (full bid.amount)
// ─────────────────────────────────────────────────────────────────────────────
async function _releaseDriverWallet(bid) {
  const vendor = await Vendor.findById(bid.vendor);
  if (!vendor) return;

  const pending = vendor.wallet.pendingBalance || 0;
  const releaseAmount = bid.amount; // full 100%

  vendor.wallet.pendingBalance = Math.max(0, pending - releaseAmount);
  vendor.wallet.activeBalance = (vendor.wallet.activeBalance || 0) + releaseAmount;
  vendor.totalEarnings = (vendor.totalEarnings || 0) + releaseAmount;

  vendor.wallet.transactions.push({
    type: 'advance_release',
    amount: releaseAmount,
    description: `Gig completed — full earnings released for gig ${bid._id}`,
    gigId: bid._id.toString(),
    date: new Date(),
  });

  await vendor.save();
  console.log(`[WALLET] Released ₹${releaseAmount} to vendor ${vendor.name} (${vendor.phone})`);
}
