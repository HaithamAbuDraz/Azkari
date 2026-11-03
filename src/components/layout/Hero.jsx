import React from 'react';
import { useClock } from '../../hooks';

export default function Hero({ activeTab }) {
  const clock = useClock();
  const isTasbih = activeTab === 'tasbih';

  return (
    <section
      className='relative text-center pt-6 pb-4 sm:pt-10 sm:pb-6 px-4 max-w-4xl mx-auto flex flex-col items-center'
      aria-label='المقدمة والترويسة'>
      {/* Subtle Islamic Geometric Ornament */}
      <div
        className='flex items-center justify-center gap-3 mb-3 text-gold/60'
        aria-hidden='true'>
        <span className='w-8 sm:w-16 h-px bg-gradient-to-l from-gold/50 to-transparent'></span>
        <svg
          className='w-5 h-5 text-gold'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'>
          <path d='M12 2l2.4 4.8 5.3-2.1-2.1 5.3 4.8 2.4-4.8 2.4 2.1 5.3-5.3-2.1-2.4 4.8-2.4-4.8-5.3 2.1 2.1-5.3-4.8-2.4 4.8-2.4-2.1-5.3 5.3 2.1z' />
          <circle
            cx='12'
            cy='12'
            r='2'
            fill='currentColor'
          />
        </svg>
        <span className='w-8 sm:w-16 h-px bg-gradient-to-r from-gold/50 to-transparent'></span>
      </div>

      {/* Pill Badge */}
      <div className='inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-gold/10 border border-gold/25 text-gold mb-3 shadow-2xs'>
        <i
          className={
            isTasbih
              ? 'fas fa-hands-praying text-[11px]'
              : 'fas fa-heart text-[11px]'
          }></i>
        <span className='font-tajawal'>
          {isTasbih
            ? 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ السَّاجِدِينَ'
            : 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
        </span>
      </div>

      {/* Main Spiritual Heading */}
      <h1 className='text-3xl sm:text-4xl font-bold font-amiri text-text-arabic mb-3 leading-tight tracking-normal'>
        {isTasbih ? 'مسبحتي' : 'رفيقك اليومي للذكر والطمأنينة'}
      </h1>

      {/* Supporting subtitle about remembering Allah */}
      <p className='text-sm sm:text-base text-text-muted max-w-2xl mx-auto mb-5 leading-relaxed font-tajawal'>
        {isTasbih
          ? 'مسبحة إلكترونية لتسبيح الله وذكره في كل وقت، بقلبٍ مطمئن ولسانٍ رطب.'
          : 'اجعل ذكر الله جزءاً من يومك، وامنح قلبك لحظات من السكينة والطمأنينة.'}
      </p>

      {/* Subtle Status Bar showing Time, Day/Date & Current Period */}
      <div
        className='inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 py-2 sm:py-2.5 rounded-full bg-bg-card/90 border border-border-theme backdrop-blur-md text-xs text-text-muted shadow-2xs transition-colors'
        aria-live='polite'
        aria-label='الحالة والتوقيت الحالي'>
        {/* Time */}
        <div className='flex items-center gap-1.5'>
          <span
            className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'
            aria-hidden='true'></span>
          <span className='flex items-center gap-1.5'>
            <i className='far fa-clock text-gold'></i>
            <span>الوقت:</span>
            <strong className='text-text-main font-bold font-mono tracking-wider'>
              {clock.timeString}
            </strong>
          </span>
        </div>

        <span
          className='text-border-theme hidden sm:inline'
          aria-hidden='true'>
          •
        </span>

        {/* Day / Date */}
        <div
          className='flex items-center gap-1.5'
          title={clock.dateStrEn}>
          <i className='far fa-calendar-alt text-gold'></i>
          <span>التاريخ:</span>
          <strong className='text-text-main font-semibold'>
            {clock.dateStr}
          </strong>
        </div>

        <span
          className='text-border-theme hidden sm:inline'
          aria-hidden='true'>
          •
        </span>

        {/* Current Period */}
        <div className='flex items-center gap-1.5'>
          <i
            className={
              clock.isMorning ? 'fas fa-sun text-gold' : 'fas fa-moon text-gold'
            }></i>
          <span>الفترة:</span>
          <strong className='text-text-main font-semibold'>
            {clock.period}
          </strong>
        </div>
      </div>
    </section>
  );
}
