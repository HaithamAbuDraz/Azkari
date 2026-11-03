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
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onClose]);

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full bg-bg-card border border-gold-dim text-gold-bright text-xs md:text-sm font-semibold shadow-2xl transition-all duration-300 flex items-center gap-2 pointer-events-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      role="alert"
      aria-live="polite"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
