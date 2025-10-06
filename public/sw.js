// Harmony Shield Service Worker - Enhanced for Performance and Offline Support
const CACHE_NAME = 'harmony-shield-v2.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  // Add critical CSS and JS files
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/rest\/v1\/profiles/,
  /\/rest\/v1\/user_roles/,
  /\/rest\/v1\/notifications/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Harmony Shield Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Harmony Shield Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients to start handling fetch events immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'sync-user-data':
      event.waitUntil(syncUserData());
      break;
    case 'sync-notifications':
      event.waitUntil(syncNotifications());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

// Sync user data when back online
async function syncUserData() {
  try {
    console.log('Syncing user data...');
    
    // Get all clients and send sync message
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_DATA',
        payload: { dataType: 'user' }
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error syncing user data:', error);
    return Promise.reject(error);
  }
}

// Sync notifications when back online
async function syncNotifications() {
  try {
    console.log('Syncing notifications...');
    
    // Get all clients and send sync message
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_DATA',
        payload: { dataType: 'notifications' }
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error syncing notifications:', error);
    return Promise.reject(error);
  }
}