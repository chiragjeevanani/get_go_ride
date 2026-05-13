import SystemSetting from '../models/SystemSetting.model.js';
import { success, error } from '../utils/response.js';

/**
 * @route   GET /api/settings
 * @desc    Get all system settings
 * @access  Public
 */
export const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.find();

    // Transform settings into key-value map for easier consumption
    const config = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    // Seed defaults for Wallet Balance System if nothing is in the database yet
    if (config.walletSignupBonus === undefined) config.walletSignupBonus = 50;
    if (config.maxWalletUsage === undefined) config.maxWalletUsage = 500;

    // Seed defaults for Revenue Model
    if (config.revenueModel === undefined) config.revenueModel = 'subscription';
    if (config.commissionRate === undefined) config.commissionRate = 10;

    success(res, config, 'System settings retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/settings/revenue-model
 * @desc    Get current revenue model configuration
 * @access  Admin
 */
export const getRevenueModel = async (req, res, next) => {
  try {
    const revenueModel = await SystemSetting.findOne({ key: 'revenueModel' });
    const commissionRate = await SystemSetting.findOne({ key: 'commissionRate' });

    return success(res, {
      revenueModel: revenueModel?.value || 'subscription',
      commissionRate: commissionRate?.value || 10,
      modelOptions: [
        { value: 'subscription', label: 'Subscription Only', description: 'Driver pays monthly subscription for lead access' },
        { value: 'subscription_commission', label: 'Subscription + Commission', description: 'Driver pays subscription AND per-deal commission' },
        { value: 'commission', label: 'Commission Only', description: 'Driver pays commission per completed deal only' }
      ]
    }, 'Revenue model configuration retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/settings/revenue-model
 * @desc    Update revenue model settings
 * @access  Admin
 */
export const updateRevenueModel = async (req, res, next) => {
  try {
    const { revenueModel, commissionRate } = req.body;

    // Validate revenue model
    const validModels = ['subscription', 'subscription_commission', 'commission'];
    if (revenueModel && !validModels.includes(revenueModel)) {
      return error(res, 'Invalid revenue model. Must be: subscription, subscription_commission, or commission', 400, 'INVALID_MODEL');
    }

    // Validate commission rate
    if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
      return error(res, 'Commission rate must be between 0 and 100', 400, 'INVALID_RATE');
    }

    // Update settings
    if (revenueModel !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'revenueModel' },
        { key: 'revenueModel', value: revenueModel, description: 'Business revenue model mode' },
        { upsert: true, new: true }
      );
    }

    if (commissionRate !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'commissionRate' },
        { key: 'commissionRate', value: Number(commissionRate), description: 'Platform commission percentage' },
        { upsert: true, new: true }
      );
    }

    // Fetch updated settings
    const updatedModel = await SystemSetting.findOne({ key: 'revenueModel' });
    const updatedRate = await SystemSetting.findOne({ key: 'commissionRate' });

    return success(res, {
      revenueModel: updatedModel?.value || 'subscription',
      commissionRate: updatedRate?.value || 10
    }, 'Revenue model updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/settings
 * @desc    Update system settings (Admin only)
 * @access  Private (Admin)
 */
export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // Expecting { coinValueInInr: X, maxCoinsPerTransaction: Y }

    for (const [key, value] of Object.entries(updates)) {
      await SystemSetting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }

    const settings = await SystemSetting.find();
    const config = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    success(res, config, 'System settings updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/settings/razorpay-key
 * @desc    Get Razorpay public key ID
 * @access  Public
 */
export const getRazorpayKey = async (req, res, next) => {
  try {
    success(res, { keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' }, 'Razorpay key retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Helper function to get current revenue model settings
 * Used by other controllers (chat.controller.js)
 */
export const getRevenueModelConfig = async () => {
  const revenueModel = await SystemSetting.findOne({ key: 'revenueModel' });
  const commissionRate = await SystemSetting.findOne({ key: 'commissionRate' });

  return {
    model: revenueModel?.value || 'subscription',
    commissionRate: commissionRate?.value || 10
  };
};
