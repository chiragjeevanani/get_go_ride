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

    success(res, config, 'System settings retrieved successfully');
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
