import SubscriptionPlan from '../models/SubscriptionPlan.model.js';
import Vendor from '../models/Vendor.model.js';
import { success, error } from '../utils/response.js';

// ─── GET /api/plans  (public) ─────────────────────────────────────────────────
export const getAllPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
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
