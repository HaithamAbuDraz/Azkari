import React from 'react';
import { motion } from 'framer-motion';
import {
  CONTAINER_STAGGER_VARIANTS,
  ITEM_FADE_UP_VARIANTS,
  CARD_HOVER_SPRING,
} from '../../../constants/motion';

export default function PrayerCardsGrid({ prayerSchedule }) {
  if (!prayerSchedule?.list) return null;

  const { list, nextPrayer, currentPrayer } = prayerSchedule;

  return (
    <motion.div
      variants={CONTAINER_STAGGER_VARIANTS}
      initial='hidden'
      animate='visible'
      className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8'>
      {list.map((prayer) => {
        const isNext = nextPrayer?.key === prayer.key;
        const isCurrent = currentPrayer?.key === prayer.key && !isNext;

        return (
          <motion.div
            key={prayer.key}
            variants={ITEM_FADE_UP_VARIANTS}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={CARD_HOVER_SPRING}
            className={`relative p-4 sm:p-5 rounded-2xl border backdrop-blur-sm transition-colors duration-300 flex flex-col justify-between select-none ${
              isNext
                ? 'bg-gradient-to-b from-gold/15 to-bg-card border-gold/60 shadow-md ring-1 ring-gold/40'
                : isCurrent
                  ? 'bg-bg-card border-primary/50 shadow-xs'
                  : 'bg-bg-card/75 border-border-theme hover:border-gold/35 hover:bg-bg-card'
            }`}>
            {/* Top row: Icon + Status Pill */}
            <div className='flex items-center justify-between mb-3'>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                  isNext
                    ? 'bg-gold/20 text-gold border border-gold/40'
                    : isCurrent
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-bg-elevated text-text-muted border border-border-theme/60'
                }`}>
                <i className={prayer.icon}></i>
              </div>

              {isNext ? (
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold text-bg-deep shadow-2xs'>
                  القادمة
                </motion.span>
              ) : isCurrent ? (
                <span className='px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30'>
                  الحالية
                </span>
              ) : null}
            </div>

            {/* Prayer Name & Time */}
            <div>
              <h3 className='text-base sm:text-lg font-bold font-tajawal text-text-main mb-1'>
                {prayer.label}
              </h3>
              <p
                className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${
                  isNext
                    ? 'text-gold'
                    : isCurrent
                      ? 'text-primary'
                      : 'text-text-main/90'
                }`}>
                {prayer.time12}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
