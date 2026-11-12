import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAzkarByCategory,
  getCategoryTabFromCardId,
  migrateStoredCounters,
} from '../utils/azkar';
import { triggerHaptic } from '../utils/haptics';
import { playMilestoneChime } from '../utils/sound';

const STORAGE_KEY = 'azkar-counters';
const DATE_STORAGE_KEY = 'azkar-counters-date';

/**
 * Returns local calendar date key (YYYY-MM-DD) so daily resets happen at
 * the user's local midnight rather than UTC midnight.
 */
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resetCategoryCounters(prev, list) {
  const next = { ...prev };
  list.forEach((item) => {
    next[item.cardId] = item.count;
  });
  return next;
}

export function useAzkarCounters(showToast) {
  const scrollTimerRef = useRef(null);
  const activeDateRef = useRef(getLocalDateKey());

  // Cleanup pending scroll timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Initialize counters directly from localStorage; reset automatically on a new day
  const [counters, setCounters] = useState(() => {
    if (typeof window === 'undefined') return {};
    const todayKey = getLocalDateKey();
    activeDateRef.current = todayKey;

    try {
      const savedDate = localStorage.getItem(DATE_STORAGE_KEY);
      if (savedDate && savedDate !== todayKey) {
        localStorage.setItem(DATE_STORAGE_KEY, todayKey);
        localStorage.setItem(STORAGE_KEY, '{}');
        return {};
      }

      if (!savedDate) {
        localStorage.setItem(DATE_STORAGE_KEY, todayKey);
      }

      const saved = localStorage.getItem(STORAGE_KEY);
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

  // Save counters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
    } catch (e) {
      console.error('Failed to save azkar counters to localStorage:', e);
    }
  }, [counters]);

  // Reset daily progress automatically if the local calendar day changes while app stays open
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncDailyReset = () => {
      const todayKey = getLocalDateKey();
      if (activeDateRef.current !== todayKey) {
        activeDateRef.current = todayKey;
        try {
          localStorage.setItem(DATE_STORAGE_KEY, todayKey);
          localStorage.setItem(STORAGE_KEY, '{}');
        } catch {
          // Ignore storage quota errors
        }
        setCounters({});
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncDailyReset();
      }
    };

    const intervalId = setInterval(syncDailyReset, 60000);
    window.addEventListener('focus', syncDailyReset);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', syncDailyReset);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Decrement counter for a specific dhikr card (preserves daily completion until next day)
  const decrementCounter = useCallback(
    (cardId, max) => {
      const todayKey = getLocalDateKey();
      const isNewDay = activeDateRef.current !== todayKey;
      if (isNewDay) {
        activeDateRef.current = todayKey;
        try {
          localStorage.setItem(DATE_STORAGE_KEY, todayKey);
        } catch {
          // Ignore storage quota errors
        }
      }

      setCounters((prev) => {
        const base = isNewDay ? {} : prev;
        const current = base[cardId] ?? max;
        if (current <= 0) return base;

        const nextVal = current - 1;
        triggerHaptic(25);

        const tabKey = getCategoryTabFromCardId(cardId);
        const nextCounters = { ...base, [cardId]: nextVal };

        if (nextVal === 0) {
          // Single-card completion haptic: two gentle pulses
          triggerHaptic([20, 60, 20]);

          const list = getAzkarByCategory(tabKey);
          const allDone = list.every(
            (item) => (nextCounters[item.cardId] ?? item.count) === 0
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

        return nextCounters;
      });
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
