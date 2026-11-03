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
      className={`toast ${visible ? 'show' : ''}`}
      role="alert"
      aria-live="polite"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
