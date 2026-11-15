import React from 'react';

/**
 * NotFoundPage (404)
 *
 * A modern, responsive 404 error page in Arabic, supporting both Light and Dark modes.
 * Features centered layout, stylized 404 typography, soft ambient glows,
 * and smooth SPA routing without full page reload.
 */
export default function NotFoundPage({ onSelectTab, onNavigateHome }) {
  const handleHomeClick = (e) => {
    e.preventDefault();
    if (onSelectTab) {
      onSelectTab('home');
    } else if (onNavigateHome) {
      onNavigateHome();
    } else if (typeof window !== 'undefined') {
      window.history.pushState({ route: 'home' }, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleBackClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else if (onSelectTab) {
      onSelectTab('home');
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <div
      dir='rtl'
      className="min-h-[52vh] sm:min-h-[56vh] w-full flex items-center justify-center py-6 px-4 relative overflow-hidden font-['IBM_Plex_Sans_Arabic'] select-none">
      {/* ── Ambient Background Glows ── */}
      <div
        aria-hidden='true'
        className='absolute top-1/4 -right-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-emerald-900/5 dark:bg-[#c5a15b]/10 blur-2xl pointer-events-none transition-all duration-700'
      />
      <div
        aria-hidden='true'
        className='absolute bottom-1/4 -left-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-amber-500/10 dark:bg-emerald-500/5 blur-2xl pointer-events-none transition-all duration-700'
      />

      {/* ── Compact Central Card ── */}
      <div className='relative z-10 w-full max-w-sm sm:max-w-md mx-auto text-center flex flex-col items-center p-5 sm:p-7 rounded-2xl bg-white/80 dark:bg-[#182720]/85 backdrop-blur-xl border border-emerald-950/10 dark:border-[#c5a15b]/25 shadow-lg shadow-emerald-950/5 dark:shadow-xl dark:shadow-black/50 transition-all duration-300'>
        {/* Top Decorative Icon */}
        <div className='w-11 h-11 sm:w-12 sm:h-12 mb-3 rounded-xl flex items-center justify-center bg-emerald-900/5 dark:bg-[#c5a15b]/15 border border-emerald-900/10 dark:border-[#c5a15b]/30 text-emerald-900 dark:text-[#dfc078] transition-transform duration-300 hover:rotate-6 hover:scale-105 shadow-2xs'>
          <svg
            className='w-5 h-5 sm:w-6 sm:h-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth='1.8'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
            />
          </svg>
        </div>

        {/* ── Stylized 404 Typography (Compact) ── */}
        <div className='relative select-none'>
          <h1 className='text-5xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-800 dark:from-[#f1d896] dark:via-[#dfc078] dark:to-[#9e7d3f] drop-shadow-2xs dark:drop-shadow-[0_2px_14px_rgba(197,161,91,0.3)]'>
            404
          </h1>
          {/* Subtle Warm Glow Behind 404 in Dark Mode */}
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-[#c5a15b]/15 blur-xl -z-10 opacity-0 dark:opacity-100 transition-opacity pointer-events-none'
          />
        </div>

        {/* ── Heading & Friendly Description ── */}
        <h2 className='text-base sm:text-lg font-bold text-emerald-950 dark:text-[#f2f3ec] mt-2 mb-1.5 tracking-wide'>
          عذراً، الصفحة التي تبحث عنها غير موجودة
        </h2>

        <p className='text-xs sm:text-sm text-stone-600 dark:text-[#a6b4a8] leading-relaxed max-w-xs sm:max-w-sm mx-auto mb-5 font-normal'>
          يبدو أن الرابط غير صحيح أو تم نقل الصفحة. يمكنك العودة واستئناف
          قراءتك.
        </p>

        {/* ── Action Buttons ── */}
        <div className='flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto'>
          {/* Primary: Return to Home Button */}
          <a
            href='/'
            onClick={handleHomeClick}
            className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-900 hover:bg-emerald-850 dark:text-[#101b17] dark:bg-gradient-to-r dark:from-[#dfc078] dark:via-[#f1d896] dark:to-[#c5a15b] shadow-md shadow-emerald-950/15 dark:shadow-[0_2px_12px_rgba(197,161,91,0.22)] hover:shadow-lg dark:hover:shadow-[0_4px_16px_rgba(197,161,91,0.3)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer'>
            <i
              className='fas fa-house text-sm shrink-0'
              aria-hidden='true'
            />
            <span>العودة للرئيسية</span>
          </a>

          {/* Secondary: Go Back Button */}
          <button
            type='button'
            onClick={handleBackClick}
            className='w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-emerald-950/80 dark:text-[#f2f3ec]/85 bg-emerald-900/5 hover:bg-emerald-900/10 dark:bg-white/5 dark:hover:bg-white/10 border border-emerald-950/10 dark:border-white/10 transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer'>
            <i
              className='fas fa-arrow-right text-xs shrink-0 rtl:rotate-0'
              aria-hidden='true'
            />
            <span>الصفحة السابقة</span>
          </button>
        </div>

        {/* Spiritual Footer Note */}
        <div className='mt-5 pt-3.5 border-t border-emerald-950/10 dark:border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400'>
          <span>« أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ »</span>
        </div>
      </div>
    </div>
  );
}
