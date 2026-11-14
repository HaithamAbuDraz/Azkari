import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { getDefaultTab, PANELS } from '../../../constants/tabs';
import { INITIAL_DHIKRS, MILESTONES } from '../../../constants/tasbih';
import { getAzkarByCategory } from '../../../utils/azkar';
import { triggerHaptic } from '../../../utils/haptics';
import { playMilestoneChime, playTasbihClick } from '../../../utils/sound';
import { cn } from '../../../utils/cn';
import { RollingNumber } from '../../../components/common';
import { useMilestone } from '../../../hooks';
import {
  containerVariants,
  itemVariants,
  cardHoverSpring,
  PORTAL_ICONS,
  DAILY_AZKAR_KEYS,
} from '../constants/homeData';
import { useRipples } from '../hooks/useRipples';
import { fireSpiritualConfetti } from '../utils/celebrate';
import { recordTasbihProgress } from '../../progress';

const TRACKER_RADIUS = 44;
const TRACKER_CIRCUMFERENCE = 2 * Math.PI * TRACKER_RADIUS;
const MINI_RING_RADIUS = 40;
const MINI_RING_CIRCUMFERENCE = 2 * Math.PI * MINI_RING_RADIUS;

function readIntStorage(key, fallback = 0) {
  if (typeof window === 'undefined') return fallback;
  try {
    const parsed = parseInt(localStorage.getItem(key), 10);
    return !Number.isNaN(parsed) && parsed >= 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readBoolStorage(key, fallback = true) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw !== 'false';
  } catch {
    return fallback;
  }
}

/**
 * Interactive Daily Azkar Radial Tracker & Live Synchronized Mini-Tasbih Widget.
 */
export default function QuickTrackerWidget({
  counters,
  onSelectTab,
  onShowToast,
}) {
  const recommendedTab = getDefaultTab();
  const recommendedMeta = PANELS[recommendedTab] || PANELS.morning;

  // Daily Azkar statistics aggregated per category and overall
  const dailyStats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    const categories = DAILY_AZKAR_KEYS.map((key) => {
      const items = getAzkarByCategory(key);
      const done = items.filter((item) => counters[item.cardId] === 0).length;
      const total = items.length;
      totalItems += total;
      completedItems += done;
      return {
        key,
        title: PANELS[key]?.title || key,
        shortTitle:
          key === 'morning'
            ? 'الصباح'
            : key === 'evening'
              ? 'المساء'
              : key === 'salah'
                ? 'الصلاة'
                : 'النوم',
        done,
        total,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });

    const percent =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return { totalItems, completedItems, percent, categories };
  }, [counters]);

  const trackerOffset =
    TRACKER_CIRCUMFERENCE - (dailyStats.percent / 100) * TRACKER_CIRCUMFERENCE;

  // Live synced Mini-Tasbih state
  const [dhikrs] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_DHIKRS;
    try {
      const saved = localStorage.getItem('azkari-custom-dhikrs');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : INITIAL_DHIKRS;
    } catch {
      return INITIAL_DHIKRS;
    }
  });

  const [activeIdx, setActiveIdx] = useState(() =>
    readIntStorage('tasbih-active-idx', 0)
  );
  const [count, setCount] = useState(() =>
    readIntStorage('tasbih-current-count', 0)
  );
  const [laps, setLaps] = useState(() =>
    readIntStorage('tasbih-current-laps', 0)
  );
  const [isBumping, setIsBumping] = useState(false);
  const [showResetHint, setShowResetHint] = useState(false);
  const [resetFlashKey, setResetFlashKey] = useState(0);
  const resetHintTimerRef = useRef(null);
  const tapAreaRef = useRef(null);
  const { ripples, spawnRipple } = useRipples(tapAreaRef);

  const safeIdx = activeIdx < dhikrs.length ? activeIdx : 0;
  const currentDhikr = dhikrs[safeIdx] || INITIAL_DHIKRS[0];
  const target = currentDhikr.target || 33;
  const miniProgress = target > 0 ? Math.min(count / target, 1) : 0;
  const miniProgressPct = Math.round(miniProgress * 100);
  const miniOffset = MINI_RING_CIRCUMFERENCE * (1 - miniProgress);
  const isCycleDone = count === target && target > 0;
  const milestoneKey = useMilestone(miniProgressPct);

  useEffect(() => {
    return () => {
      if (resetHintTimerRef.current) {
        clearTimeout(resetHintTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tasbih-active-idx', String(safeIdx));
      localStorage.setItem('tasbih-current-count', String(count));
      localStorage.setItem('tasbih-current-laps', String(laps));
    } catch {
      // Ignore storage quota errors
    }
  }, [safeIdx, count, laps]);

  const handleTasbihTap = (e) => {
    spawnRipple(e);
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 160);

    // Highlight reset icon briefly after each tap (mirrors AzkarCard)
    setShowResetHint(true);
    if (resetHintTimerRef.current) {
      clearTimeout(resetHintTimerRef.current);
    }
    resetHintTimerRef.current = setTimeout(() => setShowResetHint(false), 2000);

    const soundOn = readBoolStorage('tasbih-sound', true);
    const hapticOn = readBoolStorage('tasbih-haptic', true);

    if (soundOn) playTasbihClick();
    if (hapticOn) triggerHaptic(18);

    let nextCount = count + 1;
    let nextLaps = laps;

    if (nextCount > target) {
      nextCount = 1;
      nextLaps = laps + 1;
      setLaps(nextLaps);
    }
    setCount(nextCount);
    recordTasbihProgress({ delta: 1 });

    const totalCompleted = nextLaps * target + nextCount;
    if (nextCount === target || MILESTONES.includes(totalCompleted)) {
      if (soundOn) playMilestoneChime();
      if (hapticOn) triggerHaptic([25, 45, 25]);
      fireSpiritualConfetti({ y: 0.65 });
      if (nextCount === target && onShowToast) {
        onShowToast(
          `تقبّل الله! أتممت ${target} من «${currentDhikr.label}» <i class="fas fa-star text-gold"></i>`
        );
      }
    }
  };

  const handleCycleDhikr = (dir) => {
    const next = (safeIdx + dir + dhikrs.length) % dhikrs.length;
    setActiveIdx(next);
    setCount(0);
    setLaps(0);
    setShowResetHint(false);
    triggerHaptic(10);
  };

  const handleResetMini = () => {
    setCount(0);
    setLaps(0);
    setResetFlashKey((k) => k + 1);
    setShowResetHint(false);
    triggerHaptic(12);
  };

  return (
    <section
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8'
      aria-label='متابعة الورد اليومي والمسبحة السريعة'>
      <motion.div
        className='grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.15 }}>
        {/* 1. Daily Azkar Radial SVG Tracker */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={cardHoverSpring}
          style={{ boxShadow: 'var(--glass-highlight)' }}
          className='lg:col-span-6 relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] bg-[var(--glass-card)] backdrop-blur-md border border-[var(--border)] hover:border-[var(--gold)]/55 p-6 sm:p-7 shadow-lg transition-colors duration-300 flex flex-col justify-between gap-6'>
          <span
            className='absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/45 to-transparent'
            aria-hidden='true'
          />

          <div className='flex flex-col sm:flex-row items-center gap-6'>
            {/* Circular SVG Radial Progress Indicator */}
            <div className='relative w-28 h-28 shrink-0 flex items-center justify-center'>
              <svg
                className='w-28 h-28 -rotate-90 drop-shadow-xs'
                viewBox='0 0 112 112'
                aria-hidden='true'>
                <defs>
                  <linearGradient
                    id='dailyTrackerGradient'
                    x1='0%'
                    y1='0%'
                    x2='100%'
                    y2='100%'>
                    <stop
                      offset='0%'
                      stopColor='var(--gold)'
                    />
                    <stop
                      offset='100%'
                      stopColor='var(--primary)'
                    />
                  </linearGradient>
                </defs>
                <circle
                  cx='56'
                  cy='56'
                  r={TRACKER_RADIUS}
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='7'
                  className='text-[var(--bg-elevated)]'
                />
                <motion.circle
                  cx='56'
                  cy='56'
                  r={TRACKER_RADIUS}
                  fill='none'
                  stroke='url(#dailyTrackerGradient)'
                  strokeWidth='7'
                  strokeLinecap='round'
                  strokeDasharray={TRACKER_CIRCUMFERENCE}
                  initial={{ strokeDashoffset: TRACKER_CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: trackerOffset }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </svg>

              <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
                <span className='font-ibm text-xl font-bold text-[var(--text-arabic)] leading-none'>
                  {dailyStats.percent}%
                </span>
                <span className='text-[10px] font-medium text-[var(--text-muted)] mt-1'>
                  مكتمل
                </span>
              </div>
            </div>

            {/* Text & Summary Stats */}
            <div className='flex-1 text-center sm:text-right min-w-0'>
              <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-light)] border border-[var(--primary)]/25 text-[var(--primary)] text-[11px] font-bold mb-2'>
                <CheckCircle2 className='w-3.5 h-3.5' />
                <span>مؤشر وِردِكَ اليومي</span>
              </span>
              <h3 className='font-amiri text-2xl sm:text-[1.65rem] font-bold text-[var(--text-arabic)] leading-snug mb-1'>
                {dailyStats.completedItems} من {dailyStats.totalItems} ذكراً
              </h3>
              <p className='text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed'>
                تتبع إنجازك التراكمي لأذكار الصباح والمساء وبعد الصلاة والنوم في
                كل وقت.
              </p>
            </div>
          </div>

          {/* 4 Category Quick Progress Chips */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
            {dailyStats.categories.map((cat) => {
              const Icon = PORTAL_ICONS[cat.key] || Sparkles;
              const isDone = cat.done === cat.total && cat.total > 0;
              return (
                <button
                  key={cat.key}
                  type='button'
                  onClick={() => onSelectTab(cat.key)}
                  className={cn(
                    'group flex flex-col gap-1 p-2.5 rounded-2xl border text-right transition-all cursor-pointer active:scale-95',
                    isDone
                      ? 'bg-[var(--gold)]/15 border-[var(--gold)]/45 text-[var(--gold-text)]'
                      : 'bg-[var(--glass-elevated)] hover:bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--gold)]/45 text-[var(--text-main)]'
                  )}>
                  <div className='flex items-center justify-between gap-1'>
                    <Icon className='w-3.5 h-3.5 text-[var(--gold-text)] shrink-0' />
                    <span className='font-ibm text-[10px] font-bold text-[var(--text-muted)]'>
                      {cat.done}/{cat.total}
                    </span>
                  </div>
                  <span className='text-xs font-semibold truncate'>
                    {cat.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Jump CTA */}
          <div className='pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3 flex-wrap'>
            <button
              type='button'
              onClick={() => onSelectTab('progress')}
              className='group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--gold-text)] transition-colors cursor-pointer'>
              <i className='fas fa-chart-line text-xs text-[var(--gold-text)]' />
              <span>سجل التقدم الأسبوعي والشهري</span>
            </button>
            <button
              type='button'
              onClick={() => onSelectTab(recommendedTab)}
              className='group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold-text)] hover:text-[var(--primary)] transition-colors cursor-pointer'>
              <span>استكمل الورد</span>
              <ArrowLeft className='w-3.5 h-3.5 transition-transform group-hover:-translate-x-1' />
            </button>
          </div>
        </motion.div>

        {/* 2. Interactive Mini-Tasbih Counter Widget (Full-Card Clickable) */}
        <motion.div
          ref={tapAreaRef}
          variants={itemVariants}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          transition={cardHoverSpring}
          role='button'
          tabIndex={0}
          onClick={(e) => {
            if (e.target.closest('button, a, input')) return;
            handleTasbihTap(e);
          }}
          onKeyDown={(e) => {
            if (e.target.closest('button, a, input')) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTasbihTap(null);
            }
          }}
          aria-label={`تسبيح ${currentDhikr.label}، العدد الحالي ${count} من ${target}`}
          style={{ boxShadow: 'var(--glass-highlight)' }}
          className={cn(
            'lg:col-span-6 relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] bg-[var(--glass-card)] backdrop-blur-md border p-6 sm:p-7 shadow-lg transition-colors duration-300 flex flex-col justify-between gap-5 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
            isCycleDone
              ? 'card-completion-shimmer card-completion-glow border-[var(--gold)]/60'
              : 'border-[var(--border)] hover:border-[var(--gold)]/60 active:border-[var(--gold)]'
          )}>
          {/* Radial Card Ripples */}
          {ripples.map((r) => (
            <span
              key={r.id}
              className='ripple z-0'
              style={r.style}
            />
          ))}

          <span
            className='absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/45 to-transparent pointer-events-none'
            aria-hidden='true'
          />

          {/* Top Bar: Badge + Dhikr Switcher */}
          <div className='relative z-10 flex items-center justify-between gap-3 flex-wrap'>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold-light)] border border-[var(--border-accent)] text-[var(--gold-text)] text-[11px] font-bold'>
              <Fingerprint className='w-3.5 h-3.5' />
              <span>المسبحة السريعة</span>
            </span>

            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCycleDhikr(-1);
                }}
                aria-label='الذكر السابق في المسبحة'
                className='w-8 h-8 rounded-xl bg-[var(--bg-elevated)]/85 hover:bg-[var(--gold)]/15 border border-[var(--border)] hover:border-[var(--gold)]/45 flex items-center justify-center text-[var(--text-main)] hover:text-[var(--gold)] transition cursor-pointer active:scale-95'>
                <ChevronRight className='w-4 h-4' />
              </button>
              <span className='px-2.5 py-1 rounded-xl bg-[var(--bg-elevated)]/65 border border-[var(--border)] text-[11px] font-ibm text-[var(--text-muted)]'>
                {safeIdx + 1} / {dhikrs.length}
              </span>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCycleDhikr(1);
                }}
                aria-label='الذكر التالي في المسبحة'
                className='w-8 h-8 rounded-xl bg-[var(--bg-elevated)]/85 hover:bg-[var(--gold)]/15 border border-[var(--border)] hover:border-[var(--gold)]/45 flex items-center justify-center text-[var(--text-main)] hover:text-[var(--gold)] transition cursor-pointer active:scale-95'>
                <ChevronLeft className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Interactive Tasbih Core: Dhikr Title + Tactile Ring Indicator */}
          <div className='relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5'>
            <div className='flex-1 text-center sm:text-right min-w-0'>
              <AnimatePresence mode='wait'>
                <motion.p
                  key={currentDhikr.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className='font-amiri text-xl sm:text-2xl font-bold text-[var(--text-arabic)] leading-relaxed mb-1.5'>
                  {currentDhikr.arabic}
                </motion.p>
              </AnimatePresence>
              <p className='text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2'>
                {currentDhikr.virtue}
              </p>
            </div>

            {/* Interactive Bump + Slot-Machine Rolling Number Counter Ring */}
            <motion.div
              animate={isBumping ? { scale: [1, 1.07, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              className='relative overflow-hidden shrink-0 w-28 h-28 rounded-full bg-[var(--bg-elevated)]/90 border border-[var(--border-accent)] shadow-lg tasbih-glow-aura flex items-center justify-center'>
              {milestoneKey > 0 && (
                <span
                  key={milestoneKey}
                  className='absolute inset-0 rounded-full milestone-pulse pointer-events-none'
                  aria-hidden='true'
                />
              )}
              {/* Circular Progress Track */}
              <svg
                className='absolute inset-0 w-full h-full -rotate-90 pointer-events-none'
                viewBox='0 0 100 100'
                aria-hidden='true'>
                <circle
                  cx='50'
                  cy='50'
                  r={MINI_RING_RADIUS}
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='4.5'
                  className='text-[var(--border)]'
                />
                <motion.circle
                  cx='50'
                  cy='50'
                  r={MINI_RING_RADIUS}
                  fill='none'
                  stroke='var(--gold)'
                  strokeWidth='4.5'
                  strokeLinecap='round'
                  strokeDasharray={MINI_RING_CIRCUMFERENCE}
                  animate={{ strokeDashoffset: miniOffset }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              </svg>

              {/* Rolling Number Display */}
              <div className='relative z-10 flex flex-col items-center justify-center pointer-events-none'>
                <div className='h-8 flex items-center justify-center'>
                  <RollingNumber
                    value={count}
                    ariaLabel={`العدد الحالي ${count} من ${target}`}
                    className='font-ibm text-2xl font-bold text-[var(--text-arabic)] leading-none'
                  />
                </div>
                <span className='font-ibm text-[10px] font-bold text-[var(--gold-text)] mt-0.5'>
                  من {target}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Footer Controls */}
          <div className='relative z-10 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3 flex-wrap'>
            <div className='flex items-center gap-2'>
              <span className='px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] font-ibm text-[11px] font-semibold text-[var(--text-muted)]'>
                الدورات:{' '}
                <strong className='text-[var(--gold-text)]'>{laps}</strong>
              </span>
              {(count > 0 || laps > 0) && (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetMini();
                  }}
                  aria-label='تصفير العداد السريع'
                  title='تصفير العداد'
                  className={cn(
                    'w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer active:scale-95',
                    showResetHint
                      ? 'text-[var(--gold-text)] bg-[var(--gold)]/15 border-[var(--gold)]/40'
                      : 'bg-[var(--bg-elevated)] hover:bg-[var(--gold)]/15 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold-text)]'
                  )}>
                  <RotateCcw
                    key={resetFlashKey}
                    className={cn(
                      'w-3.5 h-3.5',
                      resetFlashKey > 0 && showResetHint && 'reset-flash'
                    )}
                  />
                </button>
              )}
              {isCycleDone && (
                <span className='completion-badge-enter inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] font-bold text-[11px] border border-[var(--primary)]/30'>
                  <CheckCircle2 className='w-3.5 h-3.5 text-[var(--gold-text)]' />
                  <span>اكتملت الدورة</span>
                </span>
              )}
            </div>

            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onSelectTab('tasbih');
              }}
              className='group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold-text)] hover:text-[var(--primary)] transition-colors cursor-pointer'>
              <span>المسبحة الكاملة</span>
              <ArrowLeft className='w-3.5 h-3.5 transition-transform group-hover:-translate-x-1' />
            </button>
          </div>

          {/* Hairline Bottom Progress Bar with Milestone Pulse (mirrors AzkarCard) */}
          {count > 0 && !isCycleDone && (
            <div className='absolute bottom-0 inset-x-0 h-[3px] bg-[var(--border)]/40 overflow-hidden pointer-events-none'>
              <div
                key={`bar-${milestoneKey}`}
                className={cn(
                  'h-full bg-gradient-to-l from-[var(--gold)] to-[var(--primary)] transition-all duration-300 ease-out',
                  milestoneKey > 0 && 'milestone-pulse'
                )}
                style={{ width: `${miniProgressPct}%` }}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
