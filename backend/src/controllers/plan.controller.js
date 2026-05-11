import SubscriptionPlan from '../models/SubscriptionPlan.model.js';
import Vendor from '../models/Vendor.model.js';
import { success, error } from '../utils/response.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

// ─── GET /api/plans  (public) ─────────────────────────────────────────────────
export const getAllPlans = async (req, res, next) => {
  try {
    let plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    
    const hasFreePlan = plans.some(p => p.price === 0);
    if (plans.length === 0 || !hasFreePlan) {
      const freeExists = await SubscriptionPlan.findOne({ price: 0 });
      if (!freeExists) {
        await SubscriptionPlan.create({
          name: 'Free Trial',
          price: 0,
          durationDays: 30,
          leadQuota: { type: 'limited', limit: 5, period: 'day' },
          features: {
            verifiedBadge: false,
            prioritySupport: false,
            freeMarketing: false,
            custom: ['Access to basic leads', '5 Leads per day'],
          },
          isActive: true,
        });
      }

      const overallCount = await SubscriptionPlan.countDocuments();
      if (overallCount <= 1) {
        await SubscriptionPlan.insertMany([
          {
            name: 'Basic Monthly',
            price: 499,
            durationDays: 30,
            leadQuota: { type: 'limited', limit: 10, period: 'day' },
            features: {
              verifiedBadge: false,
              prioritySupport: false,
              freeMarketing: false,
              custom: ['Basic Support'],
            },
            isActive: true,
          },
          {
            name: 'Premium Monthly',
            price: 999,
            durationDays: 30,
            leadQuota: { type: 'unlimited' },
            features: {
              verifiedBadge: true,
              prioritySupport: true,
              freeMarketing: false,
              custom: [],
            },
            isActive: true,
          },
          {
            name: 'Premium Yearly',
            price: 8999,
            durationDays: 365,
            leadQuota: { type: 'unlimited' },
            features: {
              verifiedBadge: true,
              prioritySupport: true,
              freeMarketing: true,
              custom: [],
            },
            isActive: true,
          }
        ]);
      }

      plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    }

    return success(res, plans, 'Plans retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/plans/all  (admin - includes inactive) ─────────────────────────
export const getAllPlansAdmin = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    return success(res, plans, 'All plans retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/plans/:id ───────────────────────────────────────────────────────
export const getPlanById = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return error(res, 'Plan not found', 404, 'NOT_FOUND');
    return success(res, plan, 'Plan retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/plans  (admin) ─────────────────────────────────────────────────
export const createPlan = async (req, res, next) => {
  try {
    const { name, price, durationDays, leadQuota, features } = req.body;

    if (!name || price === undefined || !durationDays) {
      return error(res, 'name, price, and durationDays are required', 400, 'VALIDATION_ERROR');
    }

    if (leadQuota?.type === 'limited' && (!leadQuota.limit || leadQuota.limit < 1)) {
      return error(res, 'Lead limit must be at least 1 for limited plans', 400, 'VALIDATION_ERROR');
    }

    const plan = await SubscriptionPlan.create({ name, price, durationDays, leadQuota, features });
    return success(res, plan, 'Plan created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/plans/:id  (admin) ────────────────────────────────────────────
export const updatePlan = async (req, res, next) => {
  try {
    const { name, price, durationDays, leadQuota, features, isActive } = req.body;

    if (leadQuota?.type === 'limited' && (!leadQuota.limit || leadQuota.limit < 1)) {
      return error(res, 'Lead limit must be at least 1 for limited plans', 400, 'VALIDATION_ERROR');
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { $set: { name, price, durationDays, leadQuota, features, isActive } },
      { new: true, runValidators: true }
    );

    if (!plan) return error(res, 'Plan not found', 404, 'NOT_FOUND');
    return success(res, plan, 'Plan updated successfully');
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/plans/:id  (admin - soft delete) ────────────────────────────
export const deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!plan) return error(res, 'Plan not found', 404, 'NOT_FOUND');
    return success(res, plan, 'Plan deactivated successfully');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/plans/:id/subscribe  (vendor) ─────────────────────────────────
// Assigns a plan to the authenticated vendor and sets their subscription dates
export const subscribeToPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan || !plan.isActive) return error(res, 'Plan not found or inactive', 404, 'NOT_FOUND');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          activeSubscription: plan._id,
          subscriptionStatus: 'Active',
          subscriptionExpiresAt: expiresAt,
          subscriptionStartedAt: new Date(),
          // Grant verified badge if plan includes it
          hasVerifiedBadge: plan.features?.verifiedBadge || false,
          // Reset quota usage on new subscription
          leadQuotaUsed: 0,
          leadQuotaResetAt: new Date(),
        }
      },
      { new: true }
    );

    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');
    return success(res, { vendor, plan }, 'Subscribed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/plans/:id/subscribe-order
 * @desc    Create Razorpay Order for Subscription Plan
 * @access  Private (Vendor)
 */
export const createSubscriptionOrder = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan || !plan.isActive) return error(res, 'Plan not found or inactive', 404, 'NOT_FOUND');

    // Free trial can be skipped from Razorpay order creation
    if (plan.price === 0) {
      return success(res, { isFree: true }, 'Plan is free, no order creation needed');
    }

    const options = {
      amount: Math.round(plan.price * 100), // amount in paise
      currency: 'INR',
      receipt: `sub_${plan._id.toString().slice(-6)}_${req.user.id.toString().slice(-6)}_${Date.now()}`,
      notes: {
        planId: plan._id.toString(),
        vendorId: req.user.id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);
    success(res, order, 'Razorpay subscription order created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/plans/:id/subscribe-verify
 * @desc    Verify Razorpay payment and activate Subscription
 * @access  Private (Vendor)
 */
export const verifySubscriptionPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan || !plan.isActive) return error(res, 'Plan not found or inactive', 404, 'NOT_FOUND');

    // If plan is not free, verify signature
    if (plan.price > 0) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return error(res, 'All payment details are required', 400, 'VALIDATION_ERROR');
      }

      // Verify signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        return error(res, 'Invalid payment signature verification failed', 400, 'PAYMENT_VERIFICATION_FAILED');
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          activeSubscription: plan._id,
          subscriptionStatus: 'Active',
          subscriptionExpiresAt: expiresAt,
          subscriptionStartedAt: new Date(),
          hasVerifiedBadge: plan.features?.verifiedBadge || false,
          leadQuotaUsed: 0,
          leadQuotaResetAt: new Date(),
        }
      },
      { new: true }
    ).populate('activeSubscription');

    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');
    return success(res, { vendor, plan }, 'Subscribed successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/plans/quota-check  (vendor) ────────────────────────────────────
// Check if the vendor can still access more leads under their current plan quota
export const checkLeadQuota = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id).populate('activeSubscription');
    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    // No active subscription
    if (vendor.subscriptionStatus !== 'Active' || !vendor.activeSubscription) {
      return success(res, { allowed: false, reason: 'No active subscription' });
    }

    const plan = vendor.activeSubscription;

    // Subscription expired
    if (vendor.subscriptionExpiresAt && new Date() > vendor.subscriptionExpiresAt) {
      await Vendor.findByIdAndUpdate(vendor._id, { $set: { subscriptionStatus: 'Expired' } });
      return success(res, { allowed: false, reason: 'Subscription expired' });
    }

    // Unlimited plan
    if (plan.leadQuota?.type === 'unlimited') {
      return success(res, { allowed: true, quota: 'unlimited' });
    }

    // Limited plan — check if reset is needed
    const now = new Date();
    const resetAt = vendor.leadQuotaResetAt ? new Date(vendor.leadQuotaResetAt) : new Date(0);
    const period = plan.leadQuota?.period || 'day';

    let resetNeeded = false;
    if (period === 'day') resetNeeded = now - resetAt >= 86400000;
    else if (period === 'week') resetNeeded = now - resetAt >= 604800000;
    else if (period === 'month') {
      resetNeeded = now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();
    }

    let used = vendor.leadQuotaUsed || 0;
    if (resetNeeded) {
      await Vendor.findByIdAndUpdate(vendor._id, { $set: { leadQuotaUsed: 0, leadQuotaResetAt: now } });
      used = 0;
    }

    const limit = plan.leadQuota?.limit || 0;
    const remaining = Math.max(0, limit - used);

    return success(res, {
      allowed: used < limit,
      used,
      limit,
      remaining,
      period,
      resetsAt: resetAt,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/plans/quota-increment  (internal/vendor) ──────────────────────
// Called when a vendor accesses a new lead — increments their usage counter
export const incrementLeadQuota = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id).populate('activeSubscription');
    if (!vendor || vendor.subscriptionStatus !== 'Active' || !vendor.activeSubscription) {
      return error(res, 'No active subscription', 403, 'FORBIDDEN');
    }

    const plan = vendor.activeSubscription;
    if (plan.leadQuota?.type === 'unlimited') {
      return success(res, { incremented: false, reason: 'Unlimited plan — no tracking needed' });
    }

    const now = new Date();
    const resetAt = vendor.leadQuotaResetAt ? new Date(vendor.leadQuotaResetAt) : new Date(0);
    const period = plan.leadQuota?.period || 'day';

    let resetNeeded = false;
    if (period === 'day') resetNeeded = now - resetAt >= 86400000;
    else if (period === 'week') resetNeeded = now - resetAt >= 604800000;
    else if (period === 'month') {
      resetNeeded = now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();
    }

    if (resetNeeded) {
      await Vendor.findByIdAndUpdate(vendor._id, { $set: { leadQuotaUsed: 1, leadQuotaResetAt: now } });
    } else {
      await Vendor.findByIdAndUpdate(vendor._id, { $inc: { leadQuotaUsed: 1 } });
    }

    return success(res, { incremented: true });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/plans/webhook/razorpay
 * @desc    Process Razorpay Webhook Events (async subscription confirmation)
 * @access  Public
 */
export const handleRazorpayWebhook = async (req, res, next) => {
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
    } else {
      console.log('Skipping signature validation in unconfigured/non-production environment');
    }

    const { event, payload } = req.body;
    console.log(`Razorpay Webhook received event: ${event}`);

    if (event === 'order.paid' || event === 'payment.captured') {
      const entity = event === 'order.paid' ? payload.order.entity : payload.payment.entity;
      const notes = entity.notes || {};
      const { planId, vendorId } = notes;

      if (planId && vendorId) {
        const plan = await SubscriptionPlan.findById(planId);
        if (plan) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

          await Vendor.findByIdAndUpdate(vendorId, {
            $set: {
              activeSubscription: plan._id,
              subscriptionStatus: 'Active',
              subscriptionExpiresAt: expiresAt,
              subscriptionStartedAt: new Date(),
              hasVerifiedBadge: plan.features?.verifiedBadge || false,
              leadQuotaUsed: 0,
              leadQuotaResetAt: new Date(),
            }
          });
          console.log(`Successfully activated subscription ${plan.name} for vendor ${vendorId} via Webhook`);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    next(err);
  }
};
