import React, { useState, useEffect, useCallback } from 'react';
import azkarData from './data/azkar-data.json';
import { Header, MobileNav, Hero, Footer } from './components/layout';
import { Toast, ScrollTop } from './components/common';
import { AzkarPanel } from './features/azkar';
import { TasbihPanel } from './features/tasbih';
import { useTheme, useToast } from './hooks';
import { triggerHaptic } from './utils/haptics';
import {
  PANELS,
  TAB_TITLES,
  TAB_DESCRIPTIONS,
  getDefaultTab,
} from './constants/tabs';

export default function App() {
  const [activeTab, setActiveTab] = useState(getDefaultTab);
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, closeToast } = useToast();
  const [counters, setCounters] = useState({});
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update document title
    const mainTitle = 'أذكاري';
    const subTitle = TAB_TITLES[tab];
    document.title = subTitle ? `${mainTitle} | ${subTitle}` : mainTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && TAB_DESCRIPTIONS[tab]) {
      metaDescription.setAttribute('content', TAB_DESCRIPTIONS[tab]);
    }
  }, []);

  // Sync title and description on mount
  useEffect(() => {
    switchTab(activeTab);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const decrementCounter = useCallback(
    (cardId, max) => {
      setCounters((prev) => {
        const current = prev[cardId] ?? max;
        if (current <= 0) return prev;

        const nextVal = current - 1;
        triggerHaptic(25);

        const tabKey = cardId.split('-')[0];
        const nextCounters = { ...prev, [cardId]: nextVal };

        if (nextVal === 0) {
          const list = azkarData[tabKey] || [];
          const allDone = list.every((item, idx) => {
            const id = `${tabKey}-${idx}`;
            const val = id === cardId ? 0 : (nextCounters[id] ?? item.count);
            return val === 0;
          });

          if (allDone && list.length > 0) {
            showToast('ما شاء الله! اكتملت جميع الأذكار <i class="fas fa-trophy"></i>');
          } else {
            showToast('أحسنت! اكتمل الذكر <i class="fas fa-star"></i>');
          }
        }

        return nextCounters;
      });
    },
    [showToast]
  );

  const resetCardCounter = useCallback((cardId, max) => {
    setCounters((prev) => ({
      ...prev,
      [cardId]: max,
    }));
  }, []);

  const resetPanel = useCallback(
    (tabKey) => {
      const list = azkarData[tabKey] || [];
      setCounters((prev) => {
        const next = { ...prev };
        list.forEach((item, idx) => {
          next[`${tabKey}-${idx}`] = item.count;
        });
        return next;
      });
      showToast('تمت إعادة التعيين <i class="fas fa-check-circle"></i>');
    },
    [showToast]
  );

  return (
    <>
      <Toast toast={toast} onClose={closeToast} />

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTab={activeTab}
        onSelectTab={switchTab}
      />

      <Header
        activeTab={activeTab}
        onSelectTab={switchTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
      />

      <Hero activeTab={activeTab} />

      <main id="main-content">
        {activeTab === 'tasbih' ? (
          <TasbihPanel isActive={true} showToast={showToast} />
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
              />
            );
          })
        )}
      </main>

      <ScrollTop />

      <Footer onShowToast={showToast} />
    </>
  );
}
