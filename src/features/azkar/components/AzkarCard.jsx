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
    if (e.target.closest('button')) {
      return;
    }
    if (isDone) {
      return;
    }
    onDecrement(cardId, zikr.count);
  };

  return (
    <article
      className={`relative p-5 md:p-6 rounded-2xl bg-bg-card border shadow-sm transition-all duration-300 flex flex-col justify-between group select-none ${
        isDone
          ? 'border-teal-brand/50 bg-teal-brand/5 opacity-85 cursor-default'
          : 'border-border-theme hover:border-gold-bright/40 hover:shadow-md cursor-pointer'
      }`}
      id={`card-${cardId}`}
      aria-label={`ذكر رقم ${index + 1}`}
      onClick={handleCardClick}
    >
      <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-gold-bright/10 border border-gold-bright/30 text-gold-bright text-xs font-bold flex items-center justify-center shadow-xs">
        {index + 1}
      </div>

      <p className="font-amiri text-lg md:text-xl lg:text-2xl leading-loose text-text-arabic my-3 pt-3 text-right">
        {zikr.arabic}
      </p>

      {zikr.benefit && (
        <div className="mt-3 mb-4 p-3.5 rounded-xl bg-bg-deep/70 border border-border-theme/40 text-xs md:text-sm text-text-muted leading-relaxed text-right">
          <div className="flex items-center gap-1.5 text-gold-bright font-semibold mb-1 text-xs">
            <i className="fas fa-info-circle"></i> الشرح والفضل
          </div>
          {zikr.benefit}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border-theme/40">
        <span className="text-xs px-2.5 py-1 rounded-lg bg-bg-deep border border-border-theme/50 text-text-muted flex items-center gap-1.5">
          <i className="fas fa-book text-gold-bright text-xs"></i> {zikr.source}
        </span>

        <div className="flex items-center gap-1.5 bg-bg-deep p-1 rounded-xl border border-border-theme/60" role="group" aria-label="عداد الذكر">
          <button
            className="w-8 h-8 rounded-lg bg-gold-bright/15 hover:bg-gold-bright/25 text-gold-bright font-bold text-lg flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDecrement(cardId, zikr.count);
            }}
            aria-label="عدّ"
            disabled={isDone}
          >
            −
          </button>
          <div className="min-w-[3.5rem] text-center text-xs md:text-sm font-bold text-text-main" aria-live="polite">
            {remaining} / {zikr.count}
          </div>
          <button
            className="w-8 h-8 rounded-lg text-text-muted hover:text-gold-bright hover:bg-gold-bright/10 flex items-center justify-center text-xs transition active:scale-95 cursor-pointer"
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
