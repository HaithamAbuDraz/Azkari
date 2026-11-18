import { useState, useEffect, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { TASBIH_FAVORITES_KEY } from '../constants/tasbih';

/**
 * Shared hook to manage and observe Tasbih favorite dhikrs with
 * localStorage persistence and multi-component/tab event synchronization.
 */
export function useTasbihFavorites(showToast) {
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(TASBIH_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isFavorite = useCallback(
    (label) => favorites.includes(label),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (label, e) => {
      e?.stopPropagation?.();
      triggerHaptic(20);

      setFavorites((prev) => {
        const exists = prev.includes(label);
        const next = exists
          ? prev.filter((item) => item !== label)
          : [...prev, label];

        if (showToast) {
          showToast(
            exists
              ? 'تمت إزالة الذكر من المفضلة <i class="far fa-heart"></i>'
              : 'تمت إضافة الذكر إلى المفضلة <i class="fas fa-heart text-gold"></i>'
          );
        }

        try {
          localStorage.setItem(TASBIH_FAVORITES_KEY, JSON.stringify(next));
          window.dispatchEvent(
            new CustomEvent('tasbih-favorites-updated', {
              detail: { favorites: next, count: next.length },
            })
          );
        } catch (err) {
          console.error('Failed to save tasbih favorites:', err);
        }

        return next;
      });
    },
    [showToast]
  );

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(TASBIH_FAVORITES_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('tasbih-favorites-updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('tasbih-favorites-updated', handleSync);
    };
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.length,
  };
}
