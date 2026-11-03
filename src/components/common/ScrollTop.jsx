import React, { useState, useEffect } from 'react';

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
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type='button'
      className={`fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-primary text-text-arabic border border-gold/30 flex items-center justify-center shadow-lg hover:border-gold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      onClick={scrollToTop}
      aria-label='العودة لأعلى الصفحة'
      title='العودة للأعلى'
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--text-arabic)',
      }}>
      <i className='fas fa-arrow-up text-sm'></i>
    </button>
  );
}
