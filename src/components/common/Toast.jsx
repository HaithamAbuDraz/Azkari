import React, { useEffect, useState } from 'react';

export default function Toast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (toast) {
      setContent(toast);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Give the CSS exit transition time to finish before clearing
        const cleanup = setTimeout(onClose, 320);
        return () => clearTimeout(cleanup);
      }, 2200);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onClose]);

  if (!toast && !visible) return null;

  return (
    <div
      className={[
        // Position — centred horizontally, below header
        'fixed top-20 sm:top-24 left-1/2 z-50',
        // Size & shape
        'px-5 py-2.5 rounded-full',
        // Surface
        'bg-bg-card/95 border border-gold/40 shadow-xl backdrop-blur-md',
        // Typography
        'text-text-main text-xs sm:text-sm font-medium',
        // Layout
        'flex items-center gap-2.5',
        // Non-interactive
        'pointer-events-none',
        // Entrance animation (from index.css)
        visible
          ? 'toast-enter opacity-100'
          : 'opacity-0 translate-y-[-8px] scale-95',
        // Smooth exit via CSS transition when visible flips to false
        'transition-[opacity,transform] duration-300 ease-in',
      ]
        .filter(Boolean)
        .join(' ')}
      role='alert'
      aria-live='polite'>
      {/* Gold pulse dot */}
      <span
        className='w-2 h-2 rounded-full bg-gold shrink-0 animate-ping'
        aria-hidden='true'
      />
      <span
        className='flex items-center gap-2'
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
