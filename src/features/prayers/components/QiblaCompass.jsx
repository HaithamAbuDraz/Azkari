import React, { useState, useEffect, useCallback } from 'react';

export default function QiblaCompass({ qibla, location }) {
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [hasCompassSensor, setHasCompassSensor] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);

  // Direction to Kaaba from True North (0-360)
  const qiblaAngle = qibla?.direction ?? 0;

  // Calculate needle rotation: if live compass heading is available, adjust relative to device orientation
  const compassRotation =
    deviceHeading !== null
      ? (qiblaAngle - deviceHeading + 360) % 360
      : qiblaAngle;

  // Determine compass cardinal direction text in Arabic
  const getCardinalText = (deg) => {
    if (deg >= 337.5 || deg < 22.5) return 'شمال';
    if (deg >= 22.5 && deg < 67.5) return 'شمال شرق';
    if (deg >= 67.5 && deg < 112.5) return 'شرق';
    if (deg >= 112.5 && deg < 157.5) return 'جنوب شرق';
    if (deg >= 157.5 && deg < 202.5) return 'جنوب';
    if (deg >= 202.5 && deg < 247.5) return 'جنوب غرب';
    if (deg >= 247.5 && deg < 292.5) return 'غرب';
    return 'شمال غرب';
  };

  const handleOrientation = useCallback((e) => {
    let heading = null;
    if (e.webkitCompassHeading !== undefined) {
      // iOS WebKit
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      // Standard Android / Chrome
      heading = 360 - e.alpha;
    }

    if (heading !== null) {
      setDeviceHeading(Math.round(heading));
      setHasCompassSensor(true);
    }
  }, []);

  const enableCompass = async () => {
    // Check for iOS 13+ permission model
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setSensorActive(true);
        }
      } catch (err) {
        console.warn('Compass permission error:', err);
      }
    } else if ('ondeviceorientationabsolute' in window) {
      window.addEventListener(
        'deviceorientationabsolute',
        handleOrientation,
        true
      );
      setSensorActive(true);
    } else if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setSensorActive(true);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if ('ondeviceorientationabsolute' in window) {
        window.removeEventListener(
          'deviceorientationabsolute',
          handleOrientation,
          true
        );
      }
    };
  }, [handleOrientation]);

  return (
    <div className='p-6 sm:p-7 rounded-3xl bg-bg-card border border-border-theme shadow-xs mb-8 transition-colors flex flex-col md:flex-row items-center justify-between gap-8'>
      {/* Visual Compass Dial */}
      <div className='relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none'>
        {/* Outer Dial Ring */}
        <div className='absolute inset-0 rounded-full border-2 border-border-theme/70 bg-gradient-to-b from-bg-elevated to-bg-card flex items-center justify-center shadow-inner'>
          {/* Degree Ticks */}
          <div className='absolute inset-2 rounded-full border border-dashed border-border-theme/40' />

          {/* Cardinal Points */}
          <span className='absolute top-3 font-bold text-xs text-primary'>
            ش (0°)
          </span>
          <span className='absolute bottom-3 font-bold text-xs text-text-muted'>
            ج (180°)
          </span>
          <span className='absolute right-3 font-bold text-xs text-text-muted'>
            شـ (90°)
          </span>
          <span className='absolute left-3 font-bold text-xs text-text-muted'>
            غ (270°)
          </span>
        </div>

        {/* Needle / Kaaba Direction Indicator */}
        <div
          className='absolute inset-6 flex items-center justify-center transition-transform duration-500 ease-out pointer-events-none'
          style={{ transform: `rotate(${compassRotation}deg)` }}>
          {/* Kaaba Marker at target angle */}
          <div className='absolute -top-1 flex flex-col items-center'>
            <div className='w-8 h-8 rounded-xl bg-gold text-bg-deep flex items-center justify-center shadow-md animate-pulse border border-gold-bright'>
              <i className='fas fa-kaaba text-xs'></i>
            </div>
            <span className='text-[10px] font-bold text-gold mt-1'>القبلة</span>
          </div>

          {/* Pointer Needle line */}
          <div className='w-1 h-28 bg-gradient-to-t from-transparent via-gold/50 to-gold rounded-full' />
        </div>

        {/* Center Pivot */}
        <div className='w-8 h-8 rounded-full bg-bg-card border-2 border-gold flex items-center justify-center z-10 shadow-md'>
          <div className='w-2.5 h-2.5 rounded-full bg-gold' />
        </div>
      </div>

      {/* Qibla Details & Sensor Button */}
      <div className='flex-1 flex flex-col items-center md:items-start text-center md:text-right'>
        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 border border-gold/30 text-gold mb-3'>
          <i className='fas fa-compass text-xs'></i>
          <span>بوصلة القبلة الدقيقة</span>
        </div>

        <h3 className='text-2xl sm:text-3xl font-bold font-tajawal text-text-main mb-2'>
          اتجاه الكعبة المشرفة: {qiblaAngle}° {getCardinalText(qiblaAngle)}
        </h3>

        <p className='text-xs sm:text-sm text-text-muted max-w-md mb-4 leading-relaxed'>
          المسافة المباشرة إلى المسجد الحرام بمكة المكرمة تقريباً{' '}
          <strong className='text-text-main font-mono'>
            {qibla.distanceKm.toLocaleString('ar-EG')} كم
          </strong>
          . وجّه جهازك أو سجادة صلاتك باتجاه المؤشر الذهبي.
        </p>

        {/* Sensor activation on mobile */}
        {!sensorActive ? (
          <button
            type='button'
            onClick={enableCompass}
            className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-bg-elevated border border-border-theme hover:border-gold/40 hover:text-gold active:scale-95 transition cursor-pointer shadow-2xs'>
            <i className='fas fa-mobile-screen-button text-xs'></i>
            <span>تفعيل بوصلة الجوال المباشرة</span>
          </button>
        ) : (
          <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'>
            <span className='w-2 h-2 rounded-full bg-emerald-400 animate-ping' />
            <span>البوصلة المباشرة مفعلة</span>
          </span>
        )}
      </div>
    </div>
  );
}
