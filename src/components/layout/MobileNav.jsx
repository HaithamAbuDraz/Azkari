import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_ITEMS } from '../../constants/tabs';
import { TabIcon } from '../common';
import {
  EASE_SPIRITUAL,
  MODAL_BACKDROP_VARIANTS,
} from '../../constants/motion';

export default function MobileNav({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            variants={MODAL_BACKDROP_VARIANTS}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='fixed inset-0 bg-black/60 backdrop-blur-xs z-50'
            onClick={onClose}
            aria-hidden='true'
          />

          {/* RTL Right Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: EASE_SPIRITUAL }}
            className='fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-bg-card border-l border-border-theme z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto'
            role='dialog'
            aria-modal='true'
            aria-label='قائمة التنقل الرئيسية'>
            <div>
              {/* Top Brand Header & Close Button */}
              <div className='flex items-center justify-between pb-5 border-b border-border-theme/60 mb-6'>
                <a
                  href='/'
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTab('home');
                    onClose();
                  }}
                  className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-xs'>
                    <svg
                      className='w-5 h-5'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.8'>
                      <path d='M12 2l2.4 4.8 5.3-2.1-2.1 5.3 4.8 2.4-4.8 2.4 2.1 5.3-5.3-2.1-2.4 4.8-2.4-4.8-5.3 2.1 2.1-5.3-4.8-2.4 4.8-2.4-2.1-5.3 5.3 2.1z' />
                      <circle
                        cx='12'
                        cy='12'
                        r='2.5'
                        fill='currentColor'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='font-bold text-lg text-text-main'>أذكاري</h3>
                    <span className='text-xs text-text-muted'>
                      روضة الأذكار والأدعية
                    </span>
                  </div>
                </a>

                <motion.button
                  type='button'
                  whileTap={{ scale: 0.9 }}
                  className='w-9 h-9 rounded-xl border border-border-theme flex items-center justify-center text-text-muted hover:text-text-main hover:bg-bg-elevated transition cursor-pointer'
                  onClick={onClose}
                  aria-label='إغلاق القائمة'>
                  <i className='fas fa-times text-sm'></i>
                </motion.button>
              </div>

              {/* Navigation Links */}
              <div className='flex flex-col gap-2'>
                <span className='text-[11px] font-semibold text-text-muted px-2 uppercase tracking-wider mb-1'>
                  أقسام الأذكار
                </span>
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = activeTab === item.id;
                  return (
                    <motion.a
                      key={item.id}
                      href={item.path}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.04 * idx,
                        duration: 0.25,
                        ease: EASE_SPIRITUAL,
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-2xs'
                          : 'text-text-muted hover:text-text-main hover:bg-bg-elevated border border-transparent'
                      }`}>
                      <div className='flex items-center gap-3'>
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            isActive
                              ? 'bg-gold/20 text-gold'
                              : 'bg-bg-elevated text-text-muted'
                          }`}>
                          <TabIcon
                            item={item}
                            lucideClassName='w-3.5 h-3.5'
                            faClassName='text-xs'
                          />
                        </span>
                        <span>{item.fullLabel || item.label}</span>
                      </div>
                      {isActive && (
                        <i className='fas fa-check text-xs text-gold'></i>
                      )}
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Footer info & Theme switch */}
            <div className='pt-6 border-t border-border-theme/60 mt-6 flex flex-col gap-4'>
              <motion.button
                type='button'
                whileTap={{ scale: 0.97 }}
                onClick={onToggleTheme}
                className='flex items-center justify-between px-4 py-2.5 rounded-xl bg-bg-elevated/70 border border-border-theme text-text-main text-xs font-semibold cursor-pointer hover:border-gold/30 transition'>
                <span className='flex items-center gap-2'>
                  <i
                    className={
                      theme === 'dark'
                        ? 'fas fa-moon text-gold'
                        : 'fas fa-sun text-amber-500'
                    }></i>
                  <span>
                    المظهر: {theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}
                  </span>
                </span>
                <span className='text-[11px] text-gold font-normal'>تبديل</span>
              </motion.button>

              <p className='text-[11px] text-text-muted text-center leading-relaxed'>
                حصن المسلم من أذكار الكتاب والسنة النبوية
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
