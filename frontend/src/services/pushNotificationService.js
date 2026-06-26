import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Gets the current active JWT token based on route context
 */
const getActiveAuthToken = () => {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const isDriver = window.location.pathname.startsWith('/driver');
  
  return isAdmin 
    ? localStorage.getItem('gtgl_admin_token')
    : isDriver
      ? localStorage.getItem('gtgl_driver_token')
      : localStorage.getItem('gtgl_token');
};

/**
 * Registers the service worker and generates the FCM token
 */
export const initializePushNotifications = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[FCM] Browser does not support service workers or push messaging.');
      return null;
    }

    if (!messaging) {
      console.warn('[FCM] Messaging SDK is not initialized.');
      return null;
    }

    // 1. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission was denied.');
      return null;
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('[FCM] Service Worker registered with scope:', registration.scope);

    // 3. Generate FCM Token
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('[FCM] VITE_FIREBASE_VAPID_KEY is missing in environment.');
      return null;
    }

    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey
    });

    if (token) {
      console.log('[FCM] FCM Token generated successfully:', token);
      localStorage.setItem('gtgl_fcm_token', token);
      
      // 4. Register token with backend (if user is already logged in)
      await registerFCMToken(token);
      return token;
    } else {
      console.warn('[FCM] No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Failed to initialize push notifications:', error);
    return null;
  }
};

/**
 * Registers the FCM token with the backend database
 */
export const registerFCMToken = async (token = null) => {
  try {
    const fcmToken = token || localStorage.getItem('gtgl_fcm_token');
    if (!fcmToken) return;

    const authToken = getActiveAuthToken();
    if (!authToken) {
      // User is not authenticated yet. Token will be registered on login.
      return;
    }

    await axios.post(`${API_URL}/fcm/save`, {
      token: fcmToken,
      platform: 'web'
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    console.log('[FCM] Token registered with backend database.');
  } catch (error) {
    console.error('[FCM] Failed to register FCM token with backend:', error.response?.data || error.message);
  }
};

/**
 * Removes the FCM token from the backend and clears local storage (on logout)
 */
export const removeFCMToken = async () => {
  try {
    const token = localStorage.getItem('gtgl_fcm_token');
    if (!token) return;

    const authToken = getActiveAuthToken();
    if (authToken) {
      await axios.delete(`${API_URL}/fcm/remove`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        data: { token }
      });
      console.log('[FCM] Token removed from backend database.');
    }

    localStorage.removeItem('gtgl_fcm_token');
  } catch (error) {
    console.error('[FCM] Failed to remove FCM token from backend:', error.response?.data || error.message);
    // Remove local token anyway
    localStorage.removeItem('gtgl_fcm_token');
  }
};

/**
 * Sets up foreground notification event listeners
 */
export const setupForegroundNotificationHandler = (toastCallback) => {
  try {
    if (!messaging) return () => {};

    // Listen for background-to-foreground SW messages or standard onMessage
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground notification received:', payload);
      if (toastCallback && typeof toastCallback === 'function') {
        toastCallback(payload);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('[FCM] Error setting up foreground message handler:', error);
    return () => {};
  }
};
