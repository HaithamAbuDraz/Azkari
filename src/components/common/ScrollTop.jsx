import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../../utils/haptics';

export default function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    triggerHaptic(20);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type='button'
      onClick={scrollToTop}
      aria-label='العودة لأعلى الصفحة'
      title='العودة لأعلى الصفحة'
      className={`group fixed bottom-3 left-3 sm:bottom-4 sm:left-5 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-bg-card/95 border border-gold/40 hover:border-gold shadow-lg hover:shadow-gold/25 backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-105 active:scale-95 active:translate-y-0 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
      {/* Subtle Ambient Halo */}
      <span
        className='absolute inset-0 rounded-full bg-gold/5 group-hover:bg-gold/15 transition-colors duration-300 pointer-events-none'
        aria-hidden='true'
      />

      {/* Islamic Sebha from /assets/images/cursor-sebha.svg with upward indicator */}
      <div className='relative flex items-center justify-center'>
        <img
          src='/assets/images/cursor-sebha.svg'
          alt='السبحة'
          className='w-7 h-7 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform duration-300 drop-shadow-sm select-none pointer-events-none'
          draggable={false}
        />
        {/* Crisp vector upward arrow centered inside the Sebha opening */}
        <span
          className='absolute left-[calc(50%-2px)] top-[calc(50%-1px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none'
          aria-hidden='true'>
          <svg
            viewBox='0 0 24 24'
            className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#855e16] dark:text-[#f5be4f] transition-transform duration-300 group-hover:-translate-y-1 drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
            fill='none'
            stroke='currentColor'
            strokeWidth='3.2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M12 19V5M5 12l7-7 7 7' />
          </svg>
        </span>
      </div>

      {/* Floating Hover Tooltip: 'للأعلى ↑' */}
      <span
        className='pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-bg-card/95 border border-gold/40 px-2 py-0.5 text-[10px] font-bold text-gold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        aria-hidden='true'>
        للأعلى ↑
      </span>
    </button>
  );
}
