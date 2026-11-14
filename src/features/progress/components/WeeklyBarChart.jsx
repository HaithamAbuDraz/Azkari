import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { EASE_SPIRITUAL } from '../../../constants/motion';

export default function WeeklyBarChart({ weeklyStats, onSelectTab }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const todayIdx = weeklyStats.days.findIndex((d) => d.isToday);
    return todayIdx >= 0 ? todayIdx : 0;
  });

  const days = weeklyStats.days || [];
  const maxActivity = Math.max(weeklyStats.maxDayActivity || 100, 60);
  const selectedDay = days[selectedDayIndex] || days[0];

  return (
    <div className='flex flex-col gap-4 p-4 sm:p-6 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme/80 shadow-xs'>
      {/* Chart Header & Legend */}
      <div className='flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-theme/60'>
        <div>
          <h4 className='text-sm sm:text-base font-bold text-text-main flex items-center gap-2'>
            <i className='fas fa-chart-line text-gold text-xs' />
            <span>الرسم البياني لأيام الأسبوع (السبت - الجمعة)</span>
          </h4>
          <span className='text-[11px] sm:text-xs text-text-muted'>
            اضغط على أي يوم لعرض تفاصيل الورد والأذكار
          </span>
        </div>

        {/* Legend */}
        <div className='flex items-center gap-3 text-xs'>
          <div className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-sm bg-primary' />
            <span className='text-text-muted text-[11px]'>أذكار</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-sm bg-gold' />
            <span className='text-text-muted text-[11px]'>تسبيح</span>
          </div>
        </div>
      </div>

      {/* Bars Container */}
      <div className='relative pt-4 pb-2 px-1'>
        <div className='grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-48 sm:h-56'>
          {days.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            const azkarHeightPct = Math.min(
              (day.azkarRepetitions / maxActivity) * 100,
              100
            );
            const tasbihHeightPct = Math.min(
              (day.tasbihCount / maxActivity) * 100,
              100
            );
            const totalHeightPct = Math.min(
              azkarHeightPct + tasbihHeightPct,
              100
            );

            return (
              <div
                key={day.dateKey}
                onClick={() => setSelectedDayIndex(idx)}
                className='group flex flex-col items-center h-full justify-end cursor-pointer focus:outline-none'>
                {/* Bar Column */}
                <div className='relative w-full max-w-[42px] sm:max-w-[52px] h-full flex flex-col justify-end items-center'>
                  {/* Subtle track background */}
                  <div
                    className={`absolute inset-x-0 bottom-0 top-0 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-gold/10 border border-gold/40'
                        : 'bg-bg-elevated/40 hover:bg-bg-elevated/70 border border-transparent'
                    }`}
                  />

                  {/* Day activity value badge on hover or selected */}
                  {day.hasActivity && (
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isSelected ? 1 : 0.7,
                        y: isSelected ? -4 : 0,
                      }}
                      className={`absolute -top-7 text-[10px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-primary/20 text-primary border border-primary/35 shadow-xs'
                          : 'text-text-muted group-hover:text-text-main'
                      }`}>
                      {day.totalActivity}
                    </motion.span>
                  )}

                  {/* Stacked Fill Bar */}
                  <div
                    className='relative w-full px-1.5 sm:px-2 z-10 flex flex-col justify-end'
                    style={{
                      height: `${Math.max(totalHeightPct, day.hasActivity ? 12 : 4)}%`,
                    }}>
                    <div className='w-full rounded-t-lg sm:rounded-t-xl overflow-hidden flex flex-col-reverse shadow-2xs transition-transform duration-200 group-hover:scale-y-[1.02]'>
                      {/* Azkar fill (Emerald) */}
                      {day.azkarRepetitions > 0 && (
                        <div
                          style={{
                            height:
                              totalHeightPct > 0
                                ? `${(azkarHeightPct / totalHeightPct) * 100}%`
                                : '0%',
                          }}
                          className='w-full bg-gradient-to-t from-primary/90 to-primary min-h-[6px]'
                        />
                      )}
                      {/* Tasbih fill (Gold) */}
                      {day.tasbihCount > 0 && (
                        <div
                          style={{
                            height:
                              totalHeightPct > 0
                                ? `${(tasbihHeightPct / totalHeightPct) * 100}%`
                                : '0%',
                          }}
                          className='w-full bg-gradient-to-t from-gold/80 to-gold min-h-[6px]'
                        />
                      )}
                      {/* Fallback empty indicator if day has no activity */}
                      {!day.hasActivity && (
                        <div className='w-full h-1 bg-border-theme/60 rounded-full' />
                      )}
                    </div>
                  </div>
                </div>

                {/* Day Meta Labels below bar */}
                <div className='mt-2 sm:mt-3 flex flex-col items-center gap-0.5 select-none'>
                  <span
                    className={`text-[11px] sm:text-xs font-medium transition-colors ${
                      isSelected
                        ? 'font-bold text-gold'
                        : day.isToday
                          ? 'text-primary font-bold'
                          : 'text-text-muted group-hover:text-text-main'
                    }`}>
                    {day.dayName}
                  </span>
                  <div className='flex items-center gap-1'>
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono ${
                        day.isToday
                          ? 'text-primary font-bold'
                          : 'text-text-muted'
                      }`}>
                      {day.dayNumber}
                    </span>
                    {day.hasActivity && (
                      <span className='w-1 h-1 rounded-full bg-gold' />
                    )}
                  </div>

                  {day.isToday && (
                    <span className='text-[9px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold border border-primary/30 mt-0.5'>
                      اليوم
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Breakdown Banner */}
      <AnimatePresence mode='wait'>
        {selectedDay && (
          <motion.div
            key={selectedDay.dateKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_SPIRITUAL }}
            className='p-3.5 sm:p-4 rounded-2xl bg-bg-elevated/70 border border-border-theme/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-bold font-mono text-sm shadow-2xs'>
                {selectedDay.dayNumber}
              </div>
              <div className='flex flex-col text-right'>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-text-main text-sm'>
                    {selectedDay.dayName} ({selectedDay.dateFormatted})
                  </span>
                  {selectedDay.isToday && (
                    <span className='px-2 py-0.5 rounded-md bg-primary/20 text-primary font-bold text-[10px]'>
                      اليوم الحاضر
                    </span>
                  )}
                </div>
                <span className='text-[11px] text-text-muted'>
                  {selectedDay.hasActivity
                    ? `إجمالي النشاط: ${selectedDay.totalActivity} (بين أذكار وتسبيح)`
                    : selectedDay.isFuture
                      ? 'يوم قادم بإذن الله تعالى'
                      : 'لم يُسجل نشاط في هذا اليوم'}
                </span>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
              <div className='px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary font-medium flex items-center gap-1.5'>
                <i className='fas fa-quran text-xs text-primary' />
                <span>الأذكار:</span>
                <span className='font-mono font-bold'>
                  {selectedDay.azkarRepetitions}
                </span>
                <span className='text-[10px] opacity-75'>
                  ({selectedDay.azkarCards} بطاقة)
                </span>
              </div>

              <div className='px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/25 text-gold font-medium flex items-center gap-1.5'>
                <Fingerprint className='w-3.5 h-3.5 text-gold' />
                <span>التسبيح:</span>
                <span className='font-mono font-bold'>
                  {selectedDay.tasbihCount}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
