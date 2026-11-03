import React, { useState, useEffect, useCallback } from 'react';
import azkarData from './data/azkar-data.json';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Hero from './components/Hero';
import AzkarPanel from './components/AzkarPanel';
import TasbihPanel from './components/TasbihPanel';
import Footer from './components/Footer';
import ScrollTop from './components/ScrollTop';
import Toast from './components/Toast';

const PANELS = {
  morning: { title: 'أذكار الصباح', icon: 'fas fa-sun' },
  evening: { title: 'أذكار المساء', icon: 'fas fa-moon' },
  salah: { title: 'أذكار بعد الصلاة', icon: 'fas fa-kaaba' },
  sleep: { title: 'أذكار النوم', icon: 'fas fa-bed' },
  various: { title: 'أذكار متنوعة', icon: 'fas fa-gem' },
};

const TAB_TITLES = {
  morning: 'أذكار الصباح',
  evening: 'أذكار المساء',
  salah: 'أذكار بعد الصلاة',
  sleep: 'أذكار النوم',
  various: 'أذكار متنوعة',
  tasbih: 'التسبيح الرقمي',
};

const TAB_DESCRIPTIONS = {
  morning: 'أذكار الصباح من حصن المسلم - أذكار وأدعية الصباح لتحصين النفس وتقوية الإيمان. أذكار الصباح كاملة من الكتاب والسنة.',
  evening: 'أذكار المساء من حصن المسلم - أذكار وأدعية المساء للتحصين والحماية من الشرور. أذكار المساء كاملة من السنة النبوية.',
  salah: 'أذكار بعد الصلاة - أذكار وأدعية مشروعة بعد الصلوات الخمس المفروضة. أذكار ما بعد الصلاة من الكتاب والسنة.',
  sleep: 'أذكار النوم - أذكار قبل النوم ومنام المسلم من السنة النبوية. أذكار النوم والاستيقاظ كاملة.',
  various: 'أذكار متنوعة - مجموعة من الأذكار والأدعية الإسلامية لجميع المناسبات اليومية.',
  tasbih: 'التسبيح الرقمي - عداد تسبيح إلكتروني لتسبيح الله وذكر الله. سبحان الله وبحمده، سبحان الله العظيم.',
};

function getDefaultTab() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 17 && h < 21) return 'evening';
  if (h >= 21 || h < 5) return 'sleep';
  return 'morning';
}

function getInitialTheme() {
  const saved = localStorage.getItem('azkar-theme');
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [activeTab, setActiveTab] = useState(getDefaultTab);
  const [theme, setTheme] = useState(getInitialTheme);
  const [counters, setCounters] = useState({});
  const [toast, setToast] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Sync theme attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('azkar-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

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

  // Initialize title and description on mount
  useEffect(() => {
    switchTab(activeTab);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const decrementCounter = useCallback(
    (cardId, max) => {
      setCounters((prev) => {
        const current = prev[cardId] ?? max;
        if (current <= 0) return prev;

        const nextVal = current - 1;
        if (navigator.vibrate) navigator.vibrate(25);

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
      <Toast toast={toast} onClose={() => setToast(null)} />

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
