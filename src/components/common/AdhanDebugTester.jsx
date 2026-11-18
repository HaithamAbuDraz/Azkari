import React, { useState, useEffect, useRef } from 'react';
import { usePrayerContext } from '../../context/PrayerContext';

/**
 * AdhanDebugTester
 *
 * Temporary developer tool to test background prayer scheduling and
 * Service Worker notifications by scheduling a dummy prayer 5s into the future.
 */
export default function AdhanDebugTester() {
  const {
    startAdhan,
    unlockAudio,
    requestNotifications,
    showInstantNotification,
  } = usePrayerContext();
  const [countdown, setCountdown] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleInstantTest = async () => {
    unlockAudio();
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        const res = await requestNotifications();
        if (res !== 'granted') {
          setStatusMsg('يرجى السماح بالإشعارات من إعدادات المتصفح أولاً');
          startAdhan('العصر');
          return;
        }
      }
    }

    const testPrayer = {
      key: 'Asr',
      label: 'العصر',
      timeMs: Date.now(),
    };

    // 1. Immediately trigger the browser notification via SW registration
    await showInstantNotification(testPrayer);

    // 2. Immediately start Adhan sound
    startAdhan('العصر');
    setStatusMsg('تم إطلاق إشعار المتصفح وصوت الأذان مباشرة!');
  };

  const handleStartTest = async () => {
    // 1. Prime the audio context to bypass autoplay restrictions
    unlockAudio();

    // 2. Request notification permission if not yet granted
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        const res = await requestNotifications();
        if (res !== 'granted') {
          setStatusMsg('يرجى السماح بالإشعارات من إعدادات المتصفح أولاً');
          return;
        }
      }
    }

    const delaySeconds = 5;
    const targetTimeMs = Date.now() + delaySeconds * 1000;
    const dummyPrayer = {
      key: 'Asr',
      label: 'العصر',
      timeMs: targetTimeMs,
    };

    // 3. Schedule with Service Worker for closed-tab notification test
    if ('serviceWorker' in navigator) {
      try {
        let reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
        }
        if (reg?.active) {
          reg.active.postMessage({
            type: 'SCHEDULE_PRAYERS',
            prayers: [dummyPrayer],
          });
        }
      } catch (e) {
        console.warn('Could not schedule with SW:', e);
      }
      setStatusMsg('تم إرسال الموعد إلى الـ Service Worker بنجاح!');
    }

    // 4. In-tab fallback timer if the user keeps this page open
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setCountdown(delaySeconds);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(intervalRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(async () => {
      await showInstantNotification(dummyPrayer);
      startAdhan('العصر');
      setCountdown(null);
      setStatusMsg('تم إطلاق إشعار المتصفح وصوت الأذان!');
    }, delaySeconds * 1000);
  };

  const handleCancelTest = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setCountdown(null);
    setStatusMsg('');

    // Clear from Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_PRAYERS',
      });
    }
  };

  return (
    <div
      role='region'
      aria-label='أداة اختبار الأذان والإشعارات'
      className="w-full max-w-md mx-auto my-3 p-3.5 rounded-2xl bg-bg-card/90 border border-gold/40 shadow-md font-['IBM_Plex_Sans_Arabic'] text-right">
      <div className='flex items-center justify-between gap-2 mb-2'>
        <div className='flex items-center gap-2'>
          <span className='w-6 h-6 rounded-lg bg-gold/15 text-gold flex items-center justify-center text-xs'>
            <i className='fas fa-flask'></i>
          </span>
          <span className='text-xs font-bold text-text-main'>
            أداة اختبار الأذان (Debug Tool)
          </span>
        </div>

        {countdown !== null && (
          <span className='text-xs font-mono font-bold text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 animate-pulse'>
            {countdown} ثانية
          </span>
        )}
      </div>

      <p className='text-[11px] text-text-muted mb-3 leading-relaxed'>
        اضغط على الزر، ثم <strong>أغلق التبويب فوراً</strong> للتأكد من ظهور
        إشعار موعد الأذان وتشغيل صوت الأذان مباشرة.
      </p>

      {countdown !== null ? (
        <div className='space-y-2'>
          <div className='p-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-xs text-center font-bold animate-pulse'>
            <span>
              سيعمل الأذان خلال {countdown} ثوانٍ... أغلق التبويب أو صغّره الآن!
            </span>
          </div>

          <button
            type='button'
            onClick={handleCancelTest}
            className='w-full py-2 rounded-xl text-xs font-semibold bg-bg-elevated hover:bg-red-500/10 text-red-500 border border-red-500/30 transition cursor-pointer'>
            إلغاء الاختبار
          </button>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          <button
            type='button'
            onClick={handleInstantTest}
            className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gold text-bg-deep hover:opacity-90 transition cursor-pointer shadow-xs active:scale-95'>
            <i className='fas fa-bell text-sm'></i>
            <span>إطلاق الإشعار وصوت الأذان الآن (تجربة فورية)</span>
          </button>

          <button
            type='button'
            onClick={handleStartTest}
            className='w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-bg-elevated hover:bg-gold/10 text-gold border border-gold/30 transition cursor-pointer active:scale-95'>
            <i className='fas fa-stopwatch text-sm'></i>
            <span>اختبار بعد 5 ثوانٍ (مع تصغير/إغلاق التبويب)</span>
          </button>
        </div>
      )}

      {statusMsg && (
        <p className='text-[10px] text-gold mt-2 text-center font-medium'>
          {statusMsg}
        </p>
      )}
    </div>
  );
}
