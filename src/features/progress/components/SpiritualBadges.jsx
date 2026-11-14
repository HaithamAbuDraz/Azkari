import React from 'react';
import { motion } from 'framer-motion';
import { EASE_SPIRITUAL } from '../../../constants/motion';

export default function SpiritualBadges({ badges }) {
  const completedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className='p-4 sm:p-6 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme/80 shadow-xs flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center justify-between pb-3 border-b border-border-theme/60'>
        <div className='flex items-center gap-2'>
          <i className='fas fa-award text-gold text-sm' />
          <h4 className='text-sm sm:text-base font-bold text-text-main'>
            أوسمة المواظبة والإنجاز
          </h4>
        </div>
        <span className='px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-bold font-mono'>
          {completedCount} من {badges.length} مكتسبة
        </span>
      </div>

      {/* 2x2 Grid Layout */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4'>
        {badges.map((badge) => {
          const currentFormatted = Number(badge.current || 0).toLocaleString(
            'en-US'
          );
          const targetFormatted = Number(badge.target || 0).toLocaleString(
            'en-US'
          );

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`group relative overflow-hidden p-4 sm:p-4.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 shadow-2xs ${
                badge.isUnlocked
                  ? 'bg-gold/10 border-gold/40 shadow-xs hover:border-gold/60'
                  : 'bg-bg-elevated/40 border-border-theme/70 hover:border-border-theme hover:bg-bg-elevated/70'
              }`}>
              {/* Subtle top ambient shimmer for unlocked badges */}
              {badge.isUnlocked && (
                <div className='absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold/70 via-gold/30 to-transparent' />
              )}

              {/* Top Row: Icon on right, Status Pill on left */}
              <div className='flex items-center justify-between'>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                    badge.isUnlocked
                      ? 'bg-gold/20 text-gold border-gold/40 shadow-xs'
                      : 'bg-bg-elevated text-text-muted border-border-theme/80'
                  }`}>
                  <i className={`${badge.icon} text-base`} />
                </div>

                {badge.isUnlocked ? (
                  <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-gold/15 border border-gold/35 text-gold text-[10px] sm:text-[11px] font-bold shadow-2xs'>
                    <i className='fas fa-circle-check text-[10px]' />
                    <span>مكتمل</span>
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-bg-elevated border border-border-theme text-text-muted text-[10px] sm:text-[11px] font-medium'>
                    <i className='fas fa-lock text-[9px]' />
                    <span>قيد الإنجاز</span>
                  </span>
                )}
              </div>

              {/* Title & Description occupying full card width without truncation */}
              <div className='flex flex-col gap-1 text-right'>
                <h5 className='font-bold text-text-main text-sm sm:text-base group-hover:text-gold transition-colors leading-snug'>
                  {badge.title}
                </h5>
                <p className='text-xs sm:text-[13px] text-text-muted leading-relaxed font-normal'>
                  {badge.description}
                </p>
              </div>

              {/* Metrics & Progress Bar */}
              <div className='flex flex-col gap-2 pt-2.5 border-t border-border-theme/40'>
                <div className='flex items-center justify-between text-xs'>
                  <span
                    className={`font-semibold ${
                      badge.isUnlocked ? 'text-gold' : 'text-text-muted'
                    }`}>
                    {badge.isUnlocked ? 'مكتمل بحمد الله' : 'قيد الإنجاز'}
                  </span>
                  <div
                    className='flex items-center gap-1 font-mono font-bold text-text-main text-xs sm:text-sm'
                    dir='rtl'>
                    <span>{currentFormatted}</span>
                    <span className='text-text-muted/70 font-normal px-0.5'>
                      /
                    </span>
                    <span>{targetFormatted}</span>
                    <span className='text-[11px] text-text-muted font-normal font-sans mr-0.5'>
                      {badge.unit}
                    </span>
                  </div>
                </div>

                {/* Progress track & fill */}
                <div className='w-full h-2 rounded-full bg-border-theme/50 overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${badge.progressPct}%` }}
                    transition={{ duration: 0.6, ease: EASE_SPIRITUAL }}
                    className={`h-full rounded-full ${
                      badge.isUnlocked
                        ? 'bg-gradient-to-l from-gold to-primary'
                        : 'bg-primary/70'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
