import React, { useState } from 'react';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import NextPrayerHero from './components/NextPrayerHero';
import PrayerCardsGrid from './components/PrayerCardsGrid';
import QiblaCompass from './components/QiblaCompass';
import LocationModal from './components/LocationModal';

export default function PrayerTimesPanel({ showToast, onSelectTab }) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const {
    location,
    hijriDate,
    loading,
    error,
    gpsLoading,
    audioEnabled,
    setAudioEnabled,
    requestGpsLocation,
    selectCity,
    setMethod,
    refetch,
    prayerSchedule,
    qibla,
  } = usePrayerTimes(showToast);

  return (
    <section
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
      role='tabpanel'
      aria-label='مواقيت الصلاة والقبلة'>
      {/* Top Banner / Location bar */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-bg-card border border-border-theme shadow-xs mb-6 sm:mb-8 transition-colors'>
        <div className='flex items-center gap-3.5'>
          <div className='w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xl shadow-2xs'>
            <i className='fas fa-mosque'></i>
          </div>
          <div>
            <h2 className='text-xl sm:text-2xl font-bold font-tajawal text-text-main flex items-center gap-2'>
              <span>مواقيت الصلاة والقبلة</span>
            </h2>
            <p className='text-xs sm:text-sm text-text-muted mt-0.5'>
              حسب توقيت مدينة{' '}
              <strong className='text-text-main font-semibold'>
                {location.label || location.city}
              </strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className='flex items-center gap-2.5 flex-wrap'>
          {/* Change Location Button */}
          <button
            type='button'
            onClick={() => setIsLocationModalOpen(true)}
            aria-label='تغيير المدينة'
            className='flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-theme text-text-main hover:text-gold hover:border-gold/40 bg-bg-elevated transition cursor-pointer active:scale-95 shadow-2xs'>
            <i className='fas fa-location-dot text-gold text-xs'></i>
            <span>تغيير المدينة</span>
          </button>

          {/* Refresh Button */}
          <button
            type='button'
            onClick={refetch}
            aria-label='تحديث المواقيت'
            title='تحديث المواقيت الآن'
            className='w-9 h-9 rounded-xl border border-border-theme flex items-center justify-center text-text-muted hover:text-text-main hover:bg-bg-elevated transition cursor-pointer active:scale-95'>
            <i
              className={`fas fa-rotate-right text-xs ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Offline / Error notice if any */}
      {error && (
        <div className='p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm mb-6 flex items-center gap-2.5'>
          <i className='fas fa-circle-exclamation text-amber-400 text-sm'></i>
          <span>{error}</span>
        </div>
      )}

      {/* Main Countdown Hero Card */}
      <NextPrayerHero
        prayerSchedule={prayerSchedule}
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        hijriDate={hijriDate}
      />

      {/* 6 Prayer Times Cards Grid */}
      <PrayerCardsGrid prayerSchedule={prayerSchedule} />

      {/* Qibla Direction Compass Card */}
      <QiblaCompass
        qibla={qibla}
        location={location}
      />

      {/* Link to After-Prayer Azkar */}
      {onSelectTab && (
        <div className='p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-bg-card to-gold/10 border border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-xs'>
          <div className='flex items-center gap-3.5'>
            <div className='w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center text-base'>
              <i className='fas fa-kaaba'></i>
            </div>
            <div>
              <h4 className='font-bold text-base text-text-main'>
                أذكار ما بعد الصلوات المفروضة
              </h4>
              <p className='text-xs text-text-muted mt-0.5'>
                حصّن صلاتك بالأذكار والأدعية الواردة عن النبي ﷺ بعد السلام
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={() => onSelectTab('salah')}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gold text-bg-deep hover:bg-gold-bright active:scale-95 transition cursor-pointer shadow-xs'>
            <span>انتقل لأذكار بعد الصلاة</span>
            <i className='fas fa-arrow-left text-xs'></i>
          </button>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectCity={selectCity}
        onRequestGps={requestGpsLocation}
        isGpsLoading={gpsLoading}
        currentMethod={location.method || 4}
        onSelectMethod={setMethod}
      />
    </section>
  );
}
