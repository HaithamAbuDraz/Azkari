import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStats } from '../hooks/useProgressStats';
import ProgressStatsCards from './ProgressStatsCards';
import WeeklyBarChart from './WeeklyBarChart';
import MonthlyCalendarGrid from './MonthlyCalendarGrid';
import CategoryBreakdown from './CategoryBreakdown';
import SpiritualBadges from './SpiritualBadges';

export default function ProgressSection({
  counters,
  onSelectTab,
  onShowToast,
}) {
  const {
    timeframe,
    setTimeframe,
    weeklyStats,
    monthlyStats,
    streaks,
    badges,
    handlePrevPeriod,
    handleNextPeriod,
    handleResetToCurrent,
    isCurrentPeriod,
  } = useProgressStats(counters);

  const activePeriodLabel =
    timeframe === 'week'
      ? weeklyStats.isCurrentWeek
        ? `الأسبوع الحالي (${weeklyStats.weekRangeLabel})`
        : `أسبوع (${weeklyStats.weekRangeLabel})`
      : monthlyStats.isCurrentMonth
        ? `الشهر الحالي (${monthlyStats.monthNameAr})`
        : `شهر (${monthlyStats.monthNameAr})`;

  return (
    <section
      className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8'
      aria-label='سجل التقدم والمواظبة الأسبوعي والشهري'>
      {/* Decorative ambient background blur */}
      <div className='absolute inset-x-8 top-12 h-64 bg-radial from-primary/10 via-gold/5 to-transparent blur-3xl pointer-events-none -z-10' />

      {/* Section Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-border-theme/70'>
        {/* Title & Hadith */}
        <div className='flex flex-col gap-1.5'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold w-fit'>
            <i className='fas fa-chart-line text-xs' />
            <span>لوحة المتابعة والاستمرارية</span>
          </div>

          <h2 className='text-2xl sm:text-3xl font-bold font-tajawal text-text-main flex items-center gap-2.5'>
            <span>سجل التقدم والمواظبة</span>
          </h2>

          <p className='text-xs sm:text-sm text-text-muted font-amiri leading-relaxed'>
            «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»{' '}
            <span className='text-[11px] font-tajawal text-text-muted/80'>
              — صحيح مسلم
            </span>
          </p>
        </div>

        {/* Timeframe Pill Switcher & Navigation Controls */}
        <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
          {/* Week / Month Tab Switcher */}
          <div
            role='tablist'
            aria-label='تحديد نطاق العرض'
            className='p-1 rounded-2xl bg-bg-card border border-border-theme flex items-center gap-1 shadow-2xs'>
            <button
              type='button'
              role='tab'
              aria-selected={timeframe === 'week'}
              onClick={() => setTimeframe('week')}
              className={`relative z-10 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none ${
                timeframe === 'week'
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-main'
              }`}>
              {timeframe === 'week' && (
                <motion.span
                  layoutId='progress-timeframe-active'
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className='absolute inset-0 bg-primary/15 border border-primary/30 rounded-xl shadow-2xs -z-10'
                />
              )}
              <span>أسبوعي</span>
            </button>

            <button
              type='button'
              role='tab'
              aria-selected={timeframe === 'month'}
              onClick={() => setTimeframe('month')}
              className={`relative z-10 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none ${
                timeframe === 'month'
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-main'
              }`}>
              {timeframe === 'month' && (
                <motion.span
                  layoutId='progress-timeframe-active'
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className='absolute inset-0 bg-primary/15 border border-primary/30 rounded-xl shadow-2xs -z-10'
                />
              )}
              <span>شهري</span>
            </button>
          </div>

          {/* Period Navigator: Prev, Label, Next */}
          <div className='flex items-center gap-1.5 p-1 rounded-2xl bg-bg-card/90 border border-border-theme/80 shadow-2xs'>
            <button
              type='button'
              onClick={handlePrevPeriod}
              className='p-2 rounded-xl hover:bg-bg-elevated text-text-muted hover:text-text-main transition text-xs cursor-pointer'
              title='الفترة السابقة'
              aria-label='الفترة السابقة'>
              <i className='fas fa-chevron-right text-xs' />
            </button>

            <span className='px-2 text-xs font-semibold text-text-main font-mono select-none text-center whitespace-nowrap min-w-[140px]'>
              {activePeriodLabel}
            </span>

            <button
              type='button'
              onClick={handleNextPeriod}
              disabled={isCurrentPeriod}
              className={`p-2 rounded-xl transition text-xs select-none ${
                isCurrentPeriod
                  ? 'opacity-30 cursor-not-allowed text-text-muted'
                  : 'hover:bg-bg-elevated text-text-muted hover:text-text-main cursor-pointer'
              }`}
              title='الفترة التالية'
              aria-label='الفترة التالية'>
              <i className='fas fa-chevron-left text-xs' />
            </button>

            {!isCurrentPeriod && (
              <button
                type='button'
                onClick={handleResetToCurrent}
                className='px-2 py-1 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 transition text-[11px] font-semibold cursor-pointer flex items-center gap-1.5'
                title='العودة للفترة الحالية'>
                <i className='fas fa-rotate-left text-[10px]' />
                <span>الحالي</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className='flex flex-col gap-6 sm:gap-8'>
        {/* 1. KPI Stats Cards */}
        <div>
          <ProgressStatsCards
            timeframe={timeframe}
            weeklyStats={weeklyStats}
            monthlyStats={monthlyStats}
            streaks={streaks}
          />
        </div>

        {/* 2. Primary Chart: Weekly Bar Chart OR Monthly Calendar Heatmap */}
        <div>
          <AnimatePresence mode='wait'>
            {timeframe === 'week' ? (
              <motion.div
                key='weekly-view'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>
                <WeeklyBarChart
                  weeklyStats={weeklyStats}
                  onSelectTab={onSelectTab}
                />
              </motion.div>
            ) : (
              <motion.div
                key='monthly-view'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>
                <MonthlyCalendarGrid monthlyStats={monthlyStats} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Category Breakdown & Spiritual Badges */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <CategoryBreakdown
            timeframe={timeframe}
            weeklyStats={weeklyStats}
            monthlyStats={monthlyStats}
            onSelectTab={onSelectTab}
          />

          <SpiritualBadges badges={badges} />
        </div>
      </div>
    </section>
  );
}
