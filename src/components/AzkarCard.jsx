import React from 'react';

export default function AzkarCard({
  zikr,
  index,
  cardId,
  remaining,
  onDecrement,
  onReset,
}) {
  const isDone = remaining === 0;

  const handleCardClick = (e) => {
    if (e.target.closest('.counter-btn')) {
      return;
    }
    if (isDone) {
      return;
    }
    onDecrement(cardId, zikr.count);
  };

  return (
    <article
      className={`azkar-card ${isDone ? 'completed' : ''}`}
      id={`card-${cardId}`}
      aria-label={`ذكر رقم ${index + 1}`}
      onClick={handleCardClick}
      style={{ cursor: isDone ? 'default' : 'pointer' }}
    >
      <div className="card-number">{index + 1}</div>
      <p className="arabic-text" lang="ar" dir="rtl">
        {zikr.arabic}
      </p>
      {zikr.benefit && (
        <div className="benefit">
          <div className="benefit-label">
            <i className="fas fa-info-circle"></i> الشرح والفضل
          </div>
          {zikr.benefit}
        </div>
      )}
      <div className="card-meta">
        <span className="source-badge">
          <i className="fas fa-book"></i> {zikr.source}
        </span>
        <div className="counter-wrap" role="group" aria-label="عداد الذكر">
          <button
            className="counter-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDecrement(cardId, zikr.count);
            }}
            aria-label="عدّ"
            disabled={isDone}
            style={isDone ? { opacity: 0.4 } : undefined}
          >
            −
          </button>
          <div className="counter-display" aria-live="polite">
            {remaining} / {zikr.count}
          </div>
          <button
            className="counter-btn"
            onClick={(e) => {
              e.stopPropagation();
              onReset(cardId, zikr.count);
            }}
            aria-label="إعادة"
          >
            <i className="fas fa-undo-alt"></i>
          </button>
        </div>
      </div>
    </article>
  );
}
