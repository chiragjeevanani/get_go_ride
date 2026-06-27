import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';
import { success, error } from '../utils/response.js';
import { sendNotificationToUser, sendNotificationToMultipleUsers } from '../utils/pushNotificationHelper.js';

/**
 * Resolves the Mongoose model based on the user's role.
 */
const getModelByRole = (role) => {
  if (role === 'user') return User;
  if (role === 'vendor') return Vendor;
  if (role === 'admin') return Admin;
  return null;
};

/**
 * Registers / saves a new FCM token.
 * POST /api/fcm/save
 */
export const saveToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    
    if (!token || !platform) {
      return error(res, 'Token and platform are required', 400, 'VALIDATION_ERROR');
    }

    if (!['web', 'mobile', 'app'].includes(platform)) {
      return error(res, 'Platform must be either web, mobile or app', 400, 'VALIDATION_ERROR');
    }

    const Model = getModelByRole(req.user.role);
    if (!Model) {
      return error(res, 'Invalid user role', 400, 'INVALID_ROLE');
    }

    const account = await Model.findById(req.user.id);
    if (!account) {
      return error(res, 'Account not found', 404, 'NOT_FOUND');
    }

    // Initialize fcmTokens if not present
    if (!account.fcmTokens) {
      account.fcmTokens = { web: [], mobile: [] };
    }
    if (!account.fcmTokens.web) account.fcmTokens.web = [];
    if (!account.fcmTokens.mobile) account.fcmTokens.mobile = [];

    const targetArray = platform === 'web' ? account.fcmTokens.web : account.fcmTokens.mobile;

    // Check if token already exists to prevent duplicate entries
    const existingIndex = targetArray.findIndex(t => t.token === token);
    
    if (existingIndex !== -1) {
      // Just update the timestamp
      targetArray[existingIndex].createdAt = new Date();
    } else {
      // If array exceeds max capacity (10 tokens), remove the oldest one (index 0 or sorted oldest)
      if (targetArray.length >= 10) {
        targetArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        targetArray.shift(); // Remove oldest
      }
      
      targetArray.push({ token, createdAt: new Date() });
    }

    await account.save();
    return success(res, null, 'FCM token saved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Deregisters / removes an FCM token (on logout).
 * DELETE /api/fcm/remove
 */
export const removeToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return error(res, 'Token is required', 400, 'VALIDATION_ERROR');
    }

    const Model = getModelByRole(req.user.role);
    if (!Model) {
      return error(res, 'Invalid user role', 400, 'INVALID_ROLE');
    }

    const account = await Model.findById(req.user.id);
    if (!account) {
      return error(res, 'Account not found', 404, 'NOT_FOUND');
    }

    if (account.fcmTokens) {
      if (account.fcmTokens.web) {
        account.fcmTokens.web = account.fcmTokens.web.filter(t => t.token !== token);
      }
      if (account.fcmTokens.mobile) {
        account.fcmTokens.mobile = account.fcmTokens.mobile.filter(t => t.token !== token);
      }
      await account.save();
    }

    return success(res, null, 'FCM token removed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Sends a test notification to the authenticated requester.
 * POST /api/fcm/test
 */
export const sendTestNotification = async (req, res, next) => {
  try {
    const payload = {
      title: 'Get Go Load Test Notification 🚀',
      body: 'Congratulations! Your push notification setup is working perfectly.',
      priority: 'high',
      type: 'test_notification',
      deepLink: `/${req.user.role}/dashboard`,
      timestamp: new Date().toISOString(),
    };

    const result = await sendNotificationToUser(req.user.id, req.user.role, payload);

    if (result.success) {
      if (result.sentCount === 0) {
        return error(res, 'No active FCM tokens registered for your account. Please log in and allow notification permissions.', 400, 'NO_TOKENS');
      }
      return success(res, result, 'Test notification sent successfully');
    } else {
      return error(res, result.error || 'Failed to dispatch test notification', 500, 'FCM_ERROR');
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Admin testing utility to target users or broadcast notifications.
 * POST /api/fcm/admin/send
 */
export const adminSendNotification = async (req, res, next) => {
  try {
    const { 
      target, // 'single_user' | 'broadcast_customers' | 'broadcast_drivers'
      recipientPhone, 
      recipientRole, // 'user' | 'vendor'
      title, 
      body, 
      image,
      icon,
      deepLink, 
      priority 
    } = req.body;

    if (!target || !title || !body) {
      return error(res, 'Target, title, and body are required', 400, 'VALIDATION_ERROR');
    }

    const payload = {
      title,
      body,
      image,
      icon,
      deepLink,
      priority: priority || 'normal',
      type: 'admin_broadcast',
      timestamp: new Date().toISOString()
    };

    if (target === 'single_user') {
      if (!recipientPhone || !recipientRole) {
        return error(res, 'Recipient phone and role are required for single user target', 400, 'VALIDATION_ERROR');
      }

      const Model = getModelByRole(recipientRole);
      const recipient = await Model.findOne({ phone: recipientPhone });
      if (!recipient) {
        return error(res, `Recipient with phone ${recipientPhone} and role ${recipientRole} not found`, 404, 'NOT_FOUND');
      }

      const result = await sendNotificationToUser(recipient._id, recipientRole, payload);
      return success(res, result, 'Single user notification dispatched');

    } else if (target === 'broadcast_customers') {
      const customers = await User.find({ 'fcmTokens.web.0': { $exists: true } }); // find users with at least 1 web token (or mobile)
      const customerMobile = await User.find({ 'fcmTokens.mobile.0': { $exists: true } });
      
      // Merge unique IDs
      const uniqueIds = Array.from(new Set([
        ...customers.map(c => c._id.toString()),
        ...customerMobile.map(c => c._id.toString())
      ]));

      if (uniqueIds.length === 0) {
        return success(res, { sentCount: 0, failedCount: 0 }, 'No customers with registered FCM tokens found');
      }

      const result = await sendNotificationToMultipleUsers(uniqueIds, 'user', payload);
      return success(res, result, `Broadcast sent to ${uniqueIds.length} customers`);

    } else if (target === 'broadcast_drivers') {
      const drivers = await Vendor.find({ 'fcmTokens.web.0': { $exists: true } });
      const driversMobile = await Vendor.find({ 'fcmTokens.mobile.0': { $exists: true } });

      const uniqueIds = Array.from(new Set([
        ...drivers.map(d => d._id.toString()),
        ...driversMobile.map(d => d._id.toString())
      ]));

      if (uniqueIds.length === 0) {
        return success(res, { sentCount: 0, failedCount: 0 }, 'No drivers with registered FCM tokens found');
      }

      const result = await sendNotificationToMultipleUsers(uniqueIds, 'vendor', payload);
      return success(res, result, `Broadcast sent to ${uniqueIds.length} drivers`);
    }

    return error(res, 'Invalid target option', 400, 'VALIDATION_ERROR');
  } catch (err) {
    next(err);
  }
};
