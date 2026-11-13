import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { getAzkarByCategory } from './utils/azkar';
import { warmSavedAdhanAudio } from './utils/sound';
import {
  Header,
  MobileNav,
  Hero,
  Footer,
  AmbientBackground,
} from './components/layout';
import { Toast, ScrollTop } from './components/common';
import { AzkarPanel } from './features/azkar';
import { TasbihPanel } from './features/tasbih';
import { PrayerTimesPanel } from './features/prayers';
import { HomePage } from './features/home';
import {
  useTheme,
  useToast,
  useFavorites,
  useRouter,
  useAzkarCounters,
} from './hooks';
import { PANELS } from './constants/tabs';
import { MUEZZINS } from './constants/prayers';
import { PAGE_TRANSITION_VARIANTS } from './constants/motion';

export default function App() {
  const { currentRoute: activeTab, navigate: switchTab } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, closeToast } = useToast();
  const { toggleFavorite, isFavorite, favoritesCount } =
    useFavorites(showToast);
  const { counters, decrementCounter, resetCardCounter, resetPanel } =
    useAzkarCounters(showToast);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Pre-warm active muezzin Adhan audio during browser idle for instant playback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let idleId = null;
    const warm = () => warmSavedAdhanAudio(MUEZZINS);

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    idleId = setTimeout(warm, 1200);
    return () => clearTimeout(idleId);
  }, []);

  const renderActivePage = () => {
    if (activeTab === 'home') {
      return (
        <HomePage
          counters={counters}
          favoritesCount={favoritesCount}
          onSelectTab={switchTab}
          onShowToast={showToast}
        />
      );
    }

    if (activeTab === 'tasbih') {
      return (
        <TasbihPanel
          isActive={true}
          showToast={showToast}
        />
      );
    }

    if (activeTab === 'prayers') {
      return (
        <PrayerTimesPanel
          showToast={showToast}
          onSelectTab={switchTab}
        />
      );
    }

    const meta = PANELS[activeTab];
    if (!meta) return null;

    return (
      <AzkarPanel
        tabKey={activeTab}
        title={meta.title}
        icon={meta.icon}
        items={getAzkarByCategory(activeTab)}
        counters={counters}
        onDecrement={decrementCounter}
        onResetCard={resetCardCounter}
        onResetPanel={resetPanel}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onShowToast={showToast}
      />
    );
  };

  // Azkar category pages lead directly with their category banner, keeping Hero only on Tasbih & Prayers
  const showSharedHero = activeTab === 'tasbih' || activeTab === 'prayers';

  return (
    <MotionConfig reducedMotion='user'>
      <div className='relative min-h-screen w-full min-w-full flex flex-col font-tajawal text-text-main selection:bg-gold/25 selection:text-text-arabic'>
        <AmbientBackground />

        <Toast
          toast={toast}
          onClose={closeToast}
        />

        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          activeTab={activeTab}
          onSelectTab={switchTab}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <Header
          activeTab={activeTab}
          onSelectTab={switchTab}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          favoritesCount={favoritesCount}
        />

        <div className='relative z-10 flex-1 w-full flex flex-col'>
          <AnimatePresence initial={false}>
            {showSharedHero && (
              <motion.div
                key='shared-hero-banner'
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className='w-full'>
                <Hero activeTab={activeTab} />
              </motion.div>
            )}
          </AnimatePresence>

          <main
            id='main-content'
            className='flex-1 w-full py-2 sm:py-4'>
            <AnimatePresence
              mode='wait'
              initial={false}>
              <motion.div
                key={activeTab}
                variants={PAGE_TRANSITION_VARIANTS}
                initial='initial'
                animate='animate'
                exit='exit'
                className='w-full'>
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
          </main>

          <ScrollTop />

          <Footer
            onShowToast={showToast}
            onSelectTab={switchTab}
          />
        </div>
      </div>
    </MotionConfig>
  );
}
