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
        onClose();
      }, 1800);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onClose]);

  return (
    <div
      className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-bg-card/95 border border-gold/40 text-text-main text-xs sm:text-sm font-medium shadow-xl backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 pointer-events-none ${
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-3 scale-95'
      }`}
      role="alert"
      aria-live="polite"
    >
      <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
      <span
        className="flex items-center gap-2"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
