import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrayerContext } from '../../context/PrayerContext';

const DISMISSED_DEFAULT_KEY = 'azkari-adhan-banner-dismissed';
const DISMISSED_DENIED_KEY = 'azkari-adhan-denied-dismissed';

export default function AdhanPermissionBanner() {
  const {
    isAudioUnlocked,
    notificationPermission: contextPermission,
    requestNotifications,
    unlockAudio,
  } = usePrayerContext();

  // ── 1. Safe State Check for Browser Notification Permission ──
  const [permission, setPermission] = useState(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'default';
    }
    return Notification.permission;
  });

  const [dismissedDefault, setDismissedDefault] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(DISMISSED_DEFAULT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [dismissedDenied, setDismissedDenied] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(DISMISSED_DENIED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Sync with context permission or window.Notification
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    } else if (contextPermission) {
      setPermission(contextPermission);
    }
  }, [contextPermission]);

  // Dynamically listen to permission changes via Permissions API
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('permissions' in navigator) ||
      !navigator.permissions.query
    ) {
      return;
    }

    let isMounted = true;
    navigator.permissions
      .query({ name: 'notifications' })
      .then((status) => {
        if (!isMounted) return;
        setPermission(status.state);
        status.onchange = () => {
          if (isMounted) {
            setPermission(status.state);
          }
        };
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for reset events from settings panel to re-surface banner
  useEffect(() => {
    const handleResetBanner = () => {
      setDismissedDefault(false);
      setDismissedDenied(false);
      try {
        localStorage.removeItem(DISMISSED_DEFAULT_KEY);
        localStorage.removeItem(DISMISSED_DENIED_KEY);
      } catch {
        // Ignore
      }
    };

    window.addEventListener('azkari-reset-adhan-banner', handleResetBanner);
    return () => {
      window.removeEventListener(
        'azkari-reset-adhan-banner',
        handleResetBanner
      );
    };
  }, []);

  // ── 2. Handlers ──
  const handleEnable = async () => {
    unlockAudio();
    const res = await requestNotifications();
    if (res === 'denied') {
      setPermission('denied');
    } else {
      handleDismissDefault();
    }
  };

  const handleDismissDefault = () => {
    setDismissedDefault(true);
    try {
      localStorage.setItem(DISMISSED_DEFAULT_KEY, 'true');
    } catch {
      // Ignore
    }
  };

  const handleDismissDenied = () => {
    setDismissedDenied(true);
    try {
      localStorage.setItem(DISMISSED_DENIED_KEY, 'true');
    } catch {
      // Ignore
    }
  };

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // If granted and audio already unlocked, no banner is needed
  if (permission === 'granted' && isAudioUnlocked) {
    return null;
  }

  // ── 3. 'Denied' State: Warning Banner with Red Accent & Lock Icon ──
  if (permission === 'denied') {
    if (dismissedDenied) return null;

    return (
      <AnimatePresence>
        <motion.aside
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          aria-label='تنبيه حظر إشعارات الأذان'
          className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/30 border border-red-500/40 text-red-900 dark:text-red-300 shadow-lg backdrop-blur-md'>
            <div className='flex items-center gap-3 text-right'>
              <div className='w-10 h-10 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center justify-center text-lg shrink-0 shadow-2xs'>
                <i className='fas fa-lock'></i>
              </div>
              <div>
                <h4 className='text-xs sm:text-sm font-bold flex items-center gap-2'>
                  <span>تنبيه: إشعارات الأذان محظورة</span>
                  <span className='px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-600 dark:text-red-400 font-semibold'>
                    محظور 🔒
                  </span>
                </h4>
                <p className='text-[11px] sm:text-xs text-red-800/90 dark:text-red-300/90 mt-0.5 leading-relaxed'>
                  تم حظر إشعارات الأذان من المتصفح. يرجى الضغط على أيقونة القفل
                  🔒 في شريط العنوان بالأعلى والسماح بالإشعارات (Allow
                  Notifications) ليعمل الأذان في الخلفية.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 w-full sm:w-auto justify-end shrink-0'>
              <button
                type='button'
                onClick={handleDismissDenied}
                className='px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-bg-elevated transition cursor-pointer'>
                إخفاء
              </button>
              <button
                type='button'
                onClick={handleReload}
                className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow-xs active:scale-95'>
                <i className='fas fa-rotate-right text-xs'></i>
                <span>تحديث الصفحة</span>
              </button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    );
  }

  // ── 4. 'Default' State: Standard Banner with Gold Accent & Enable Button ──
  if (permission === 'default' || !isAudioUnlocked) {
    if (dismissedDefault) return null;

    return (
      <AnimatePresence>
        <motion.aside
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          aria-label='تفعيل تنبيهات الأذان'
          className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-bg-card/95 border border-gold/40 shadow-lg backdrop-blur-md'>
            <div className='flex items-center gap-3 text-right'>
              <div className='w-10 h-10 rounded-xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center text-lg shrink-0 shadow-2xs'>
                <i className='fas fa-bell'></i>
              </div>
              <div>
                <h4 className='text-xs sm:text-sm font-bold text-text-main flex items-center gap-2'>
                  <span>تفعيل الأذان التلقائي والإشعارات</span>
                  <span className='px-1.5 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold font-normal'>
                    تنبيه
                  </span>
                </h4>
                <p className='text-[11px] sm:text-xs text-text-muted mt-0.5 leading-relaxed'>
                  اضغط لتخطي قيود المتصفح وسماع الأذان فور دخوله حتى لو كنت
                  تتصفح صفحات أخرى أو عند إغلاق الموقع.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 w-full sm:w-auto justify-end shrink-0'>
              <button
                type='button'
                onClick={handleDismissDefault}
                className='px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-bg-elevated transition cursor-pointer'>
                لاحقاً
              </button>
              <button
                type='button'
                onClick={handleEnable}
                className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gold text-bg-deep hover:opacity-90 transition cursor-pointer shadow-xs active:scale-95'>
                <i className='fas fa-volume-high text-xs'></i>
                <span>تفعيل الآن</span>
              </button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    );
  }

  return null;
}
