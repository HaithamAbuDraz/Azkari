/**
 * Azkari Service Worker (sw.js)
 *
 * Lightweight background prayer notification handler using standard setTimeout.
 * Triggers native system notifications at scheduled prayer times and focuses
 * or opens the app on notification click to play the Adhan audio.
 */

const SW_VERSION = 'azkari-sw-v7';
let scheduledTimers = [];

// 1. Install & Activate Service Worker immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 2. Clear existing scheduled timers
function clearScheduledTimers() {
  scheduledTimers.forEach((timerId) => clearTimeout(timerId));
  scheduledTimers = [];
}

// 3. Show Native System Notification (Clean title, persistent banner, without asking to click)
function showPrayerNotification(prayer) {
  const origin = self.location.origin;
  const title = `حان الآن موعد أذان ${prayer.label}`;
  const options = {
    body: 'حي على الصلاة • حي على الفلاح',
    icon: `${origin}/icon.png`,
    badge: `${origin}/favicon.svg`,
    tag: `prayer-alert-${prayer.key || prayer.label}`,
    renotify: true,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [300, 150, 300, 150, 600],
    data: {
      url: `/?tab=prayers&action=play_adhan&prayer=${encodeURIComponent(prayer.label)}`,
      prayerKey: prayer.key || prayer.label,
      prayerLabel: prayer.label,
      timestamp: Date.now(),
    },
    actions: [{ action: 'dismiss', title: 'إغلاق' }],
  };

  return self.registration.showNotification(title, options);
}

// 4. Schedule Prayer Notifications using standard setTimeout and trigger audio directly
function schedulePrayerNotifications(prayers = []) {
  clearScheduledTimers();
  const now = Date.now();

  prayers.forEach((prayer) => {
    const delay = prayer.timeMs - now;

    // Only schedule future prayers within the next 24 hours
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const timerId = setTimeout(() => {
        showPrayerNotification(prayer);

        // Directly broadcast to all open window clients to start Adhan sound immediately
        self.clients
          .matchAll({ type: 'window', includeUncontrolled: true })
          .then((clientList) => {
            clientList.forEach((client) => {
              client.postMessage({
                type: 'PLAY_ADHAN',
                prayerLabel: prayer.label,
                prayerKey: prayer.key,
              });
            });
          });
      }, delay);

      scheduledTimers.push(timerId);
    }
  });
}

// 5. Handle Messages from React Client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SCHEDULE_PRAYERS':
      schedulePrayerNotifications(event.data.prayers || []);
      break;

    case 'SHOW_MANUAL_NOTIFICATION':
      if (event.data.prayer) {
        showPrayerNotification(event.data.prayer);
        self.clients
          .matchAll({ type: 'window', includeUncontrolled: true })
          .then((clientList) => {
            clientList.forEach((client) => {
              client.postMessage({
                type: 'PLAY_ADHAN',
                prayerLabel: event.data.prayer.label,
                prayerKey: event.data.prayer.key,
              });
            });
          });
      }
      break;

    case 'CLEAR_PRAYERS':
      clearScheduledTimers();
      break;

    default:
      break;
  }
});

// 6. Handle Notification Click (Focus open tab or open window, then trigger PLAY_ADHAN)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const prayerLabel = notificationData.prayerLabel || 'الصلاة';
  const targetUrl =
    notificationData.url ||
    `/?tab=prayers&action=play_adhan&prayer=${encodeURIComponent(prayerLabel)}`;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 1. Focus existing open tab if available and send PLAY_ADHAN message
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus().then((focusedClient) => {
              if (focusedClient) {
                focusedClient.postMessage({
                  type: 'PLAY_ADHAN',
                  prayerLabel,
                  prayerKey: notificationData.prayerKey,
                });
              }
            });
          }
        }

        // 2. If no window is open, open a new window pointing to targetUrl
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
