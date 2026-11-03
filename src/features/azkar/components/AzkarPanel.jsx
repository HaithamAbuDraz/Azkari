import React from 'react';
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
}) {
  const total = items.length;
  const done = items.filter((zikr, idx) => {
    const cardId = `${tabKey}-${idx}`;
    const rem = counters[cardId] ?? zikr.count;
    return rem === 0;
  }).length;

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-4" role="tabpanel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 md:p-6 rounded-2xl bg-bg-card border border-border-theme shadow-sm">
        <h2 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-gold-bright">
          <i className={icon}></i> {title}
        </h2>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="text-xs md:text-sm text-text-muted font-semibold min-w-[3.5rem]">
            {done} / {total}
          </span>
          <div
            className="w-28 sm:w-44 h-3 rounded-full bg-bg-deep overflow-hidden border border-border-theme/50 relative"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="h-full bg-gradient-to-l from-gold-bright to-teal-brand rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm rounded-xl border border-border-theme text-text-muted hover:text-gold-bright hover:border-gold-bright/40 bg-bg-deep/60 transition cursor-pointer active:scale-95"
            onClick={() => onResetPanel(tabKey)}
          >
            <i className="fas fa-sync-alt text-xs"></i> إعادة تعيين
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {items.map((zikr, idx) => {
          const cardId = `${tabKey}-${idx}`;
          const remaining = counters[cardId] ?? zikr.count;
          return (
            <AzkarCard
              key={cardId}
              zikr={zikr}
              index={idx}
              cardId={cardId}
              remaining={remaining}
              onDecrement={onDecrement}
              onReset={onResetCard}
            />
          );
        })}
      </div>
    </section>
  );
}
