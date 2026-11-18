import React, { useState, useEffect, useRef } from 'react';
import { usePrayerContext } from '../../context/PrayerContext';

/**
 * AdhanDebugTester
 *
 * Temporary developer tool to test background prayer scheduling and
 * Service Worker notifications by scheduling a dummy prayer 5s into the future.
 */
export default function AdhanDebugTester() {
  const { startAdhan, unlockAudio, requestNotifications } = usePrayerContext();
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

  const handleStartTest = async () => {
    // 1. Prime the audio context to bypass autoplay restrictions
    unlockAudio();

    // 2. Request notification permission if not yet granted
    if ('Notification' in window && Notification.permission !== 'granted') {
      await requestNotifications();
    }

    const delaySeconds = 5;
    const targetTimeMs = Date.now() + delaySeconds * 1000;
    const dummyPrayer = {
      key: 'Test',
      label: 'صلاة التجربة',
      timeMs: targetTimeMs,
    };

    // 3. Schedule with Service Worker for closed-tab notification test
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCHEDULE_PRAYERS',
          prayers: [dummyPrayer],
        });
        setStatusMsg('تم إرسال الموعد إلى الـ Service Worker بنجاح!');
      } else {
        // Fallback: register service worker if not yet controlling
        navigator.serviceWorker.ready.then((reg) => {
          reg.active?.postMessage({
            type: 'SCHEDULE_PRAYERS',
            prayers: [dummyPrayer],
          });
        });
        setStatusMsg('جاري الربط مع الـ Service Worker...');
      }
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

    timerRef.current = setTimeout(() => {
      startAdhan('صلاة التجربة');
      setCountdown(null);
      setStatusMsg('تم إطلاق الأذان الآن!');
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
              سيعمل الأذان خلال {countdown} ثوانٍ... أغلق التبويب الآن!
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
        <button
          type='button'
          onClick={handleStartTest}
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gold text-bg-deep hover:opacity-90 transition cursor-pointer shadow-xs active:scale-95'>
          <i className='fas fa-stopwatch text-sm'></i>
          <span>اختبار الأذان بعد 5 ثوانٍ</span>
        </button>
      )}

      {statusMsg && (
        <p className='text-[10px] text-gold mt-2 text-center font-medium'>
          {statusMsg}
        </p>
      )}
    </div>
  );
}
