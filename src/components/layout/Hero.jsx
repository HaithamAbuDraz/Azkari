import React from 'react';
import { useClock } from '../../hooks';

export default function Hero({ activeTab, onExploreClick }) {
  const clock = useClock();

  const isTasbih = activeTab === 'tasbih';

  return (
    <section
      className="relative text-center pt-8 pb-6 md:pt-12 md:pb-8 px-4 max-w-4xl mx-auto flex flex-col items-center"
      aria-label="المقدمة والترحيب"
    >
      {/* Subtle Islamic Geometric Ornament */}
      <div className="flex items-center justify-center gap-3 mb-4 text-gold/60" aria-hidden="true">
        <span className="w-8 sm:w-16 h-px bg-gradient-to-l from-gold/50 to-transparent"></span>
        <svg
          className="w-5 h-5 text-gold"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2l2.4 4.8 5.3-2.1-2.1 5.3 4.8 2.4-4.8 2.4 2.1 5.3-5.3-2.1-2.4 4.8-2.4-4.8-5.3 2.1 2.1-5.3-4.8-2.4 4.8-2.4-2.1-5.3 5.3 2.1z" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
        <span className="w-8 sm:w-16 h-px bg-gradient-to-r from-gold/50 to-transparent"></span>
      </div>

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-gold/10 border border-gold/25 text-gold mb-3.5 shadow-xs">
        <i className={isTasbih ? 'fas fa-hands-praying text-[11px]' : 'fas fa-heart text-[11px]'}></i>
        <span>{isTasbih ? 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ' : 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}</span>
      </div>

      {/* Main Spiritual Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-amiri text-text-arabic mb-3 leading-tight tracking-normal">
        {isTasbih ? 'التسبيح الرقمي' : 'رفيقك اليومي للذكر والطمأنينة'}
      </h1>

      {/* Supporting text */}
      <p className="text-xs sm:text-sm md:text-base text-text-muted max-w-2xl mx-auto mb-6 leading-relaxed">
        {isTasbih
          ? 'اذكر الله ذكراً كثيراً وسبّحه بكرةً وأصيلاً — اضغط على زر التسبيح أو مفتاح المسافة.'
          : 'اجعل ذكر الله جزءاً من يومك، وامنح قلبك لحظات من السكينة والطمأنينة.'}
      </p>

      {/* Live Time, Period & Date Ribbon */}
      <div
        className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 py-2 sm:py-2.5 rounded-full bg-bg-card/90 border border-border-theme backdrop-blur-md text-[11px] sm:text-xs text-text-muted shadow-xs transition-colors"
        aria-live="polite"
        aria-label="التوقيت الحالي"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
          <span className="flex items-center gap-1.5">
            <i className="far fa-clock text-gold"></i>
            <span>التوقيت:</span>
            <strong className="text-text-main font-semibold font-mono">{clock.timeString}</strong>
          </span>
        </div>

        <span className="text-border-theme hidden sm:inline" aria-hidden="true">•</span>

        <span className="flex items-center gap-1.5">
          <i className="fas fa-sun text-gold"></i>
          <span>الفترة:</span>
          <strong className="text-text-main font-semibold">{clock.period}</strong>
        </span>

        <span className="text-border-theme hidden sm:inline" aria-hidden="true">•</span>

        <span className="flex items-center gap-1.5">
          <i className="far fa-calendar-alt text-gold"></i>
          <span>التاريخ:</span>
          <strong className="text-text-main font-semibold">{clock.dateStr}</strong>
        </span>
      </div>
    </section>
  );
}
