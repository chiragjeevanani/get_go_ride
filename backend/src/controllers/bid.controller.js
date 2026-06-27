import Bid from '../models/Bid.model.js';
import Requirement from '../models/Requirement.model.js';
import Vendor from '../models/Vendor.model.js';
import { success, error } from '../utils/response.js';
import { getRevenueModelConfig } from './settings.controller.js';
import { sendNotificationToUser } from '../utils/pushNotificationHelper.js';

/**
 * @route   POST /api/leads/:id/bid
 * @desc    Vendor place a bid on a lead
 * @access  Private (Vendor)
 */
export const placeBid = async (req, res, next) => {
  try {
    const { amount, notes, vehicleType } = req.body;
    const requirementId = req.params.id;

    // Check subscription & quota limit first
    const vendor = await Vendor.findById(req.user.id).populate('activeSubscription');
    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    const config = await getRevenueModelConfig();
    const isSubscriptionRequired = config.model === 'subscription' || config.model === 'subscription_commission';

    if (isSubscriptionRequired && vendor.subscriptionStatus !== 'Active') {
      return error(res, 'An active subscription plan is required to place bids.', 403, 'ACTIVE_SUBSCRIPTION_REQUIRED');
    }

    const plan = vendor.activeSubscription;

    // Check if subscription has expired
    if (plan && vendor.subscriptionExpiresAt && new Date() > vendor.subscriptionExpiresAt) {
      vendor.subscriptionStatus = 'Expired';
      await vendor.save();
      return error(res, 'Your subscription has expired. Please renew to continue.', 403, 'SUBSCRIPTION_EXPIRED');
    }

    // Check limited quota
    if (plan && plan.leadQuota?.type === 'limited') {
      const limit = plan.leadQuota?.limit || 0;
      const period = plan.leadQuota?.period || 'day';
      const now = new Date();
      const resetAt = vendor.leadQuotaResetAt ? new Date(vendor.leadQuotaResetAt) : new Date(0);

      let resetNeeded = false;
      if (period === 'day') resetNeeded = now - resetAt >= 86400000;
      else if (period === 'week') resetNeeded = now - resetAt >= 604800000;
      else if (period === 'month') {
        resetNeeded = now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();
      }

      let used = vendor.leadQuotaUsed || 0;
      if (resetNeeded) {
        vendor.leadQuotaUsed = 0;
        vendor.leadQuotaResetAt = now;
        used = 0;
      }

      if (used >= limit) {
        return error(res, 'Lead quota exceeded for the current period.', 403, 'QUOTA_EXCEEDED');
      }

      // Increment quota used (will be saved below)
      vendor.leadQuotaUsed = used + 1;
      await vendor.save();
    }

    // Check if requirement exists and is open
    const requirement = await Requirement.findById(requirementId);
    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');
    if (['accepted', 'completed', 'cancelled'].includes(requirement.status)) {
      return error(res, 'Requirement is no longer open for bidding', 400, 'CLOSED');
    }

    // Check for existing bid
    const existingBid = await Bid.findOne({ requirement: requirementId, vendor: req.user.id });
    if (existingBid) {
      // Revert quota increment if already bid
      if (plan && plan.leadQuota?.type === 'limited') {
        vendor.leadQuotaUsed = Math.max(0, vendor.leadQuotaUsed - 1);
        await vendor.save();
      }
      return error(res, 'You have already placed a bid on this lead', 400, 'ALREADY_BID');
    }

    const bid = await Bid.create({
      requirement: requirementId,
      vendor: req.user.id,
      amount,
      notes,
      vehicleType: vehicleType || '',
    });

    // Update requirement status to 'bidding' if it was 'pending'
    if (requirement.status === 'pending') {
      requirement.status = 'bidding';
      await requirement.save();
    }

    // Trigger push notification to user (customer)
    (async () => {
      try {
        if (requirement && requirement.user) {
          await sendNotificationToUser(requirement.user.toString(), 'user', {
            title: 'New Bid Received! 💰',
            body: `A driver has placed a bid of ₹${amount} on your load request for ${requirement.serviceType || 'shipping'}.`,
            type: 'new_bid',
            entityId: requirement._id.toString(),
            deepLink: `/user/requests/${requirement._id.toString()}`,
            priority: 'high'
          });
        }
      } catch (fcmErr) {
        console.error('[FCM] Error sending new bid notification:', fcmErr.message);
      }
    })();

    success(res, bid, 'Bid placed successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/requirements/:id/bids
 * @desc    Get all bids for a specific requirement
 * @access  Private (Owner/Admin)
 */
export const getBidsForRequirement = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');

    // Only owner or admin can see all bids
    if (requirement.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    const bids = await Bid.find({ requirement: req.params.id })
      .populate('vendor', 'name phone rating businessName isVerified profileImage')
      .sort({ amount: 1 });

    success(res, bids, 'Bids retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/bids/:id/accept
 * @desc    User accepts a bid, locking the lead
 * @access  Private (User/Owner)
 */
export const acceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('requirement');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    if (requirement.user.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (requirement.status === 'accepted') {
      return error(res, 'Requirement already has an accepted bid', 400, 'ALREADY_ACCEPTED');
    }

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Update requirement
    requirement.status = 'accepted';
    requirement.acceptedBid = bid._id;
    await requirement.save();

    // Reject all other bids for this requirement
    await Bid.updateMany(
      { requirement: requirement._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    );

    // ─── Commission Deduction ───────────────────────────────────────────────
    const config = await getRevenueModelConfig();
    const isCommissionApplicable = config.model === 'commission' || config.model === 'subscription_commission';

    if (isCommissionApplicable) {
      const vendor = await Vendor.findById(bid.vendor);
      if (vendor) {
        const commissionAmount = (bid.amount * config.commissionRate) / 100;
        
        // Deduct from wallet
        vendor.wallet.balance -= commissionAmount;
        vendor.wallet.transactions.push({
          type: 'debit',
          amount: commissionAmount,
          description: `Commission for bid ${bid._id} on requirement ${requirement._id}`,
          date: new Date()
        });
        
        // Update total earnings and platform dues (optional metrics)
        vendor.totalEarnings += bid.amount;
        vendor.platformDues += commissionAmount;
        
        await vendor.save();
        console.log(`[REVENUE] Deducted ₹${commissionAmount} commission from vendor ${vendor.name} (${vendor.phone})`);
      }
    }

    success(res, bid, 'Bid accepted and requirement locked');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/leads/:id/withdraw
 * @desc    Vendor withdraws their bid from a lead
 * @access  Private (Vendor)
 */
export const withdrawBid = async (req, res, next) => {
  try {
    const requirementId = req.params.id;

    // Find the vendor's bid for this requirement
    const bid = await Bid.findOne({ requirement: requirementId, vendor: req.user.id });
    if (!bid) {
      return error(res, 'No bid found for this lead', 404, 'NOT_FOUND');
    }

    if (bid.status === 'accepted') {
      return error(res, 'Cannot withdraw an accepted bid', 400, 'BID_ACCEPTED');
    }

    // Delete the bid
    await Bid.deleteOne({ _id: bid._id });

    // Check if requirement should go back to 'pending' if no other bids exist
    const remainingBids = await Bid.countDocuments({ requirement: requirementId });
    if (remainingBids === 0) {
      await Requirement.findByIdAndUpdate(requirementId, { status: 'pending' });
    }

    // Optionally decrement quota usage
    const vendor = await Vendor.findById(req.user.id);
    if (vendor && vendor.leadQuotaUsed > 0) {
      vendor.leadQuotaUsed = Math.max(0, vendor.leadQuotaUsed - 1);
      await vendor.save();
    }

    success(res, null, 'Bid withdrawn successfully');
  } catch (err) {
    next(err);
  }
};
