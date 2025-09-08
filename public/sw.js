// ScamShield Service Worker for Push Notifications
self.addEventListener('install', event => {
  console.log('ScamShield Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('ScamShield Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  console.log('Push notification received:', event);

  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const notification = data.notification || data;

    const options = {
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      badge: notification.badge || '/favicon.ico',
      tag: notification.tag || 'scamshield-alert',
      requireInteraction: notification.requireInteraction || false,
      actions: notification.actions || [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: notification.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(notification.title, options)
    );

    // Trigger vibration for critical alerts
    if (notification.data?.result?.riskLevel === 'critical') {
      // Vibration will be handled by the browser automatically for critical notifications
      console.log('Critical threat notification displayed');
    }

  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('https://hgqhgwdzsyqrjtthsmyg.lovable.app/dashboard')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.openWindow('https://hgqhgwdzsyqrjtthsmyg.lovable.app')
    );
  }
});

self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event);
  // Track notification dismissal if needed
});