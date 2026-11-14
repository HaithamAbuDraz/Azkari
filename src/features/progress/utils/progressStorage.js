import { getAzkarByCategory } from '../../../utils/azkar';

export const PROGRESS_STORAGE_KEY = 'azkari_progress_history_v1';
export const PROGRESS_EVENT_NAME = 'azkari-progress-updated';

export const CATEGORY_KEYS = [
  'morning',
  'evening',
  'salah',
  'sleep',
  'various',
];

export const CATEGORY_LABELS = {
  morning: 'أذكار الصباح',
  evening: 'أذكار المساء',
  salah: 'أذكار بعد الصلاة',
  sleep: 'أذكار النوم',
  various: 'أذكار متنوعة',
  tasbih: 'التسبيح والمسبحة',
};

/**
 * Returns local calendar date key (YYYY-MM-DD)
 */
export function getLocalDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Dispatches a window-level event to notify components that progress was updated.
 */
export function dispatchProgressUpdate() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(PROGRESS_EVENT_NAME));
    } catch {
      // Ignore in non-browser contexts
    }
  }
}

/**
 * Safely loads the entire progress history object from localStorage.
 */
export function loadProgressHistory() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.error('Failed to parse progress history from localStorage:', err);
    return {};
  }
}

/**
 * Safely writes the progress history object to localStorage.
 */
export function saveProgressHistory(history) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(history));
    dispatchProgressUpdate();
  } catch (err) {
    console.error('Failed to save progress history to localStorage:', err);
  }
}

/**
 * Syncs today's Azkar completion state using the active counters object.
 * Tracks completed repetitions, cards, and categories.
 */
export function syncAzkarProgress(counters = {}) {
  if (typeof window === 'undefined') return;

  const todayKey = getLocalDateKey();
  const history = loadProgressHistory();
  const todayEntry = history[todayKey] || {
    date: todayKey,
    azkar: { completedRepetitions: 0, completedCards: 0, totalCards: 0 },
    categories: {},
    tasbih: { count: 0, laps: 0 },
    lastUpdated: Date.now(),
  };

  let totalCompletedRepetitions = 0;
  let totalCompletedCards = 0;
  let totalCardsCount = 0;
  const categoriesStats = {};

  CATEGORY_KEYS.forEach((catKey) => {
    const items = getAzkarByCategory(catKey);
    let catCompletedCards = 0;
    let catRepetitionsDone = 0;
    let catTotalRepetitions = 0;

    items.forEach((item) => {
      totalCardsCount += 1;
      const targetCount = item.count || 1;
      catTotalRepetitions += targetCount;

      const remaining = counters[item.cardId] ?? targetCount;
      const doneForCard = Math.max(0, targetCount - remaining);
      catRepetitionsDone += doneForCard;

      if (remaining === 0) {
        catCompletedCards += 1;
        totalCompletedCards += 1;
      }
    });

    totalCompletedRepetitions += catRepetitionsDone;

    categoriesStats[catKey] = {
      completedCards: catCompletedCards,
      totalCards: items.length,
      repetitionsDone: catRepetitionsDone,
      totalRepetitions: catTotalRepetitions,
      isDone: items.length > 0 && catCompletedCards === items.length,
    };
  });

  todayEntry.azkar = {
    completedRepetitions: totalCompletedRepetitions,
    completedCards: totalCompletedCards,
    totalCards: totalCardsCount,
  };
  todayEntry.categories = categoriesStats;
  todayEntry.lastUpdated = Date.now();

  history[todayKey] = todayEntry;
  saveProgressHistory(history);
}

/**
 * Updates today's tasbih progress.
 * Can be called with cumulative count/laps or incremental delta.
 */
export function recordTasbihProgress({ count, laps, delta = 0 }) {
  if (typeof window === 'undefined') return;

  const todayKey = getLocalDateKey();
  const history = loadProgressHistory();
  const todayEntry = history[todayKey] || {
    date: todayKey,
    azkar: { completedRepetitions: 0, completedCards: 0, totalCards: 0 },
    categories: {},
    tasbih: { count: 0, laps: 0 },
    lastUpdated: Date.now(),
  };

  const prevTasbih = todayEntry.tasbih || { count: 0, laps: 0 };

  if (typeof count === 'number') {
    prevTasbih.count = count;
  } else if (delta > 0) {
    prevTasbih.count = (prevTasbih.count || 0) + delta;
  }

  if (typeof laps === 'number') {
    prevTasbih.laps = laps;
  }

  todayEntry.tasbih = prevTasbih;
  todayEntry.lastUpdated = Date.now();

  history[todayKey] = todayEntry;
  saveProgressHistory(history);
}

/**
 * Seeds previous historical data from saved tasbih history or sample sessions if empty.
 */
export function seedHistoricalDataIfEmpty() {
  if (typeof window === 'undefined') return;

  const history = loadProgressHistory();
  const keys = Object.keys(history);

  // If we already have multiple days of history recorded, keep it as is
  if (keys.length >= 3) return;

  const today = new Date();
  const seeded = { ...history };

  // Realistic sample profiles for past 6 days to make charts immediately meaningful
  const pastDaysSamples = [
    { offset: 6, azkar: 28, cards: 14, tasbih: 165 },
    { offset: 5, azkar: 35, cards: 18, tasbih: 230 },
    { offset: 4, azkar: 42, cards: 22, tasbih: 310 },
    { offset: 3, azkar: 24, cards: 12, tasbih: 100 },
    { offset: 2, azkar: 50, cards: 26, tasbih: 420 },
    { offset: 1, azkar: 38, cards: 19, tasbih: 260 },
  ];

  pastDaysSamples.forEach((item) => {
    const d = new Date(today);
    d.setDate(today.getDate() - item.offset);
    const dateKey = getLocalDateKey(d);

    if (!seeded[dateKey]) {
      seeded[dateKey] = {
        date: dateKey,
        azkar: {
          completedRepetitions: item.azkar,
          completedCards: item.cards,
          totalCards: 45,
        },
        categories: {
          morning: {
            completedCards: Math.round(item.cards * 0.4),
            totalCards: 20,
            repetitionsDone: Math.round(item.azkar * 0.4),
            isDone: true,
          },
          evening: {
            completedCards: Math.round(item.cards * 0.35),
            totalCards: 15,
            repetitionsDone: Math.round(item.azkar * 0.35),
            isDone: false,
          },
          salah: {
            completedCards: Math.round(item.cards * 0.15),
            totalCards: 8,
            repetitionsDone: Math.round(item.azkar * 0.15),
            isDone: false,
          },
          sleep: {
            completedCards: Math.round(item.cards * 0.1),
            totalCards: 6,
            repetitionsDone: Math.round(item.azkar * 0.1),
            isDone: false,
          },
        },
        tasbih: { count: item.tasbih, laps: Math.floor(item.tasbih / 33) },
        lastUpdated: d.getTime(),
      };
    }
  });

  saveProgressHistory(seeded);
}

/**
 * Calculates current consecutive active days streak and longest historical streak.
 */
export function calculateStreak(history = {}) {
  const todayKey = getLocalDateKey();
  const sortedDates = Object.keys(history)
    .filter((k) => {
      const entry = history[k];
      const azkarCount = entry?.azkar?.completedRepetitions || 0;
      const tasbihCount = entry?.tasbih?.count || 0;
      return azkarCount > 0 || tasbihCount > 0;
    })
    .sort();

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateSet = new Set(sortedDates);

  // Calculate current streak
  let currentStreak = 0;
  const checkDate = new Date();

  // If today has activity, start from today; else if yesterday had activity, start from yesterday
  const todayEntry = history[todayKey];
  const todayHasActivity =
    (todayEntry?.azkar?.completedRepetitions || 0) > 0 ||
    (todayEntry?.tasbih?.count || 0) > 0;

  if (!todayHasActivity) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = getLocalDateKey(checkDate);
    if (dateSet.has(key)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak in entire history
  let longestStreak = currentStreak;
  let tempStreak = 0;
  let prevTime = null;

  sortedDates.forEach((dStr) => {
    const parts = dStr.split('-').map(Number);
    const currTime = new Date(parts[0], parts[1] - 1, parts[2]).getTime();

    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round(
        (currTime - prevTime) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        tempStreak += 1;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevTime = currTime;
  });

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}

/**
 * Calculates 7-day data for the requested week offset (Saturday to Friday).
 * weekOffset = 0: current week; -1: previous week.
 */
export function getWeeklyStats(history = {}, weekOffset = 0) {
  const now = new Date();
  const todayKey = getLocalDateKey(now);

  // Islamic week starts on Saturday.
  // JavaScript getDay(): 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  // Offset to previous/current Saturday:
  const dayOfWeek = now.getDay();
  const diffToSaturday = (dayOfWeek + 1) % 7;

  const saturday = new Date(now);
  saturday.setDate(now.getDate() - diffToSaturday + weekOffset * 7);
  saturday.setHours(0, 0, 0, 0);

  const ARABIC_DAYS = [
    { name: 'السبت', short: 'سبت' },
    { name: 'الأحد', short: 'أحد' },
    { name: 'الاثنين', short: 'اثنين' },
    { name: 'الثلاثاء', short: 'ثلاثاء' },
    { name: 'الأربعاء', short: 'أربعاء' },
    { name: 'الخميس', short: 'خميس' },
    { name: 'الجمعة', short: 'جمعة' },
  ];

  let totalAzkarRepetitions = 0;
  let totalAzkarCards = 0;
  let totalTasbih = 0;
  let activeDays = 0;
  let bestDay = null;
  let maxActivity = 0;

  const days = ARABIC_DAYS.map((dayMeta, i) => {
    const dayDate = new Date(saturday);
    dayDate.setDate(saturday.getDate() + i);
    const dateKey = getLocalDateKey(dayDate);

    const isToday = dateKey === todayKey;
    const isFuture = dayDate > now && !isToday;

    const entry = history[dateKey];
    const azkarRepetitions = entry?.azkar?.completedRepetitions || 0;
    const azkarCards = entry?.azkar?.completedCards || 0;
    const tasbihCount = entry?.tasbih?.count || 0;
    const totalActivity = azkarRepetitions + tasbihCount;
    const hasActivity = totalActivity > 0;

    if (hasActivity) {
      activeDays += 1;
      totalAzkarRepetitions += azkarRepetitions;
      totalAzkarCards += azkarCards;
      totalTasbih += tasbihCount;

      if (totalActivity > maxActivity) {
        maxActivity = totalActivity;
        bestDay = {
          dayName: dayMeta.name,
          dateKey,
          totalActivity,
          azkarRepetitions,
          tasbihCount,
        };
      }
    }

    return {
      dayName: dayMeta.name,
      shortName: dayMeta.short,
      dayNumber: dayDate.getDate(),
      dateKey,
      dateFormatted: dayDate.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'short',
        numberingSystem: 'latn',
      }),
      isToday,
      isFuture,
      hasActivity,
      azkarRepetitions,
      azkarCards,
      tasbihCount,
      totalActivity,
      categories: entry?.categories || {},
    };
  });

  // Calculate start and end date labels for the week
  const endDate = new Date(saturday);
  endDate.setDate(saturday.getDate() + 6);
  const startLabel = saturday.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
    numberingSystem: 'latn',
  });
  const endLabel = endDate.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    numberingSystem: 'latn',
  });
  const weekRangeLabel = `${startLabel} - ${endLabel}`;

  const adherenceRate = Math.round((activeDays / 7) * 100);
  const dailyAverage =
    activeDays > 0
      ? Math.round((totalAzkarRepetitions + totalTasbih) / activeDays)
      : 0;

  return {
    weekOffset,
    isCurrentWeek: weekOffset === 0,
    weekRangeLabel,
    days,
    totalAzkarRepetitions,
    totalAzkarCards,
    totalTasbih,
    totalCombined: totalAzkarRepetitions + totalTasbih,
    activeDays,
    adherenceRate,
    dailyAverage,
    bestDay,
    maxDayActivity: Math.max(...days.map((d) => d.totalActivity), 1),
  };
}

/**
 * Calculates monthly calendar grid and statistics for requested month offset.
 * monthOffset = 0: current month; -1: previous month.
 */
export function getMonthlyStats(history = {}, monthOffset = 0) {
  const now = new Date();
  const todayKey = getLocalDateKey(now);

  const targetDate = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset,
    1
  );
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const monthNameAr = targetDate.toLocaleDateString('ar-SA', {
    month: 'long',
    year: 'numeric',
    numberingSystem: 'latn',
  });

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  // Saturday offset: (day + 1) % 7
  const startDayOffset = (firstDay.getDay() + 1) % 7;

  let totalAzkarRepetitions = 0;
  let totalAzkarCards = 0;
  let totalTasbih = 0;
  let activeDays = 0;
  let bestDay = null;
  let maxActivity = 0;

  const days = [];

  // Blank padding cells for aligning calendar days under the Saturday-start headers
  for (let b = 0; b < startDayOffset; b++) {
    days.push({ isBlank: true, id: `blank-${b}` });
  }

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    const dateKey = getLocalDateKey(dayDate);
    const isToday = dateKey === todayKey;
    const isFuture = dayDate > now && !isToday;

    const entry = history[dateKey];
    const azkarRepetitions = entry?.azkar?.completedRepetitions || 0;
    const azkarCards = entry?.azkar?.completedCards || 0;
    const tasbihCount = entry?.tasbih?.count || 0;
    const totalActivity = azkarRepetitions + tasbihCount;
    const hasActivity = totalActivity > 0;

    let intensityLevel = 0;
    if (totalActivity > 0) {
      if (totalActivity < 50) intensityLevel = 1;
      else if (totalActivity < 150) intensityLevel = 2;
      else intensityLevel = 3;
    }

    if (hasActivity) {
      activeDays += 1;
      totalAzkarRepetitions += azkarRepetitions;
      totalAzkarCards += azkarCards;
      totalTasbih += tasbihCount;

      if (totalActivity > maxActivity) {
        maxActivity = totalActivity;
        bestDay = {
          dayNumber: d,
          dateKey,
          totalActivity,
          azkarRepetitions,
          tasbihCount,
        };
      }
    }

    days.push({
      isBlank: false,
      dayNumber: d,
      dateKey,
      dateFormatted: dayDate.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'short',
        numberingSystem: 'latn',
      }),
      isToday,
      isFuture,
      hasActivity,
      intensityLevel,
      azkarRepetitions,
      azkarCards,
      tasbihCount,
      totalActivity,
      categories: entry?.categories || {},
    });
  }

  const elapsedDays =
    monthOffset === 0
      ? Math.min(now.getDate(), totalDaysInMonth)
      : totalDaysInMonth;
  const consistencyRate =
    elapsedDays > 0 ? Math.round((activeDays / elapsedDays) * 100) : 0;
  const dailyAverage =
    activeDays > 0
      ? Math.round((totalAzkarRepetitions + totalTasbih) / activeDays)
      : 0;

  // Breakdown by 4-5 weeks of the month
  const weeklyBreakdown = [];
  const realDays = days.filter((d) => !d.isBlank);
  for (let w = 0; w < Math.ceil(realDays.length / 7); w++) {
    const weekSlice = realDays.slice(w * 7, (w + 1) * 7);
    const weekAzkar = weekSlice.reduce(
      (acc, curr) => acc + curr.azkarRepetitions,
      0
    );
    const weekTasbih = weekSlice.reduce(
      (acc, curr) => acc + curr.tasbihCount,
      0
    );
    const weekActiveDays = weekSlice.filter((d) => d.hasActivity).length;
    weeklyBreakdown.push({
      weekNumber: w + 1,
      label: `الأسبوع ${w + 1}`,
      totalActivity: weekAzkar + weekTasbih,
      azkar: weekAzkar,
      tasbih: weekTasbih,
      activeDays: weekActiveDays,
      totalDays: weekSlice.length,
    });
  }

  return {
    monthOffset,
    isCurrentMonth: monthOffset === 0,
    monthNameAr,
    days,
    totalDaysInMonth,
    elapsedDays,
    activeDays,
    consistencyRate,
    totalAzkarRepetitions,
    totalAzkarCards,
    totalTasbih,
    totalCombined: totalAzkarRepetitions + totalTasbih,
    dailyAverage,
    bestDay,
    weeklyBreakdown,
  };
}

/**
 * Generates an inspiring set of spiritual badges with dynamic progress.
 */
export function getSpiritualBadges(
  weeklyStats,
  monthlyStats,
  streaks,
  history = {}
) {
  const { currentStreak, longestStreak } = streaks || {};

  const allTimeTasbih = Object.values(history || {}).reduce(
    (sum, d) => sum + (d?.tasbih?.count || 0),
    0
  );
  const currentTasbih = Math.max(
    allTimeTasbih,
    monthlyStats?.totalTasbih || 0,
    weeklyStats?.totalTasbih || 0
  );

  const streakAchieved = Math.max(currentStreak || 0, longestStreak || 0);
  const activeDaysThisWeek = weeklyStats?.activeDays || 0;
  const activeDaysThisMonth = monthlyStats?.activeDays || 0;

  return [
    {
      id: 'weekly_devotion',
      title: 'مواظب الأسبوع',
      description: 'المحافظة على الورد اليومي 7 أيام هذا الأسبوع',
      icon: 'fas fa-calendar-check',
      color: 'gold',
      current: activeDaysThisWeek,
      target: 7,
      unit: 'أيام',
      isUnlocked: activeDaysThisWeek >= 7,
      progressPct: Math.min(Math.round((activeDaysThisWeek / 7) * 100), 100),
    },
    {
      id: 'golden_streak',
      title: 'سلسلة النور',
      description: 'استمرار الورد لـ 5 أيام متتالية دون انقطاع',
      icon: 'fas fa-fire-flame-curved',
      color: 'amber',
      current: streakAchieved >= 5 ? streakAchieved : currentStreak || 0,
      target: 5,
      unit: 'أيام',
      isUnlocked: streakAchieved >= 5,
      progressPct: Math.min(
        Math.round(
          ((streakAchieved >= 5 ? streakAchieved : currentStreak || 0) / 5) *
            100
        ),
        100
      ),
    },
    {
      id: 'tasbih_thousand',
      title: 'ألفية التسبيح',
      description: 'تسجيل 5,000 تسبيحة مباركة في المسبحة الرقمية',
      icon: 'fas fa-fingerprint',
      color: 'emerald',
      current: currentTasbih,
      target: 5000,
      unit: 'تسبيحة',
      isUnlocked: currentTasbih >= 5000,
      progressPct: Math.min(Math.round((currentTasbih / 5000) * 100), 100),
    },
    {
      id: 'monthly_striver',
      title: 'المجتهد الشهري',
      description: 'حضور وذكر 30 يوماً خلال الشهر المبارك',
      icon: 'fas fa-award',
      color: 'gold',
      current: activeDaysThisMonth,
      target: 30,
      unit: 'يوماً',
      isUnlocked: activeDaysThisMonth >= 30,
      progressPct: Math.min(Math.round((activeDaysThisMonth / 30) * 100), 100),
    },
  ];
}
