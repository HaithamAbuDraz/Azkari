import { usePrayerContext } from '../context/PrayerContext';

/**
 * usePrayerTimes
 *
 * Hook that accesses the global PrayerContext, ensuring a single shared timer,
 * single AlAdhan API fetch, background PWA service worker notifications, and
 * global Adhan playback across all pages.
 */
export function usePrayerTimes() {
  return usePrayerContext();
}

export default usePrayerTimes;
