importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase App in Service Worker (Compat Version)
// Note: In production, compile or replace these placeholders with your actual Firebase config values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let firebaseInitialized = false;

try {
  if (firebaseConfig.messagingSenderId && firebaseConfig.messagingSenderId !== "YOUR_MESSAGING_SENDER_ID") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    
    // Customize background message rendering
    messaging.onBackgroundMessage((payload) => {
      console.log('[SW] Background message received via Firebase SDK:', payload);
      
      const title = payload.notification?.title || payload.data?.title || 'Get Go Load';
      const options = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: payload.data?.icon || '/favicon.svg',
        badge: '/favicon.svg',
        image: payload.data?.image || payload.notification?.image || payload.notification?.imageUrl,
        data: payload.data || {}
      };
      
      return self.registration.showNotification(title, options);
    });
    
    firebaseInitialized = true;
    console.log('[SW] Firebase Admin SDK compat initialized successfully in Service Worker.');
  }
} catch (err) {
  console.error('[SW] Firebase compatibility initialization failed:', err);
}

// Fallback: Handle push events manually if Firebase SDK is not configured
self.addEventListener('push', function(event) {
  console.log('[SW] Raw Push event received.');
  
  // If Firebase successfully initialized, let onBackgroundMessage handle it.
  if (firebaseInitialized) return;
  
  if (!event.data) return;

  try {
    const payload = event.data.json();
    console.log('[SW] Manual push payload parsed:', payload);
    
    const data = payload.data || {};
    const title = payload.notification?.title || data.title || 'Get Go Load 🚚';
    const body = payload.notification?.body || data.body || '';
    
    const options = {
      body: body,
      icon: data.icon || '/favicon.svg',
      badge: '/favicon.svg',
      image: data.image || payload.notification?.image || payload.notification?.imageUrl,
      data: data
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('[SW] Failed to show manual push notification:', err);
  }
});

// Handle notification click events (deep linking and window focusing)
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification);
  event.notification.close();

  const data = event.notification.data || {};
  const deepLink = data.deepLink || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. Try to find an existing window/tab on our origin and focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin)) {
          return client.navigate(deepLink).then(c => c.focus());
        }
      }
      
      // 2. If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(deepLink);
      }
    })
  );
});
