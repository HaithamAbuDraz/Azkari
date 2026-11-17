import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrayerContext } from '../../context/PrayerContext';
import { POPULAR_CITIES } from '../../constants/prayers';

const LOCATION_STORAGE_KEY = 'azkari-prayer-location';

/**
 * LocationOnboardingWelcome
 *
 * Welcoming onboarding modal shown to first-time visitors to configure their
 * geographic location for accurate prayer times and Qibla compass alignment.
 *
 * Adheres to the DRY principle by reusing the global PrayerContext geolocation
 * and city selection methods identical to PrayerTimesPanel.
 */
export default function LocationOnboardingWelcome({ onLocationSet }) {
  const { selectCity, requestGpsLocation, gpsLoading } = usePrayerContext();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCityKey, setSelectedCityKey] = useState(
    POPULAR_CITIES[0]?.city || 'Makkah'
  );
  const [geoError, setGeoError] = useState('');
  const [mounted, setMounted] = useState(false);

  // 1. Visibility Logic: Check localStorage for existing location on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!saved) {
        setIsOpen(true);
      }
    } catch {
      // If localStorage is unavailable, fallback to showing modal once
      setIsOpen(true);
    }
  }, []);

  // 2. Geolocation Auto-Detect via shared context method (DRY)
  const handleAutoDetect = async () => {
    setGeoError('');

    try {
      const resolvedLocation = await requestGpsLocation();
      if (resolvedLocation) {
        // Location saved to localStorage and context updated in requestGpsLocation
        if (onLocationSet) onLocationSet(resolvedLocation);
        setIsOpen(false);
      }
    } catch (err) {
      let errorMsg = 'تعذر تحديد موقعك تلقائياً.';
      if (err?.code === 1) {
        errorMsg =
          'تم رفض إذن الوصول إلى الموقع. يرجى اختيار مدينتك يدوياً من القائمة.';
      } else if (err?.code === 2) {
        errorMsg = 'موقعك غير متاح حالياً. يرجى اختيار مدينتك يدوياً.';
      } else if (err?.code === 3) {
        errorMsg =
          'استغرق تحديد الموقع وقتاً أطول من المعتاد. يرجى اختيار مدينتك يدوياً.';
      }
      setGeoError(errorMsg);
    }
  };

  // 3. Manual City Selection via shared selectCity method (DRY)
  const handleManualConfirm = () => {
    const chosen =
      POPULAR_CITIES.find((c) => c.city === selectedCityKey) ||
      POPULAR_CITIES[0];

    const manualLocation = {
      ...chosen,
      isGps: false,
    };

    try {
      localStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(manualLocation)
      );
    } catch (err) {
      console.warn('Failed to save location to localStorage:', err);
    }

    // Update global context & notify caller
    selectCity(manualLocation);
    if (onLocationSet) onLocationSet(manualLocation);

    // Immediately close modal
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  const modalJSX = (
    <AnimatePresence>
      <div
        className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4'
        role='dialog'
        aria-modal='true'
        aria-labelledby='onboarding-title'
        aria-describedby='onboarding-desc'>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className='w-full max-w-md bg-bg-card border border-border-theme/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center'>
          {/* Subtle Spiritual Ambient Glows */}
          <div
            className='absolute -top-20 -right-20 w-52 h-52 rounded-full bg-gold/15 blur-3xl pointer-events-none'
            aria-hidden='true'
          />
          <div
            className='absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-primary/15 blur-3xl pointer-events-none'
            aria-hidden='true'
          />

          {/* Decorative Icon */}
          <div className='relative z-10 w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center mx-auto mb-4 shadow-sm'>
            <i className='fas fa-location-dot text-2xl text-gold'></i>
          </div>

          {/* Title & Welcoming Message */}
          <h2
            id='onboarding-title'
            className='relative z-10 text-xl sm:text-2xl font-bold font-tajawal text-text-main mb-2.5'>
            تحديد الموقع الجغرافي
          </h2>
          <p
            id='onboarding-desc'
            className='relative z-10 text-xs sm:text-sm text-text-muted leading-relaxed mb-6 font-tajawal'>
            أهلاً بك في أذكاري. لضبط مواقيت الصلاة واتجاه القبلة بدقة، يرجى
            تحديد موقعك الجغرافي.
          </p>

          {/* Error Message Notice if auto-detect fails */}
          {geoError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className='relative z-10 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-right mb-4 flex items-start gap-2'>
              <i className='fas fa-circle-exclamation text-amber-400 mt-0.5'></i>
              <span className='leading-relaxed'>{geoError}</span>
            </motion.div>
          )}

          <div className='relative z-10 space-y-4'>
            {/* Primary Option: Auto-detect via shared GPS logic */}
            <button
              type='button'
              onClick={handleAutoDetect}
              disabled={gpsLoading}
              className='w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-gold/90 via-gold to-amber-500 text-bg-deep hover:opacity-95 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
              {gpsLoading ? (
                <>
                  <i className='fas fa-spinner animate-spin text-sm'></i>
                  <span>جاري تحديد موقعك الجغرافي...</span>
                </>
              ) : (
                <>
                  <i className='fas fa-location-crosshairs text-base'></i>
                  <span>تحديد الموقع تلقائياً</span>
                </>
              )}
            </button>

            {/* Separator Divider */}
            <div className='flex items-center gap-3 my-4'>
              <div className='flex-1 h-px bg-border-theme/70'></div>
              <span className='text-[11px] text-text-muted font-medium whitespace-nowrap'>
                أو اختيار مدينة يدوياً
              </span>
              <div className='flex-1 h-px bg-border-theme/70'></div>
            </div>

            {/* Secondary Option: Manual City Selection */}
            <div className='space-y-3'>
              <div className='relative text-right'>
                <label
                  htmlFor='onboarding-city-select'
                  className='block text-[11px] font-semibold text-text-muted mb-1.5'>
                  اختر من المدن الشائعة:
                </label>
                <div className='relative'>
                  <select
                    id='onboarding-city-select'
                    value={selectedCityKey}
                    onChange={(e) => setSelectedCityKey(e.target.value)}
                    className='w-full py-3 pr-4 pl-10 rounded-2xl bg-bg-elevated border border-border-theme text-text-main text-xs sm:text-sm font-medium focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition cursor-pointer appearance-none text-right'>
                    {POPULAR_CITIES.map((c) => (
                      <option
                        key={c.city}
                        value={c.city}
                        className='bg-bg-card text-text-main py-1.5'>
                        {c.label} ({c.countryLabel})
                      </option>
                    ))}
                  </select>
                  <div className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs'>
                    <i className='fas fa-chevron-down'></i>
                  </div>
                </div>
              </div>

              <button
                type='button'
                onClick={handleManualConfirm}
                className='w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-bg-elevated hover:bg-gold/15 text-text-main hover:text-gold border border-border-theme hover:border-gold/40 transition-colors cursor-pointer flex items-center justify-center gap-2'>
                <i className='fas fa-check text-xs text-gold'></i>
                <span>حفظ واختيار هذه المدينة</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalJSX, document.body);
}
