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
    <section id={`panel-${tabKey}`} className="azkar-panel active" role="tabpanel">
      <div className="panel-header">
        <h2 className="panel-title">
          <i className={icon}></i> {title}
        </h2>
        <div className="panel-progress">
          <span>
            {done} / {total}
          </span>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
          </div>
          <button className="complete-all-btn" onClick={() => onResetPanel(tabKey)}>
            <i className="fas fa-sync-alt"></i> إعادة تعيين
          </button>
        </div>
      </div>
      <div className="azkar-grid">
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
