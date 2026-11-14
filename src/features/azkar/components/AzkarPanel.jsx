import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AzkarCard from './AzkarCard';
import { matchesArabicSearch } from '../../../utils/arabic';
import { getLocalDateKey } from '../../../utils/azkar';
import { fireSpiritualConfetti } from '../../../utils/celebrate';
import { CARD_HOVER_SPRING, EASE_SPIRITUAL } from '../../../constants/motion';

const FILTER_OPTIONS = [
  { id: 'all', label: 'الكل' },
  { id: 'in_progress', label: 'قيد القراءة' },
  { id: 'completed', label: 'المكتملة' },
  { id: 'favorites', label: 'المفضلة', hasHeart: true },
];

export default function AzkarPanel({
  tabKey,
  title,
  icon,
  items = [],
  counters,
  onDecrement,
  onResetCard,
  onResetPanel,
  isFavorite,
  onToggleFavorite,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'in_progress' | 'completed' | 'favorites'
  const [resumedCardId, setResumedCardId] = useState(null);
  const hasAutoScrolledRef = useRef(false);

  const total = items.length;

  // Calculate done count
  const done = useMemo(() => {
    return items.filter((zikr, idx) => {
      const cardId = zikr.cardId || `${tabKey}-${idx}`;
      const rem = counters[cardId] ?? zikr.count;
      return rem === 0;
    }).length;
  }, [items, counters, tabKey]);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Automatically scroll and direct user to the next/last read zikr on page refresh / load
  useEffect(() => {
    if (hasAutoScrolledRef.current) return;
    if (items.length === 0) return;

    // Turn off browser native scroll restoration so it doesn't fight our scroll
    if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const todayKey = getLocalDateKey();
    let targetCardId = null;

    // 1. Check if there is stored last-active info for this category today
    try {
      const stored = localStorage.getItem('azkari-last-active-zikr');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.date === todayKey && parsed?.tabKey === tabKey) {
          // If nextCardId is unfinished, prefer it
          if (parsed.nextCardId) {
            const nextItem = items.find(
              (it, idx) =>
                (it.cardId || `${tabKey}-${idx}`) === parsed.nextCardId
            );
            if (nextItem) {
              const rem = counters[parsed.nextCardId] ?? nextItem.count;
              if (rem > 0) {
                targetCardId = parsed.nextCardId;
              }
            }
          }
          // Or if cardId itself is unfinished, prefer it
          if (!targetCardId && parsed.cardId) {
            const curItem = items.find(
              (it, idx) => (it.cardId || `${tabKey}-${idx}`) === parsed.cardId
            );
            if (curItem) {
              const rem = counters[parsed.cardId] ?? curItem.count;
              if (rem > 0) {
                targetCardId = parsed.cardId;
              }
            }
          }
        }
      }
    } catch {
      // Ignore storage errors
    }

    // 2. Fallback: If at least 1 card is completed or started, find the FIRST incomplete card
    if (!targetCardId) {
      const anyStartedOrDone = items.some((it, idx) => {
        const cid = it.cardId || `${tabKey}-${idx}`;
        const rem = counters[cid] ?? it.count;
        return rem < it.count;
      });
      const allDone = items.every((it, idx) => {
        const cid = it.cardId || `${tabKey}-${idx}`;
        return (counters[cid] ?? it.count) === 0;
      });

      if (anyStartedOrDone && !allDone) {
        const firstIncomplete = items.find((it, idx) => {
          const cid = it.cardId || `${tabKey}-${idx}`;
          return (counters[cid] ?? it.count) > 0;
        });
        if (firstIncomplete) {
          targetCardId =
            firstIncomplete.cardId || `${tabKey}-${firstIncomplete.id}`;
        }
      }
    }

    if (!targetCardId) return;

    let attempts = 0;
    const maxAttempts = 30; // 30 * 60ms = 1.8s polling window
    let highlightTimer = null;
    let backupTimer = null;

    const intervalId = setInterval(() => {
      attempts++;
      const element =
        document.getElementById(`card-${targetCardId}`) ||
        document.querySelector(`[data-card-id="${targetCardId}"]`);

      if (element) {
        clearInterval(intervalId);
        hasAutoScrolledRef.current = true;

        // Perform smooth center scroll to target card
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setResumedCardId(targetCardId);

        // Backup adjustment after 320ms in case layout shifted during image/font loads
        backupTimer = setTimeout(() => {
          const rect = element.getBoundingClientRect();
          if (rect.top < 60 || rect.bottom > window.innerHeight) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 320);

        highlightTimer = setTimeout(() => {
          setResumedCardId(null);
        }, 4000);
      } else if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, 60);

    return () => {
      clearInterval(intervalId);
      if (backupTimer) clearTimeout(backupTimer);
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, [items, tabKey, counters]);

  // Trigger celebratory confetti only when crossing to 100% completion
  const prevPctRef = useRef(pct);
  useEffect(() => {
    if (prevPctRef.current < 100 && pct === 100 && total > 0) {
      fireSpiritualConfetti({ y: 0.7 });
    }
    prevPctRef.current = pct;
  }, [pct, total]);

  // Filter items based on search query and filter mode
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items
      .map((zikr, idx) => ({
        zikr,
        originalIdx: idx,
        cardId: zikr.cardId || `${tabKey}-${idx}`,
      }))
      .filter(({ zikr, cardId }) => {
        const remaining = counters[cardId] ?? zikr.count;
        const isCardFavorite = isFavorite ? isFavorite(cardId) : false;

        if (filterMode === 'in_progress' && remaining === 0) return false;
        if (filterMode === 'completed' && remaining > 0) return false;
        if (filterMode === 'favorites' && !isCardFavorite) return false;

        if (!query) return true;
        const textMatch = matchesArabicSearch(zikr.arabic, query);
        const benefitMatch = matchesArabicSearch(zikr.benefit, query);
        const sourceMatch = matchesArabicSearch(zikr.source, query);
        const tagsMatch = Array.isArray(zikr.tags)
          ? zikr.tags.some((tag) => matchesArabicSearch(tag, query))
          : false;
        return textMatch || benefitMatch || sourceMatch || tagsMatch;
      });
  }, [items, tabKey, counters, isFavorite, filterMode, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterMode('all');
  };

  const filterCountFor = (id) => {
    if (id === 'all') return total;
    if (id === 'in_progress') return total - done;
    if (id === 'completed') return done;
    return null;
  };

  return (
    <section
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
      role='tabpanel'>
      {/* Category Progress & Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_SPIRITUAL }}
        className='flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-7 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme shadow-xs mb-6 sm:mb-8 transition-colors'>
        <div className='flex items-center gap-3.5'>
          <motion.div
            whileHover={{ rotate: 8, scale: 1.06 }}
            transition={CARD_HOVER_SPRING}
            className='w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xl shadow-2xs shrink-0'>
            <i className={icon}></i>
          </motion.div>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold font-tajawal text-text-main flex items-center gap-2'>
              <span>{title}</span>
            </h1>
            <p className='text-xs sm:text-sm text-text-muted mt-0.5'>
              {pct === 100
                ? 'ما شاء الله! اكتملت جميع أذكار هذا القسم'
                : `تم إنجاز ${done} من أصل ${total} ذكراً`}
            </p>
          </div>
        </div>

        {/* Progress bar & Reset all button */}
        <div className='flex items-center gap-3 sm:gap-4 flex-wrap'>
          <div className='flex items-center gap-2.5'>
            <span className='text-xs sm:text-sm font-bold font-mono text-text-main min-w-[3.5rem] text-left'>
              {pct}%
            </span>
            <div
              className='w-32 sm:w-44 h-2.5 rounded-full bg-bg-elevated overflow-hidden border border-border-theme/60 relative'
              role='progressbar'
              aria-valuenow={pct}
              aria-valuemin='0'
              aria-valuemax='100'
              aria-label={`نسبة إنجاز أذكار ${title}`}>
              <motion.div
                className='h-full bg-gradient-to-l from-gold to-primary rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.55, ease: EASE_SPIRITUAL }}
              />
            </div>
          </div>

          <motion.button
            type='button'
            onClick={() => onResetPanel(tabKey)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            aria-label='إعادة تعيين جميع أذكار هذا القسم'
            className='flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-theme text-text-muted hover:text-gold hover:border-gold/40 bg-bg-elevated/70 transition-colors cursor-pointer shadow-2xs'>
            <i className='fas fa-rotate-left text-[11px]'></i>
            <span>إعادة تعيين الكل</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Search and Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.06, ease: EASE_SPIRITUAL }}
        className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 sm:mb-8'>
        {/* Search Input Box */}
        <div className='relative flex-1 max-w-md'>
          <div className='absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted'>
            <i className='fas fa-magnifying-glass text-xs text-gold/80'></i>
          </div>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='ابحث في نص الذكر، الفضل، أو المصدر...'
            aria-label='البحث في الأذكار'
            className='w-full pl-9 pr-9 py-2.5 rounded-2xl bg-bg-card border border-border-theme text-xs sm:text-sm text-text-main placeholder:text-text-muted/70 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 shadow-2xs transition-colors'
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type='button'
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setSearchQuery('')}
                aria-label='مسح البحث'
                className='absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted hover:text-text-main cursor-pointer'>
                <i className='fas fa-times-circle text-xs'></i>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Pills with Sliding Indicator */}
        <div
          className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none'
          role='group'
          aria-label='تصفية الأذكار'>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = filterMode === opt.id;
            const countNum = filterCountFor(opt.id);
            return (
              <button
                key={opt.id}
                type='button'
                onClick={() => setFilterMode(opt.id)}
                className={`relative z-10 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                  isActive
                    ? 'text-primary border-transparent font-semibold'
                    : opt.hasHeart
                      ? 'bg-bg-card border-border-theme text-text-muted hover:text-rose-500 hover:bg-bg-elevated'
                      : 'bg-bg-card border-border-theme text-text-muted hover:text-text-main hover:bg-bg-elevated'
                }`}>
                {isActive && (
                  <motion.span
                    layoutId={`azkar-filter-${tabKey}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className='absolute inset-0 rounded-xl bg-primary/15 border border-primary/30 shadow-2xs -z-10'
                  />
                )}
                {opt.hasHeart && (
                  <i className='fas fa-heart text-[10px] text-rose-500'></i>
                )}
                <span>
                  {opt.label}
                  {countNum !== null ? ` (${countNum})` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Cards Grid or Empty Search State */}
      <AnimatePresence mode='wait'>
        {filteredItems.length === 0 ? (
          <motion.div
            key='azkar-empty'
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className='text-center py-16 px-4 rounded-3xl bg-bg-card border border-border-theme/70 max-w-lg mx-auto flex flex-col items-center shadow-xs'>
            <div className='w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-2xl mb-4'>
              <i className='fas fa-magnifying-glass'></i>
            </div>
            <h3 className='text-lg font-bold text-text-main mb-1'>
              لم نجد أذكاراً مطابقة
            </h3>
            <p className='text-xs sm:text-sm text-text-muted mb-6 max-w-sm leading-relaxed'>
              {searchQuery
                ? `لا توجد نتائج لبحثك عن "${searchQuery}". جرّب استخدام كلمات أخرى.`
                : 'لا توجد أذكار مطابقة للتصفية المختارة حالياً.'}
            </p>
            <motion.button
              type='button'
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className='px-5 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 text-xs font-semibold transition cursor-pointer'>
              عرض جميع أذكار هذا القسم
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key={`${filterMode}-${searchQuery.trim() ? 'filtered' : 'list'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
            className='grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6'>
            {filteredItems.map(({ zikr, cardId }, filteredIndex) => {
              const remaining = counters[cardId] ?? zikr.count;
              return (
                <AzkarCard
                  key={cardId}
                  zikr={zikr}
                  index={filteredIndex}
                  cardId={cardId}
                  remaining={remaining}
                  onDecrement={onDecrement}
                  onReset={onResetCard}
                  isFavorite={isFavorite ? isFavorite(cardId) : false}
                  onToggleFavorite={onToggleFavorite}
                  onShowToast={onShowToast}
                  isResumed={resumedCardId === cardId}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
