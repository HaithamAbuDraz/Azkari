import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAzkarByCategory,
  getCategoryTabFromCardId,
  migrateStoredCounters,
  getLocalDateKey,
} from '../utils/azkar';
import { triggerHaptic } from '../utils/haptics';
import { playMilestoneChime } from '../utils/sound';
import {
  useDailyAzkarReset,
  LAST_RESET_DATE_KEY,
  LEGACY_DATE_STORAGE_KEY,
  AZKAR_COUNTERS_STORAGE_KEY,
  LAST_ACTIVE_ZIKR_KEY,
  LAST_ACTIVE_SESSION_KEY,
} from './useDailyAzkarReset';

export { LAST_ACTIVE_ZIKR_KEY as LAST_ACTIVE_STORAGE_KEY };

function resetCategoryCounters(prev, list) {
  const next = { ...prev };
  list.forEach((item) => {
    next[item.cardId] = item.count;
  });
  return next;
}

export function useAzkarCounters(showToast) {
  const scrollTimerRef = useRef(null);

  // Cleanup pending scroll timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Initialize counters directly from localStorage; reset automatically on a new day (Closed Browser Case)
  const [counters, setCounters] = useState(() => {
    if (typeof window === 'undefined') return {};
    const todayKey = getLocalDateKey();

    try {
      const savedDate =
        localStorage.getItem(LAST_RESET_DATE_KEY) ||
        localStorage.getItem(LEGACY_DATE_STORAGE_KEY);

      if (savedDate && savedDate !== todayKey) {
        localStorage.setItem(LAST_RESET_DATE_KEY, todayKey);
        localStorage.setItem(LEGACY_DATE_STORAGE_KEY, todayKey);
        localStorage.setItem(AZKAR_COUNTERS_STORAGE_KEY, '{}');
        try {
          localStorage.removeItem(LAST_ACTIVE_ZIKR_KEY);
          localStorage.removeItem(LAST_ACTIVE_SESSION_KEY);
        } catch {
          // Ignore
        }
        return {};
      }

      if (!savedDate) {
        localStorage.setItem(LAST_RESET_DATE_KEY, todayKey);
        localStorage.setItem(LEGACY_DATE_STORAGE_KEY, todayKey);
      }

      const saved = localStorage.getItem(AZKAR_COUNTERS_STORAGE_KEY);
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object'
        ? migrateStoredCounters(parsed)
        : {};
    } catch (e) {
      console.error('Failed to load azkar counters from localStorage:', e);
      return {};
    }
  });

  // Automated midnight scheduler & wake-from-sleep reset handler
  const handleDailyReset = useCallback(() => {
    setCounters({});
  }, []);

  useDailyAzkarReset({
    onReset: handleDailyReset,
    showToast,
  });

  // Save counters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        AZKAR_COUNTERS_STORAGE_KEY,
        JSON.stringify(counters)
      );
    } catch (e) {
      console.error('Failed to save azkar counters to localStorage:', e);
    }
  }, [counters]);

  // Decrement counter for a specific dhikr card (preserves daily completion until next day)
  const decrementCounter = useCallback(
    (cardId, max) => {
      const todayKey = getLocalDateKey();

      let willBeCompleted = false;

      // 1. Instant pure state update (0ms, non-blocking)
      setCounters((prev) => {
        const current = prev[cardId] ?? max;
        if (current <= 0) return prev;

        const nextVal = current - 1;
        if (nextVal === 0) willBeCompleted = true;

        return { ...prev, [cardId]: nextVal };
      });

      // 2. Instant tactile feedback
      triggerHaptic(20);

      // 3. Defer disk I/O, toasts, and chimes asynchronously so the UI thread updates at 60fps+
      setTimeout(() => {
        try {
          const tabKey = getCategoryTabFromCardId(cardId);
          const list = getAzkarByCategory(tabKey);

          // Get latest counters for session check
          let currentCounters = {};
          try {
            const raw = localStorage.getItem(AZKAR_COUNTERS_STORAGE_KEY);
            currentCounters = raw ? JSON.parse(raw) : {};
          } catch {}

          let nextCardId = cardId;
          const firstUnread = list.find((candidate) => {
            const candRem =
              currentCounters[candidate.cardId] ?? candidate.count;
            return candRem > 0;
          });
          if (firstUnread) {
            nextCardId = firstUnread.cardId;
          }

          const sessionPayload = JSON.stringify({
            tabKey,
            cardId,
            nextCardId,
            date: todayKey,
            timestamp: Date.now(),
          });

          localStorage.setItem(LAST_ACTIVE_ZIKR_KEY, sessionPayload);
          localStorage.setItem(LAST_ACTIVE_SESSION_KEY, sessionPayload);
          try {
            sessionStorage.setItem('azkari-active-tab', tabKey);
          } catch {
            // Ignore session storage errors
          }

          if (willBeCompleted) {
            // Single-card completion haptic: two gentle pulses
            triggerHaptic([20, 60, 20]);

            const allDone = list.every(
              (item) => (currentCounters[item.cardId] ?? item.count) === 0
            );

            if (allDone && list.length > 0) {
              // Full-session completion — richer haptic pattern & celebratory spiritual chime
              setTimeout(() => triggerHaptic([30, 80, 30, 80, 60]), 350);
              try {
                playMilestoneChime();
              } catch {
                // Ignore chime errors
              }

              showToast(
                'ما شاء الله! اكتملت جميع أذكار هذا القسم لهذا اليوم، تقبّل الله طاعتك <i class="fas fa-check-circle text-gold"></i>'
              );

              // Smoothly scroll up if the user is scrolled down towards the bottom
              if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
              }
              scrollTimerRef.current = setTimeout(() => {
                if (typeof window !== 'undefined') {
                  const scrollPos =
                    window.scrollY || document.documentElement.scrollTop || 0;
                  if (scrollPos > 80) {
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    });
                  }
                }
              }, 900);
            } else {
              showToast(
                'أحسنت! اكتمل الذكر بحمد الله <i class="fas fa-check-circle text-gold"></i>'
              );
            }
          }
        } catch {
          // Ignore storage quota errors
        }
      }, 0);
    },
    [showToast]
  );

  // Reset a single card counter to its original count
  const resetCardCounter = useCallback((cardId, max) => {
    setCounters((prev) => {
      const next = { ...prev };
      next[cardId] = max;
      return next;
    });
  }, []);

  // Reset all counters for an entire panel/category (e.g., morning, evening)
  const resetPanel = useCallback(
    (tabKey) => {
      const list = getAzkarByCategory(tabKey);
      setCounters((prev) => resetCategoryCounters(prev, list));
      try {
        const stored = localStorage.getItem(LAST_ACTIVE_ZIKR_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.tabKey === tabKey) {
            localStorage.removeItem(LAST_ACTIVE_ZIKR_KEY);
          }
        }
      } catch {
        // Ignore storage errors
      }
      showToast(
        'تمت إعادة تعيين جميع أذكار هذا القسم <i class="fas fa-rotate-left text-gold"></i>'
      );
    },
    [showToast]
  );

  return {
    counters,
    decrementCounter,
    resetCardCounter,
    resetPanel,
  };
}
