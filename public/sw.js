/**
 * Azkari Service Worker (sw.js)
 *
 * Lightweight background prayer notification handler using standard setTimeout.
 * Triggers native system notifications at scheduled prayer times and focuses
 * or opens the app on notification click to play the Adhan audio.
 */

const SW_VERSION = 'azkari-sw-v3';
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

// 3. Show Native System Notification
function showPrayerNotification(prayer) {
  const title = `حان الآن موعد أذان ${prayer.label}`;
  const options = {
    body: 'حي على الصلاة • انقر الآن للاستماع إلى صوت الأذان',
    icon: '/icon.png',
    badge: '/favicon.svg',
    tag: `prayer-alert-${prayer.key}`,
    renotify: true,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [300, 150, 300, 150, 600],
    data: {
      url: '/?tab=prayers&action=play_adhan',
      prayerKey: prayer.key,
      prayerLabel: prayer.label,
      timestamp: Date.now(),
    },
    actions: [
      { action: 'play', title: 'تشغيل الأذان' },
      { action: 'dismiss', title: 'إغلاق' },
    ],
  };

  self.registration.showNotification(title, options);
}

// 4. Schedule Prayer Notifications using standard setTimeout
function schedulePrayerNotifications(prayers = []) {
  clearScheduledTimers();
  const now = Date.now();

  prayers.forEach((prayer) => {
    const delay = prayer.timeMs - now;

    // Only schedule future prayers within the next 24 hours
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const timerId = setTimeout(() => {
        showPrayerNotification(prayer);
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
  const targetUrl = notificationData.url || '/?tab=prayers&action=play_adhan';
  const prayerLabel = notificationData.prayerLabel || 'الصلاة';

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
