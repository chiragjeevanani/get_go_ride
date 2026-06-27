import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

let firebaseApp = null;

try {
  if (process.env.FIREBASE_CONFIG) {
    // Attempt to load from JSON string in environment variable
    try {
      const config = JSON.parse(process.env.FIREBASE_CONFIG);
      const apps = getApps();
      if (apps.length === 0) {
        firebaseApp = initializeApp({
          credential: cert(config)
        });
      } else {
        firebaseApp = apps[0];
      }
      console.log('[FIREBASE] Admin SDK initialized successfully via FIREBASE_CONFIG env variable.');
    } catch (parseErr) {
      console.error('[FIREBASE] Error parsing FIREBASE_CONFIG JSON:', parseErr.message);
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Attempt to load from file path
    const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(serviceAccountPath)) {
      const config = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      const apps = getApps();
      if (apps.length === 0) {
        firebaseApp = initializeApp({
          credential: cert(config)
        });
      } else {
        firebaseApp = apps[0];
      }
      console.log(`[FIREBASE] Admin SDK initialized successfully via service account file at: ${serviceAccountPath}`);
    } else {
      console.warn(`[FIREBASE] Warning: Service account file not found at ${serviceAccountPath}`);
    }
  } else {
    console.warn('[FIREBASE] Warning: Neither FIREBASE_CONFIG nor FIREBASE_SERVICE_ACCOUNT_PATH is set. Push notifications will be disabled.');
  }
} catch (error) {
  console.error('[FIREBASE] Error initializing Firebase Admin SDK:', error.message);
}

export const messaging = firebaseApp ? getMessaging(firebaseApp) : null;
