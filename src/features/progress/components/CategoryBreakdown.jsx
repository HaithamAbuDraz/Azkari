import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { EASE_SPIRITUAL } from '../../../constants/motion';

export default function CategoryBreakdown({
  timeframe,
  weeklyStats,
  monthlyStats,
  onSelectTab,
}) {
  const activeStats = timeframe === 'week' ? weeklyStats : monthlyStats;

  // Aggregate category activity from the days of the current period
  const days = activeStats.days.filter((d) => !d.isBlank);

  let morningCount = 0;
  let eveningCount = 0;
  let salahCount = 0;
  let sleepCount = 0;
  let variousCount = 0;
  const tasbihTotal = activeStats.totalTasbih || 0;

  days.forEach((day) => {
    if (day.categories) {
      morningCount += day.categories.morning?.repetitionsDone || 0;
      eveningCount += day.categories.evening?.repetitionsDone || 0;
      salahCount += day.categories.salah?.repetitionsDone || 0;
      sleepCount += day.categories.sleep?.repetitionsDone || 0;
      variousCount += day.categories.various?.repetitionsDone || 0;
    }
  });

  // Categories with exact icons and styles matching the navigation header
  const categories = [
    {
      id: 'morning',
      title: 'أذكار الصباح',
      count: morningCount,
      iconClass: 'fas fa-sun',
    },
    {
      id: 'evening',
      title: 'أذكار المساء',
      count: eveningCount,
      iconClass: 'fas fa-moon',
    },
    {
      id: 'salah',
      title: 'أذكار بعد الصلاة',
      count: salahCount,
      iconClass: 'fas fa-kaaba',
    },
    {
      id: 'sleep',
      title: 'أذكار النوم',
      count: sleepCount,
      iconClass: 'fas fa-bed',
    },
    {
      id: 'various',
      title: 'أذكار متنوعة',
      count: variousCount,
      iconClass: 'fas fa-gem',
    },
    {
      id: 'tasbih',
      title: 'تسبيحات المسبحة',
      count: tasbihTotal,
      Icon: Fingerprint,
    },
  ];

  const grandTotal = categories.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <div className='p-4 sm:p-6 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme/80 shadow-xs flex flex-col gap-4'>
      <div className='flex items-center justify-between pb-3 border-b border-border-theme/60'>
        <div className='flex items-center gap-2'>
          <i className='fas fa-chart-pie text-gold text-sm' />
          <h4 className='text-sm sm:text-base font-bold text-text-main'>
            توزيع الإنجاز حسب الأبواب
          </h4>
        </div>
        <span className='text-[11px] text-text-muted'>
          إجمالي النشاط:{' '}
          <strong className='font-mono text-text-main'>{grandTotal}</strong>{' '}
          تكرار
        </span>
      </div>

      <div className='flex flex-col gap-2.5'>
        {categories.map((cat) => {
          const pct = Math.round((cat.count / grandTotal) * 100);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectTab && onSelectTab(cat.id)}
              className='group flex flex-col gap-2 p-3 rounded-2xl bg-bg-elevated/50 hover:bg-bg-elevated/80 border border-border-theme/70 hover:border-gold/40 transition-all shadow-2xs cursor-pointer select-none'>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center gap-3'>
                  {/* Icon badge styled identically to the header brand & navigation icons */}
                  <div className='w-8 h-8 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-2xs group-hover:scale-105 group-hover:bg-gold/15 group-hover:border-gold/50 transition-all duration-200'>
                    {cat.Icon ? (
                      <cat.Icon className='w-4 h-4 text-gold' />
                    ) : (
                      <i className={`${cat.iconClass} text-xs text-gold`} />
                    )}
                  </div>
                  <span className='font-bold text-text-main text-xs sm:text-sm group-hover:text-gold transition-colors'>
                    {cat.title}
                  </span>
                </div>

                <div className='flex items-center gap-2.5'>
                  <span className='font-mono font-bold text-text-main text-xs sm:text-sm'>
                    {cat.count}{' '}
                    <span className='text-[10px] text-text-muted font-normal'>
                      تكرار
                    </span>
                  </span>
                  <span className='px-2 py-0.5 rounded-lg bg-gold/10 border border-gold/25 text-gold font-mono font-bold text-[11px] shadow-2xs'>
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar using signature Azkari gold-to-primary gradient */}
              <div className='w-full h-2 rounded-full bg-border-theme/50 overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: EASE_SPIRITUAL }}
                  className='h-full rounded-full bg-gradient-to-l from-gold to-primary'
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
