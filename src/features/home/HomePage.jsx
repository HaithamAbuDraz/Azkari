import React from 'react';
import { useClock, usePrayerTimes } from '../../hooks';
import AdhanBanner from '../prayers/components/AdhanBanner';
import HomeHero from './components/HomeHero';
import QuickTrackerWidget from './components/QuickTrackerWidget';
import InteractiveZikrPreview from './components/InteractiveZikrPreview';
import SanctuaryPortalsGrid from './components/SanctuaryPortalsGrid';
import FeaturesShowcase from './components/FeaturesShowcase';
import ClosingInvitation from './components/ClosingInvitation';

/**
 * Azkari Homepage orchestrator uniting the glassmorphic sections.
 */
export default function HomePage({
  counters,
  favoritesCount,
  onSelectTab,
  onShowToast,
}) {
  const clock = useClock();
  const {
    prayerSchedule,
    hijriDate,
    location,
    currentMuezzin,
    isAdhanPlaying,
    activeAdhanPrayer,
    autoplayBlocked,
    startAdhan,
    stopAdhan,
    alertType,
  } = usePrayerTimes(onShowToast);

  return (
    <div className='relative w-full pb-4 sm:pb-8'>
      <HomeHero
        clock={clock}
        prayerSchedule={prayerSchedule}
        hijriDate={hijriDate}
        location={location}
        favoritesCount={favoritesCount}
        onSelectTab={onSelectTab}
      />

      <QuickTrackerWidget
        counters={counters}
        onSelectTab={onSelectTab}
        onShowToast={onShowToast}
      />

      <InteractiveZikrPreview
        onSelectTab={onSelectTab}
        onShowToast={onShowToast}
      />

      <SanctuaryPortalsGrid
        counters={counters}
        prayerSchedule={prayerSchedule}
        onSelectTab={onSelectTab}
      />

      <FeaturesShowcase />

      <ClosingInvitation
        onSelectTab={onSelectTab}
        onShowToast={onShowToast}
      />

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
    </div>
  );
}
