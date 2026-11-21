import { useEffect, useRef, useCallback } from 'react';
import { getLocalDateKey, getMillisecondsUntilMidnight } from '../utils/azkar';

export const LAST_RESET_DATE_KEY = 'azkari-last-reset-date';
export const LEGACY_DATE_STORAGE_KEY = 'azkar-counters-date';
export const AZKAR_COUNTERS_STORAGE_KEY = 'azkar-counters';
export const LAST_ACTIVE_ZIKR_KEY = 'azkari-last-active-zikr';
export const LAST_ACTIVE_SESSION_KEY = 'azkari-last-active-session';

/**
 * Custom hook to automatically reset daily Azkar progress every day at 12:00 AM (local midnight),
 * on initial app mount (closed browser case), and upon wake-from-sleep / tab visibility change.
 *
 * @param {Object} [options]
 * @param {Function} [options.onReset] - Callback invoked when a daily reset occurs.
 * @param {Function} [options.showToast] - Optional notification toast callback.
 * @returns {Object} { getLocalDateKey, checkAndTriggerReset }
 */
export function useDailyAzkarReset({ onReset, showToast } = {}) {
  const timerRef = useRef(null);
  const activeDateRef = useRef(getLocalDateKey());
  const onResetRef = useRef(onReset);
  const showToastRef = useRef(showToast);

  // Keep callback refs updated without re-triggering effects
  useEffect(() => {
    onResetRef.current = onReset;
    showToastRef.current = showToast;
  }, [onReset, showToast]);

  /**
   * Checks if local date has changed compared to last reset date and triggers reset if needed.
   *
   * @param {boolean} [notify=false] - Whether to show a toast message when resetting.
   * @returns {boolean} Whether a reset occurred.
   */
  const checkAndTriggerReset = useCallback((notify = false) => {
    if (typeof window === 'undefined') return false;

    const todayKey = getLocalDateKey();
    let storedDate = null;
    try {
      storedDate =
        localStorage.getItem(LAST_RESET_DATE_KEY) ||
        localStorage.getItem(LEGACY_DATE_STORAGE_KEY);
    } catch {
      // Ignore localStorage access restrictions
    }

    // A new day has arrived if activeDateRef or storedDate differs from todayKey
    const isNewDay =
      activeDateRef.current !== todayKey ||
      (storedDate && storedDate !== todayKey);

    if (isNewDay) {
      activeDateRef.current = todayKey;

      try {
        localStorage.setItem(LAST_RESET_DATE_KEY, todayKey);
        localStorage.setItem(LEGACY_DATE_STORAGE_KEY, todayKey);
        localStorage.setItem(AZKAR_COUNTERS_STORAGE_KEY, '{}');
        localStorage.removeItem(LAST_ACTIVE_ZIKR_KEY);
        localStorage.removeItem(LAST_ACTIVE_SESSION_KEY);
      } catch (err) {
        console.warn('Failed to update daily reset date in localStorage:', err);
      }

      if (typeof onResetRef.current === 'function') {
        onResetRef.current(todayKey);
      }

      if (notify && typeof showToastRef.current === 'function') {
        showToastRef.current(
          'بدأ يوم جديد، تم تجديد عدادات الأذكار اليومية بحمد الله <i class="fas fa-sun text-gold"></i>'
        );
      }
      return true;
    }

    // First run initialization if no stored date exists yet
    if (!storedDate) {
      try {
        localStorage.setItem(LAST_RESET_DATE_KEY, todayKey);
        localStorage.setItem(LEGACY_DATE_STORAGE_KEY, todayKey);
      } catch {
        // Ignore localStorage access restrictions
      }
    }

    return false;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // 1. Initial mount check (handles closed browser case if state wasn't already reset)
    checkAndTriggerReset(false);

    // 2. Schedule live midnight reset timer (handles open tab case)
    const scheduleNextMidnight = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const msUntilMidnight = getMillisecondsUntilMidnight();

      timerRef.current = setTimeout(() => {
        checkAndTriggerReset(true);
        // Recursively schedule next midnight
        scheduleNextMidnight();
      }, msUntilMidnight);
    };

    scheduleNextMidnight();

    // 3. Wake-from-sleep / background tab safety check
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const didReset = checkAndTriggerReset(true);
        if (didReset) {
          scheduleNextMidnight();
        }
      }
    };

    const handleWindowFocus = () => {
      const didReset = checkAndTriggerReset(true);
      if (didReset) {
        scheduleNextMidnight();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // 4. Clean architecture & cleanup on unmount (StrictMode safe)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [checkAndTriggerReset]);

  return {
    getLocalDateKey,
    checkAndTriggerReset,
  };
}

export default useDailyAzkarReset;
