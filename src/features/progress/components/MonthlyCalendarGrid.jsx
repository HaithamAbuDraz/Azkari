import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { EASE_SPIRITUAL } from '../../../constants/motion';

export default function MonthlyCalendarGrid({ monthlyStats }) {
  const [selectedDayNumber, setSelectedDayNumber] = useState(() => {
    const today = monthlyStats.days.find((d) => d.isToday && !d.isBlank);
    return today ? today.dayNumber : 1;
  });

  const days = monthlyStats.days || [];
  const selectedDay = days.find(
    (d) => !d.isBlank && d.dayNumber === selectedDayNumber
  );

  const WEEK_HEADERS = [
    'السبت',
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
  ];

  return (
    <div className='flex flex-col gap-4 p-4 sm:p-6 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme/80 shadow-xs'>
      {/* Header with Monthly Title & Intensity Legend */}
      <div className='flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-theme/60'>
        <div>
          <h4 className='text-sm sm:text-base font-bold text-text-main flex items-center gap-2'>
            <i className='fas fa-calendar-days text-gold text-xs' />
            <span>
              خريطة المواظبة والتقويم الشهري ({monthlyStats.monthNameAr})
            </span>
          </h4>
          <span className='text-[11px] sm:text-xs text-text-muted'>
            توضح كثافة الألوان مدى ثباتك وإنجازك للأوراد والأذكار في كل يوم
          </span>
        </div>

        {/* Intensity Legend */}
        <div className='flex items-center gap-2 text-xs'>
          <span className='text-[10px] text-text-muted'>أقل</span>
          <span
            className='w-3 h-3 rounded-md bg-bg-elevated/80 border border-border-theme/50'
            title='لا يوجد نشاط'
          />
          <span
            className='w-3 h-3 rounded-md bg-primary/30 border border-primary/40'
            title='نشاط خفيف'
          />
          <span
            className='w-3 h-3 rounded-md bg-primary/70 border border-primary/80'
            title='نشاط متوسط'
          />
          <span
            className='w-3 h-3 rounded-md bg-gold border border-gold-dim shadow-2xs'
            title='إنجاز مبارك كامل'
          />
          <span className='text-[10px] text-text-muted'>أكثر</span>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className='grid grid-cols-7 gap-1 sm:gap-2 text-center'>
        {WEEK_HEADERS.map((name) => (
          <div
            key={name}
            className='py-1 text-[11px] sm:text-xs font-semibold text-text-muted select-none'>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Heatmap Grid */}
      <div className='grid grid-cols-7 gap-1 sm:gap-2'>
        {days.map((day, idx) => {
          if (day.isBlank) {
            return (
              <div
                key={day.id || `blank-${idx}`}
                className='h-10 sm:h-14 rounded-xl bg-transparent select-none pointer-events-none'
              />
            );
          }

          const isSelected = day.dayNumber === selectedDayNumber;

          // Compute cell style by intensity
          let cellBg =
            'bg-bg-elevated/40 border-border-theme/40 text-text-muted hover:bg-bg-elevated/80';
          if (day.intensityLevel === 1) {
            cellBg =
              'bg-primary/20 border-primary/35 text-text-main hover:bg-primary/30';
          } else if (day.intensityLevel === 2) {
            cellBg =
              'bg-primary/40 border-primary/60 text-text-main hover:bg-primary/50 shadow-2xs';
          } else if (day.intensityLevel === 3) {
            cellBg =
              'bg-gradient-to-br from-gold/30 to-gold/15 border-gold/60 text-gold font-bold shadow-2xs hover:from-gold/40 hover:to-gold/25';
          }

          if (day.isFuture) {
            cellBg =
              'bg-bg-elevated/20 border-border-theme/20 text-text-muted/40 cursor-default';
          }

          return (
            <motion.div
              key={day.dateKey}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`relative h-11 sm:h-14 rounded-xl sm:rounded-2xl border transition-all duration-200 p-1.5 flex flex-col justify-between cursor-pointer select-none ${cellBg} ${
                isSelected
                  ? 'ring-2 ring-gold border-gold scale-[1.03] z-10 shadow-xs'
                  : ''
              } ${day.isToday ? 'border-primary ring-1 ring-primary/60' : ''}`}>
              {/* Day Number */}
              <div className='flex items-center justify-between w-full'>
                <span className='font-mono text-xs sm:text-sm font-semibold'>
                  {day.dayNumber}
                </span>

                {day.isToday && (
                  <span className='w-1.5 h-1.5 rounded-full bg-primary animate-ping' />
                )}
              </div>

              {/* Mini activity indicator */}
              {day.hasActivity && (
                <div className='flex items-center gap-1 justify-end'>
                  <span className='text-[9px] sm:text-[10px] font-mono font-bold text-text-main/90'>
                    {day.totalActivity}
                  </span>
                  {day.intensityLevel === 3 && (
                    <span className='w-1 h-1 rounded-full bg-gold' />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selected Day Details Card */}
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
              <div className='w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-bold font-mono text-sm shadow-2xs'>
                {selectedDay.dayNumber}
              </div>
              <div className='flex flex-col text-right'>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-text-main text-sm'>
                    {selectedDay.dateFormatted}
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
                      ? 'يوم قادم نسأل الله التوفيق لطاعته'
                      : 'لا يوجد نشاط مسجل في هذا اليوم'}
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

      {/* Monthly Weeks Breakdown Bars */}
      {monthlyStats.weeklyBreakdown?.length > 0 && (
        <div className='pt-3 border-t border-border-theme/60 flex flex-col gap-2'>
          <span className='text-xs font-bold text-text-main'>
            توزيع الإنجاز على أسابيع الشهر:
          </span>
          <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2'>
            {monthlyStats.weeklyBreakdown.map((wb) => (
              <div
                key={wb.weekNumber}
                className='p-2.5 rounded-xl bg-bg-elevated/50 border border-border-theme/60 flex flex-col gap-1 text-xs'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-text-main text-[11px]'>
                    {wb.label}
                  </span>
                  <span className='font-mono font-bold text-gold text-[11px]'>
                    {wb.totalActivity}
                  </span>
                </div>
                <div className='w-full h-1.5 rounded-full bg-border-theme/40 overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-primary to-gold rounded-full'
                    style={{
                      width: `${Math.min((wb.activeDays / (wb.totalDays || 7)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className='text-[10px] text-text-muted'>
                  {wb.activeDays} من {wb.totalDays} أيام نشطة
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
