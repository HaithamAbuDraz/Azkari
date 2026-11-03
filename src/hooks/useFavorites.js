import { useState, useEffect, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

const STORAGE_KEY = 'azkar-favorites';

export function useFavorites(showToast) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  const toggleFavorite = useCallback(
    (cardId) => {
      triggerHaptic(20);
      setFavorites((prev) => {
        const exists = prev.includes(cardId);
        if (exists) {
          if (showToast) {
            showToast('تمت إزالة الذكر من المفضلة <i class="far fa-heart"></i>');
          }
          return prev.filter((id) => id !== cardId);
        } else {
          if (showToast) {
            showToast('تمت إضافة الذكر إلى المفضلة <i class="fas fa-heart text-rose-400"></i>');
          }
          return [...prev, cardId];
        }
      });
    },
    [showToast]
  );

  const isFavorite = useCallback(
    (cardId) => favorites.includes(cardId),
    [favorites]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,
  };
}
