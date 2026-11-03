import React, { useState, useCallback } from 'react';
import azkarData from './data/azkar-data.json';
import { Header, MobileNav, Hero, Footer } from './components/layout';
import { Toast, ScrollTop } from './components/common';
import { AzkarPanel } from './features/azkar';
import { TasbihPanel } from './features/tasbih';
import { useTheme, useToast, useFavorites, useRouter } from './hooks';
import { triggerHaptic } from './utils/haptics';
import { PANELS } from './constants/tabs';

export default function App() {
  const { currentRoute: activeTab, navigate: switchTab } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, closeToast } = useToast();
  const { toggleFavorite, isFavorite, favoritesCount } = useFavorites(showToast);
  const [counters, setCounters] = useState({});
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
            showToast('ما شاء الله! اكتملت جميع الأذكار في هذا القسم <i class="fas fa-trophy text-gold"></i>');
          } else {
            showToast('أحسنت! اكتمل الذكر بحمد الله <i class="fas fa-check-circle text-gold"></i>');
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
      showToast('تمت إعادة تعيين جميع أذكار هذا القسم <i class="fas fa-rotate-left text-gold"></i>');
    },
    [showToast]
  );

  return (
    <div className="min-h-screen flex flex-col font-tajawal text-text-main selection:bg-gold/25 selection:text-text-arabic">
      <Toast toast={toast} onClose={closeToast} />

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

      <main id="main-content" className="flex-1 py-2 sm:py-4">
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
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                onShowToast={showToast}
              />
            );
          })
        )}
      </main>

      <ScrollTop />

      <Footer onShowToast={showToast} onSelectTab={switchTab} />
    </div>
  );
}
