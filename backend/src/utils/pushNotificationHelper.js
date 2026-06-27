import { messaging } from '../services/firebaseAdmin.js';
import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';

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
 * Sends a push notification to a single user.
 * 
 * @param {string} userId - Mongoose User ID
 * @param {string} role - 'user' | 'vendor' | 'admin'
 * @param {Object} payload - Notification payload parameters
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body text
 * @param {string} [payload.icon] - Icon URL
 * @param {string} [payload.image] - Image URL
 * @param {string} [payload.priority] - 'high' | 'normal'
 * @param {string} [payload.type] - Notification type
 * @param {string} [payload.entityId] - Target ID
 * @param {string} [payload.deepLink] - In-app redirect link
 * @param {Object} [payload.customData] - Additional key-value pairs
 * @returns {Promise<{success: boolean, sentCount: number, failedCount: number}>}
 */
export const sendNotificationToUser = async (userId, role, payload) => {
  try {
    if (!messaging) {
      console.warn('[FCM HELPER] Push notifications are not initialized. Skipping.');
      return { success: false, reason: 'Firebase Admin not initialized' };
    }

    const Model = getModelByRole(role);
    if (!Model) {
      console.error(`[FCM HELPER] Invalid role: ${role}`);
      return { success: false, reason: 'Invalid role' };
    }

    const recipient = await Model.findById(userId);
    if (!recipient) {
      console.error(`[FCM HELPER] Recipient not found: ID ${userId}, Role ${role}`);
      return { success: false, reason: 'Recipient not found' };
    }

    const webTokens = (recipient.fcmTokens?.web || []).map((t) => ({ token: t.token, platform: 'web' }));
    const mobileTokens = (recipient.fcmTokens?.mobile || []).map((t) => ({ token: t.token, platform: 'mobile' }));
    const allTokens = [...webTokens, ...mobileTokens];

    if (allTokens.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0, reason: 'No registered tokens' };
    }

    const results = await sendToTokens(allTokens, payload, recipient, Model);
    return results;
  } catch (err) {
    console.error('[FCM HELPER] Error sending notification to user:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a push notification to multiple users.
 */
export const sendNotificationToMultipleUsers = async (userIds, roles, payload) => {
  try {
    const promises = userIds.map((userId, idx) => {
      const role = Array.isArray(roles) ? roles[idx] : roles;
      return sendNotificationToUser(userId, role, payload);
    });

    const results = await Promise.all(promises);
    const summary = results.reduce(
      (acc, curr) => {
        acc.sentCount += curr.sentCount || 0;
        acc.failedCount += curr.failedCount || 0;
        return acc;
      },
      { sentCount: 0, failedCount: 0 }
    );

    return { success: true, ...summary };
  } catch (err) {
    console.error('[FCM HELPER] Error in sendNotificationToMultipleUsers:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a push notification to all admins.
 */
export const sendNotificationToAdmins = async (payload) => {
  try {
    const admins = await Admin.find({});
    const adminIds = admins.map((a) => a._id);
    if (adminIds.length === 0) return { success: true, sentCount: 0, failedCount: 0 };

    return await sendNotificationToMultipleUsers(adminIds, 'admin', payload);
  } catch (err) {
    console.error('[FCM HELPER] Error sending to admins:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Internal helper to dispatch payload to multiple raw tokens.
 */
const sendToTokens = async (tokens, payload, recipientDoc, Model) => {
  let sentCount = 0;
  let failedCount = 0;
  const invalidTokens = [];

  const messages = tokens.map(({ token, platform }) => {
    const fcmMessage = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.image && { imageUrl: payload.image })
      },
      data: {
        title: payload.title,
        body: payload.body,
        type: payload.type || 'general',
        entityId: payload.entityId || '',
        deepLink: payload.deepLink || '',
        timestamp: payload.timestamp || new Date().toISOString(),
        ...(payload.icon && { icon: payload.icon }),
        ...(payload.image && { image: payload.image }),
        ...(payload.customData && {
          customData: typeof payload.customData === 'string' ? payload.customData : JSON.stringify(payload.customData)
        })
      }
    };

    if (platform === 'web') {
      fcmMessage.webpush = {
        headers: {
          Urgency: payload.priority === 'high' ? 'high' : 'normal'
        },
        notification: {
          icon: payload.icon || '/favicon.svg',
          badge: '/favicon.svg',
          ...(payload.image && { image: payload.image }),
          requireInteraction: payload.priority === 'high'
        }
      };
    } else {
      fcmMessage.android = {
        priority: payload.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: 'default',
          ...(payload.icon && { icon: payload.icon }),
          ...(payload.image && { imageUrl: payload.image })
        }
      };
    }

    return { message: fcmMessage, rawToken: token, platform };
  });

  // Modern firebase-admin sendEach API
  const responses = await Promise.all(
    messages.map(async (msgObj) => {
      try {
        await messaging.send(msgObj.message);
        sentCount++;
        return { success: true };
      } catch (fcmErr) {
        console.error('[FCM HELPER] messaging.send failed:', fcmErr);
        failedCount++;
        const code = fcmErr.code;
        // Invalid/unregistered token codes
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token' ||
          fcmErr.message.includes('not registered')
        ) {
          invalidTokens.push({ token: msgObj.rawToken, platform: msgObj.platform });
        }
        return { success: false, error: fcmErr };
      }
    })
  );

  // Auto clean up invalid tokens if any were detected
  if (invalidTokens.length > 0) {
    try {
      const webToRemove = invalidTokens.filter((t) => t.platform === 'web').map((t) => t.token);
      const mobileToRemove = invalidTokens.filter((t) => t.platform === 'mobile').map((t) => t.token);

      if (webToRemove.length > 0) {
        recipientDoc.fcmTokens.web = recipientDoc.fcmTokens.web.filter((t) => !webToRemove.includes(t.token));
      }
      if (mobileToRemove.length > 0) {
        recipientDoc.fcmTokens.mobile = recipientDoc.fcmTokens.mobile.filter((t) => !mobileToRemove.includes(t.token));
      }

      await recipientDoc.save();
      console.log(`[FCM HELPER] Cleared ${invalidTokens.length} stale tokens from recipient ${recipientDoc._id}`);
    } catch (saveErr) {
      console.error('[FCM HELPER] Failed to save cleaned up recipient document:', saveErr.message);
    }
  }

  return { success: true, sentCount, failedCount };
};
