import React from 'react';

export default function PrayerCardsGrid({ prayerSchedule }) {
  if (!prayerSchedule?.list) return null;

  const { list, nextPrayer, currentPrayer } = prayerSchedule;

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8'>
      {list.map((prayer) => {
        const isNext = nextPrayer?.key === prayer.key;
        const isCurrent = currentPrayer?.key === prayer.key && !isNext;

        return (
          <div
            key={prayer.key}
            className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between select-none ${
              isNext
                ? 'bg-gradient-to-b from-gold/15 to-bg-card border-gold/60 shadow-md scale-[1.02] ring-1 ring-gold/40'
                : isCurrent
                  ? 'bg-bg-card border-primary/50 shadow-xs'
                  : 'bg-bg-card/70 border-border-theme hover:border-gold/30 hover:bg-bg-card'
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

              {/* Status Indicator */}
              {isNext ? (
                <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold text-bg-deep shadow-2xs'>
                  القادمة
                </span>
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
          </div>
        );
      })}
    </div>
  );
}
