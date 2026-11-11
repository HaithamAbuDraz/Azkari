import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CARD_HOVER_SPRING, EASE_SPIRITUAL } from '../../constants/motion';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { getDisplayCityName } from '../../utils/location';
import NextPrayerHero from './components/NextPrayerHero';
import PrayerCardsGrid from './components/PrayerCardsGrid';
import QiblaCompass from './components/QiblaCompass';
import LocationModal from './components/LocationModal';
import AdhanBanner from './components/AdhanBanner';

export default function PrayerTimesPanel({ showToast, onSelectTab }) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('location');

  const handleOpenModal = (tab = 'location') => {
    setModalInitialTab(tab);
    setIsLocationModalOpen(true);
  };

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
    alertType,
    setAlertType,
    muezzinId,
    setMuezzinId,
    currentMuezzin,
    isAdhanPlaying,
    playingMuezzinId,
    isAudioLoading,
    activeAdhanPrayer,
    autoplayBlocked,
    startAdhan,
    stopAdhan,
    toggleAdhanTest,
    previewAlert,
    previewMuezzin,
  } = usePrayerTimes(showToast);

  const cityName = getDisplayCityName(location);

  return (
    <section
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
      role='tabpanel'
      aria-label='مواقيت الصلاة والقبلة'>
      {/* Top Banner / Location bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_SPIRITUAL }}
        className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme shadow-xs mb-6 sm:mb-8 transition-colors'>
        <div className='flex items-center gap-3.5'>
          <div className='w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xl shadow-2xs'>
            <i className='fas fa-mosque'></i>
          </div>
          <div>
            <h2 className='text-xl sm:text-2xl font-bold font-tajawal text-text-main flex items-center gap-2'>
              <span>مواقيت الصلاة والقبلة</span>
            </h2>
            <p className='text-xs sm:text-sm text-text-muted mt-0.5'>
              {gpsLoading ? (
                <span className='inline-flex items-center gap-1.5 text-gold'>
                  <i className='fas fa-spinner fa-spin text-[11px]'></i>
                  <span>جاري تحديد مدينتك الحالية...</span>
                </span>
              ) : cityName ? (
                <>
                  حسب توقيت مدينة{' '}
                  <strong className='text-text-main font-semibold'>
                    {cityName}
                  </strong>
                </>
              ) : (
                <>حسب توقيت موقعك الحالي</>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Choose City & Location Button */}
          <button
            type='button'
            onClick={() => handleOpenModal('location')}
            aria-label='اختيار المدينة والموقع'
            className='flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-theme text-text-main hover:text-gold hover:border-gold/40 bg-bg-elevated transition cursor-pointer active:scale-95 shadow-2xs'>
            <i className='fas fa-location-dot text-gold text-xs'></i>
            <span>اختيار المدينة والموقع</span>
          </button>

          {/* Other Button: Prayer & Adhan Options */}
          <button
            type='button'
            onClick={() => handleOpenModal('settings')}
            aria-label='خيارات المواقيت والأذان'
            className='flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-theme text-text-main hover:text-gold hover:border-gold/40 bg-bg-elevated transition cursor-pointer active:scale-95 shadow-2xs'>
            <i className='fas fa-sliders text-gold text-xs'></i>
            <span>خيارات المواقيت والأذان</span>
          </button>

          {/* Refresh Button */}
          <motion.button
            type='button'
            whileTap={{ scale: 0.92 }}
            onClick={refetch}
            aria-label='تحديث المواقيت'
            title='تحديث المواقيت الآن'
            className='w-9 h-9 rounded-xl border border-border-theme flex items-center justify-center text-text-muted hover:text-text-main hover:bg-bg-elevated transition cursor-pointer'>
            <i
              className={`fas fa-rotate-right text-xs ${loading ? 'animate-spin' : ''}`}></i>
          </motion.button>
        </div>
      </motion.div>

      {/* Offline / Error notice if any */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className='p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm mb-6 flex items-center gap-2.5'>
            <i className='fas fa-circle-exclamation text-amber-400 text-sm'></i>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Countdown Hero Card */}
      <NextPrayerHero
        prayerSchedule={prayerSchedule}
        location={location}
        onOpenLocationModal={handleOpenModal}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        hijriDate={hijriDate}
        isAdhanPlaying={isAdhanPlaying}
        isAudioLoading={isAudioLoading && !playingMuezzinId}
        onToggleAdhanTest={toggleAdhanTest}
        alertType={alertType}
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
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -3 }}
          transition={CARD_HOVER_SPRING}
          className='p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-bg-card/90 to-gold/10 backdrop-blur-md border border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-xs'>
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
          <motion.button
            type='button'
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTab('salah')}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gold text-bg-deep hover:bg-gold-bright transition cursor-pointer shadow-xs'>
            <span>انتقل لأذكار بعد الصلاة</span>
            <i className='fas fa-arrow-left text-xs'></i>
          </motion.button>
        </motion.div>
      )}

      {/* Floating Adhan Alert Banner when prayer arrives or is playing */}
      <AdhanBanner
        isAdhanPlaying={isAdhanPlaying}
        activePrayer={activeAdhanPrayer}
        autoplayBlocked={autoplayBlocked}
        onStartAdhan={startAdhan}
        onStopAdhan={stopAdhan}
        currentMuezzin={currentMuezzin}
        onSelectTab={onSelectTab}
        alertType={alertType}
      />

      {/* Location & Audio Settings Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        initialTab={modalInitialTab}
        currentLocation={location}
        onSelectCity={selectCity}
        onRequestGps={requestGpsLocation}
        isGpsLoading={gpsLoading}
        currentMethod={location.method || 4}
        onSelectMethod={setMethod}
        currentMuezzinId={muezzinId}
        onSelectMuezzin={setMuezzinId}
        currentAlertType={alertType}
        onSelectAlertType={setAlertType}
        onPreviewAlert={previewAlert}
        onPreviewMuezzin={previewMuezzin}
        isAdhanPlaying={isAdhanPlaying}
        playingMuezzinId={playingMuezzinId}
        isAudioLoading={isAudioLoading}
        onStopAudio={stopAdhan}
      />
    </section>
  );
}
