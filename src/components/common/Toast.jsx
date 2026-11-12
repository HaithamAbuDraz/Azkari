import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => {
      onClose();
    }, 2400);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div className='fixed top-20 sm:top-24 inset-x-0 z-50 flex justify-center pointer-events-none px-4'>
      <AnimatePresence mode='wait'>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className='px-5 py-2.5 rounded-full bg-bg-card/95 border border-gold/40 shadow-xl backdrop-blur-md text-text-main text-xs sm:text-sm font-medium flex items-center gap-2.5'
            role='alert'
            aria-live='polite'>
            <span
              className='w-2 h-2 rounded-full bg-gold shrink-0 animate-ping'
              aria-hidden='true'
            />
            <span
              className='flex items-center gap-2'
              dangerouslySetInnerHTML={{ __html: toast }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
