import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PROGRESS_EVENT_NAME,
  loadProgressHistory,
  seedHistoricalDataIfEmpty,
  syncAzkarProgress,
  calculateStreak,
  getWeeklyStats,
  getMonthlyStats,
  getSpiritualBadges,
  saveProgressHistory,
} from '../utils/progressStorage';

export function useProgressStats(counters) {
  const [timeframe, setTimeframe] = useState('week'); // 'week' | 'month'
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month

  // Load history synchronously from localStorage on initial render
  const [history, setHistory] = useState(() => {
    seedHistoricalDataIfEmpty();
    return loadProgressHistory();
  });

  // Sync today's azkar progress whenever counters prop changes
  useEffect(() => {
    if (counters && Object.keys(counters).length > 0) {
      syncAzkarProgress(counters);
      setHistory(loadProgressHistory());
    }
  }, [counters]);

  // Listen for progress updates triggered across the application
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = () => {
      setHistory(loadProgressHistory());
    };

    window.addEventListener(PROGRESS_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Calculated Weekly Stats
  const weeklyStats = useMemo(() => {
    return getWeeklyStats(history, weekOffset);
  }, [history, weekOffset]);

  // Calculated Monthly Stats
  const monthlyStats = useMemo(() => {
    return getMonthlyStats(history, monthOffset);
  }, [history, monthOffset]);

  // Calculated Streak Data
  const streaks = useMemo(() => {
    return calculateStreak(history);
  }, [history]);

  // Calculated Spiritual Badges
  const badges = useMemo(() => {
    return getSpiritualBadges(weeklyStats, monthlyStats, streaks, history);
  }, [weeklyStats, monthlyStats, streaks, history]);

  // Navigation handlers
  const handlePrevPeriod = useCallback(() => {
    if (timeframe === 'week') {
      setWeekOffset((prev) => prev - 1);
    } else {
      setMonthOffset((prev) => prev - 1);
    }
  }, [timeframe]);

  const handleNextPeriod = useCallback(() => {
    if (timeframe === 'week') {
      setWeekOffset((prev) => Math.min(0, prev + 1));
    } else {
      setMonthOffset((prev) => Math.min(0, prev + 1));
    }
  }, [timeframe]);

  const handleResetToCurrent = useCallback(() => {
    setWeekOffset(0);
    setMonthOffset(0);
  }, []);

  // Clean reset of all history if requested by user
  const handleClearHistory = useCallback(() => {
    if (typeof window === 'undefined') return;
    saveProgressHistory({});
    setHistory({});
  }, []);

  return {
    timeframe,
    setTimeframe,
    weekOffset,
    monthOffset,
    weeklyStats,
    monthlyStats,
    streaks,
    badges,
    handlePrevPeriod,
    handleNextPeriod,
    handleResetToCurrent,
    handleClearHistory,
    isCurrentPeriod:
      timeframe === 'week' ? weekOffset === 0 : monthOffset === 0,
  };
}
