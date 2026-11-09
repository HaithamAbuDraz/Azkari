import React, { useState, useCallback } from 'react';
import azkarData from './data/azkar-data.json';
import { Header, MobileNav, Hero, Footer } from './components/layout';
import { Toast, ScrollTop } from './components/common';
import { AzkarPanel } from './features/azkar';
import { TasbihPanel } from './features/tasbih';
import { PrayerTimesPanel } from './features/prayers';
import {
  useTheme,
  useToast,
  useFavorites,
  useRouter,
  useAzkarCounters,
} from './hooks';
import { PANELS } from './constants/tabs';

export default function App() {
  const { currentRoute: activeTab, navigate: switchTab } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, closeToast } = useToast();
  const { toggleFavorite, isFavorite, favoritesCount } =
    useFavorites(showToast);
  const { counters, decrementCounter, resetCardCounter, resetPanel } =
    useAzkarCounters(showToast);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className='min-h-screen flex flex-col font-tajawal text-text-main selection:bg-gold/25 selection:text-text-arabic'>
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

      <Hero activeTab={activeTab} />

      <main
        id='main-content'
        className='flex-1 py-2 sm:py-4'>
        {activeTab === 'tasbih' ? (
          <TasbihPanel
            isActive={true}
            showToast={showToast}
          />
        ) : activeTab === 'prayers' ? (
          <PrayerTimesPanel
            showToast={showToast}
            onSelectTab={switchTab}
          />
        ) : (
          Object.entries(PANELS).map(([tabKey, meta]) => {
            if (activeTab !== tabKey) return null;
            return (
              <AzkarPanel
                key={tabKey}
                tabKey={tabKey}
                title={meta.title}
                icon={meta.icon}
                items={azkarData[tabKey] || []}
                counters={counters}
                onDecrement={decrementCounter}
                onResetCard={resetCardCounter}
                onResetPanel={resetPanel}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                onShowToast={showToast}
              />
            );
          })
        )}
      </main>

      <ScrollTop />

      <Footer
        onShowToast={showToast}
        onSelectTab={switchTab}
      />
    </div>
  );
}
