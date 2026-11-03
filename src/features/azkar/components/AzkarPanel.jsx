import React, { useState, useMemo } from 'react';
import AzkarCard from './AzkarCard';

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

  const total = items.length;

  // Calculate done count
  const done = useMemo(() => {
    return items.filter((zikr, idx) => {
      const cardId = `${tabKey}-${idx}`;
      const rem = counters[cardId] ?? zikr.count;
      return rem === 0;
    }).length;
  }, [items, counters, tabKey]);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Filter items based on search query and filter mode
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items
      .map((zikr, idx) => ({ zikr, originalIdx: idx, cardId: `${tabKey}-${idx}` }))
      .filter(({ zikr, cardId }) => {
        const remaining = counters[cardId] ?? zikr.count;
        const isCardFavorite = isFavorite ? isFavorite(cardId) : false;

        // Apply filter mode
        if (filterMode === 'in_progress' && remaining === 0) return false;
        if (filterMode === 'completed' && remaining > 0) return false;
        if (filterMode === 'favorites' && !isCardFavorite) return false;

        // Apply search query
        if (!query) return true;
        const textMatch = (zikr.arabic || '').toLowerCase().includes(query);
        const benefitMatch = (zikr.benefit || '').toLowerCase().includes(query);
        const sourceMatch = (zikr.source || '').toLowerCase().includes(query);
        return textMatch || benefitMatch || sourceMatch;
      });
  }, [items, tabKey, counters, isFavorite, filterMode, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterMode('all');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" role="tabpanel">
      {/* Category Progress & Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-7 rounded-3xl bg-bg-card border border-border-theme shadow-xs mb-6 sm:mb-8 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xl shadow-2xs">
            <i className={icon}></i>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-text-main flex items-center gap-2">
              <span>{title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              {pct === 100
                ? 'ما شاء الله! اكتملت جميع أذكار هذا القسم'
                : `تم إنجاز ${done} من أصل ${total} ذكراً`}
            </p>
          </div>
        </div>

        {/* Progress bar & Reset all button */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Progress percentage pill */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold font-mono text-text-main min-w-[3.5rem] text-left">
              {pct}%
            </span>
            <div
              className="w-32 sm:w-44 h-2.5 rounded-full bg-bg-elevated overflow-hidden border border-border-theme/60 relative"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`نسبة إنجاز أذكار ${title}`}
            >
              <div
                className="h-full bg-gradient-to-l from-gold to-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Reset All in Category button */}
          <button
            type="button"
            onClick={() => onResetPanel(tabKey)}
            aria-label="إعادة تعيين جميع أذكار هذا القسم"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-theme text-text-muted hover:text-gold hover:border-gold/40 bg-bg-elevated/70 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <i className="fas fa-rotate-left text-[11px]"></i>
            <span>إعادة تعيين الكل</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted">
            <i className="fas fa-magnifying-glass text-xs text-gold/80"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نص الذكر، الفضل، أو المصدر..."
            aria-label="البحث في الأذكار"
            className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-bg-card border border-border-theme text-xs sm:text-sm text-text-main placeholder:text-text-muted/70 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 shadow-2xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="مسح البحث"
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted hover:text-text-main cursor-pointer"
            >
              <i className="fas fa-times-circle text-xs"></i>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
          role="group"
          aria-label="تصفية الأذكار"
        >
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-2xs'
                : 'bg-bg-card border border-border-theme text-text-muted hover:text-text-main hover:bg-bg-elevated'
            }`}
          >
            الكل ({total})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              filterMode === 'in_progress'
                ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-2xs'
                : 'bg-bg-card border border-border-theme text-text-muted hover:text-text-main hover:bg-bg-elevated'
            }`}
          >
            قيد القراءة ({total - done})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              filterMode === 'completed'
                ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-2xs'
                : 'bg-bg-card border border-border-theme text-text-muted hover:text-text-main hover:bg-bg-elevated'
            }`}
          >
            المكتملة ({done})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterMode === 'favorites'
                ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-2xs'
                : 'bg-bg-card border border-border-theme text-text-muted hover:text-rose-500 hover:bg-bg-elevated'
            }`}
          >
            <i className="fas fa-heart text-[10px] text-rose-500"></i>
            <span>المفضلة</span>
          </button>
        </div>
      </div>

      {/* Cards Grid or Empty Search State */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-bg-card border border-border-theme/70 max-w-lg mx-auto flex flex-col items-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-2xl mb-4">
            <i className="fas fa-magnifying-glass"></i>
          </div>
          <h3 className="text-lg font-bold text-text-main mb-1">
            لم نجد أذكاراً مطابقة
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mb-6 max-w-sm leading-relaxed">
            {searchQuery
              ? `لا توجد نتائج لبحثك عن "${searchQuery}". جرّب استخدام كلمات أخرى.`
              : 'لا توجد أذكار مطابقة للتصفية المختارة حالياً.'}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 text-xs font-semibold transition cursor-pointer active:scale-95"
          >
            عرض جميع أذكار هذا القسم
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {filteredItems.map(({ zikr, originalIdx, cardId }) => {
            const remaining = counters[cardId] ?? zikr.count;
            return (
              <AzkarCard
                key={cardId}
                zikr={zikr}
                index={originalIdx}
                cardId={cardId}
                remaining={remaining}
                onDecrement={onDecrement}
                onReset={onResetCard}
                isFavorite={isFavorite ? isFavorite(cardId) : false}
                onToggleFavorite={onToggleFavorite}
                onShowToast={onShowToast}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
