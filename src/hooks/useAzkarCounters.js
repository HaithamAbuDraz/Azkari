import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAzkarByCategory,
  getCategoryTabFromCardId,
  migrateStoredCounters,
} from '../utils/azkar';
import { triggerHaptic } from '../utils/haptics';
import { playMilestoneChime } from '../utils/sound';

const STORAGE_KEY = 'azkar-counters';

function resetCategoryCounters(prev, list) {
  const next = { ...prev };
  list.forEach((item) => {
    next[item.cardId] = item.count;
  });
  return next;
}

export function useAzkarCounters(showToast) {
  const autoResetTimers = useRef({});

  // Cleanup pending reset timers on unmount
  useEffect(() => {
    return () => {
      Object.values(autoResetTimers.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  // Initialize counters directly from localStorage so there's no state flicker on page reload
  const [counters, setCounters] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
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

  // Decrement counter for a specific dhikr card
  const decrementCounter = useCallback(
    (cardId, max) => {
      setCounters((prev) => {
        const current = prev[cardId] ?? max;
        if (current <= 0) return prev;

        const nextVal = current - 1;
        triggerHaptic(25);

        const tabKey = getCategoryTabFromCardId(cardId);
        const nextCounters = { ...prev, [cardId]: nextVal };

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
              'ما شاء الله! اكتملت جميع الأذكار وتم تجديد التقدم تلقائياً <i class="fas fa-check-circle text-gold"></i>'
            );

            // Automatically refresh progress and smoothly scroll to top after a brief confirmation
            if (autoResetTimers.current[tabKey]) {
              clearTimeout(autoResetTimers.current[tabKey]);
            }

            // Smoothly scroll up if the user is scrolled down towards the bottom
            setTimeout(() => {
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

            autoResetTimers.current[tabKey] = setTimeout(() => {
              setCounters((currentCounters) =>
                resetCategoryCounters(currentCounters, list)
              );
              delete autoResetTimers.current[tabKey];
            }, 1200);
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
