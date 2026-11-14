import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, TrendingUp } from 'lucide-react';
import { RollingNumber } from '../../../components/common';
import { CARD_HOVER_SPRING } from '../../../constants/motion';

export default function ProgressStatsCards({
  timeframe,
  weeklyStats,
  monthlyStats,
  streaks,
}) {
  const isWeek = timeframe === 'week';
  const activeStats = isWeek ? weeklyStats : monthlyStats;

  const totalAzkar = activeStats.totalAzkarRepetitions || 0;
  const totalTasbih = activeStats.totalTasbih || 0;
  const activeDays = activeStats.activeDays || 0;
  const totalDays = isWeek ? 7 : activeStats.elapsedDays || 30;
  const adherence = isWeek
    ? activeStats.adherenceRate
    : activeStats.consistencyRate;
  const currentStreak = streaks.currentStreak || 0;

  const cards = [
    {
      id: 'adherence',
      title: 'معدل المواظبة',
      value: `${adherence}%`,
      subtitle: `${activeDays} من أصل ${totalDays} أيام مباركة`,
      Icon: TrendingUp,
      iconColor: 'text-primary',
      badgeBg: 'bg-primary/10 border-primary/20',
      highlightColor: 'from-primary/20 via-primary/5 to-transparent',
    },
    {
      id: 'azkar',
      title: 'إجمالي الأذكار المنجزة',
      value: totalAzkar,
      isNumeric: true,
      unit: 'ذكر',
      subtitle: `بمعدل ${activeStats.dailyAverage || 0} ذكراً باليوم النشط`,
      iconClass: 'fas fa-quran',
      iconColor: 'text-gold',
      badgeBg: 'bg-gold/15 border-gold/30',
      highlightColor: 'from-gold/20 via-gold/5 to-transparent',
    },
    {
      id: 'tasbih',
      title: 'تسبيحات المسبحة',
      value: totalTasbih,
      isNumeric: true,
      unit: 'تسبيحة',
      subtitle: `${Math.floor(totalTasbih / 33)} دورة تسبيح كاملة`,
      Icon: Fingerprint,
      iconColor: 'text-primary',
      badgeBg: 'bg-primary/10 border-primary/20',
      highlightColor: 'from-primary/20 via-primary/5 to-transparent',
    },
    {
      id: 'streak',
      title: 'سلسلة الأيام المتتالية',
      value: currentStreak,
      isNumeric: true,
      unit: 'أيام',
      subtitle:
        currentStreak >= 3
          ? 'ما شاء الله! ثبات مبارك وورد مستمر'
          : activeStats.bestDay
            ? `أفضل إنجاز: ${activeStats.bestDay.dayName || activeStats.bestDay.dateKey}`
            : 'داوم على وردك لتبني سلسلتك المباركة',
      iconClass: 'fas fa-fire-flame-curved',
      iconColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/15 border-amber-500/30',
      highlightColor: 'from-amber-500/20 via-amber-500/5 to-transparent',
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4'>
      {cards.map((card) => {
        return (
          <motion.div
            key={card.id}
            whileHover={CARD_HOVER_SPRING}
            className='relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme/80 hover:border-gold/40 transition-colors shadow-2xs group flex flex-col justify-between min-h-[120px] sm:min-h-[135px]'>
            {/* Top ambient glow */}
            <div
              className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${card.highlightColor}`}
            />

            <div className='flex items-center justify-between gap-3 mb-2'>
              <span className='text-xs sm:text-sm font-semibold text-text-muted'>
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs ${card.badgeBg}`}>
                {card.Icon ? (
                  <card.Icon className={`w-4 h-4 ${card.iconColor}`} />
                ) : (
                  <i
                    className={`${card.iconClass} text-sm ${card.iconColor}`}
                  />
                )}
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <div className='flex items-baseline gap-1.5'>
                {card.isNumeric ? (
                  <span className='font-mono font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight'>
                    <RollingNumber value={card.value} />
                  </span>
                ) : (
                  <span className='font-mono font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight'>
                    {card.value}
                  </span>
                )}
                {card.unit && (
                  <span className='text-xs font-semibold text-text-muted'>
                    {card.unit}
                  </span>
                )}
              </div>
              <p className='text-[11px] sm:text-xs text-text-muted/90 truncate'>
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
