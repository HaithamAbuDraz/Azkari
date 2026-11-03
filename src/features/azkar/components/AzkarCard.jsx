import React, { useState } from 'react';

export default function AzkarCard({
  zikr,
  index,
  cardId,
  remaining,
  onDecrement,
  onReset,
  isFavorite = false,
  onToggleFavorite,
  onShowToast,
}) {
  const [copied, setCopied] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  const isDone = remaining === 0;
  const progressRatio = zikr.count > 0 ? (zikr.count - remaining) / zikr.count : 0;

  const handleCardClick = (e) => {
    // Avoid triggering when user clicks buttons, links, or inputs
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
      return;
    }
    if (isDone) return;
    onDecrement(cardId, zikr.count);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    let textToCopy = `${zikr.arabic}\n\n[المصدر: ${zikr.source}]`;
    if (zikr.benefit) {
      textToCopy += `\n[الفضل: ${zikr.benefit}]`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        if (onShowToast) {
          onShowToast('تم نسخ الذكر إلى الحافظة <i class="fas fa-check text-gold"></i>');
        }
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(cardId);
    }
  };

  return (
    <article
      id={`card-${cardId}`}
      aria-label={`الذكر رقم ${index + 1}`}
      onClick={handleCardClick}
      className={`group relative p-5 sm:p-6 rounded-2xl bg-bg-card border transition-all duration-300 flex flex-col justify-between select-none ${
        isDone
          ? 'border-sage/40 bg-primary-light/10 shadow-xs cursor-default'
          : 'border-border-theme hover:border-gold/50 hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Top Header: Dhikr Number, Repeat Tag & Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-theme/40">
        <div className="flex items-center gap-2">
          {/* Dhikr Number Badge */}
          <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/25 text-gold text-xs font-bold flex items-center justify-center shadow-2xs">
            {index + 1}
          </div>
          {/* Target repetitions label */}
          <span className="text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border-theme/60">
            {zikr.count === 1 ? 'مرة واحدة' : `${zikr.count} مرات`}
          </span>
        </div>

        {/* Action icons: Font size, Copy, Favorite */}
        <div className="flex items-center gap-1.5" role="group" aria-label="إجراءات الذكر">
          {/* Font scale toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLargeFont((prev) => !prev);
            }}
            title={isLargeFont ? 'تصغير الخط' : 'تكبير الخط'}
            aria-label={isLargeFont ? 'تصغير الخط' : 'تكبير الخط'}
            className="w-8 h-8 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-elevated flex items-center justify-center text-xs transition cursor-pointer"
          >
            <span className="font-bold text-xs">{isLargeFont ? 'A-' : 'A+'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="نسخ نص الذكر"
            aria-label="نسخ نص الذكر"
            className="w-8 h-8 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 flex items-center justify-center text-xs transition cursor-pointer"
          >
            <i className={copied ? 'fas fa-check text-gold' : 'far fa-copy'}></i>
          </button>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition cursor-pointer ${
              isFavorite
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-text-muted hover:text-rose-500 hover:bg-rose-500/10'
            }`}
          >
            <i className={isFavorite ? 'fas fa-heart text-rose-500' : 'far fa-heart'}></i>
          </button>
        </div>
      </div>

      {/* Primary Visual Focus: Arabic Dhikr Text */}
      <div className="my-2">
        <p
          className={`font-amiri text-text-arabic text-right leading-[2.2] tracking-wide transition-all ${
            isLargeFont
              ? 'text-2xl sm:text-3xl'
              : 'text-lg sm:text-xl md:text-2xl'
          }`}
          lang="ar"
          dir="rtl"
        >
          {zikr.arabic}
        </p>
      </div>

      {/* Hadith Benefit / Explanation Box */}
      {zikr.benefit && (
        <div className="my-3.5 p-3.5 rounded-xl bg-bg-elevated/75 border border-border-theme/60 text-xs sm:text-sm text-text-muted leading-relaxed text-right">
          <div className="flex items-center gap-1.5 text-gold font-semibold mb-1 text-xs">
            <i className="fas fa-sparkles text-[10px]"></i>
            <span>الشرح والفضل:</span>
          </div>
          <p className="text-text-main/90">{zikr.benefit}</p>
        </div>
      )}

      {/* Bottom Footer: Source & Interactive Counter */}
      <div className="mt-4 pt-3.5 border-t border-border-theme/50 flex flex-wrap items-center justify-between gap-3">
        {/* Source attribution */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-text-muted bg-bg-elevated/70 px-2.5 py-1 rounded-lg border border-border-theme/50 max-w-[200px] sm:max-w-xs truncate">
          <i className="fas fa-book-open text-gold/70 text-[10px] shrink-0"></i>
          <span className="truncate">{zikr.source}</span>
        </div>

        {/* Counter & Status Module */}
        <div className="flex items-center gap-2">
          {/* Subtle completion indicator badge */}
          {isDone ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary-light text-primary font-bold text-xs border border-primary/30">
              <i className="fas fa-check-circle text-xs text-gold"></i>
              <span>اكتمل بحمد الله</span>
            </div>
          ) : (
            /* Progress bar mini indicator */
            zikr.count > 1 && (
              <div
                className="w-12 sm:w-16 h-1.5 rounded-full bg-bg-elevated overflow-hidden border border-border-theme/40"
                title={`التقدم: ${zikr.count - remaining} من ${zikr.count}`}
              >
                <div
                  className="h-full bg-gradient-to-l from-gold to-primary transition-all duration-300"
                  style={{ width: `${Math.round(progressRatio * 100)}%` }}
                />
              </div>
            )
          )}

          {/* Interactive Counter Controls */}
          <div
            className="flex items-center gap-1 bg-bg-elevated p-1 rounded-xl border border-border-theme/70"
            role="group"
            aria-label="أداة عد الذكر"
          >
            {/* Decrement Counter Button */}
            <button
              type="button"
              disabled={isDone}
              onClick={(e) => {
                e.stopPropagation();
                onDecrement(cardId, zikr.count);
              }}
              aria-label={`إنقاص عداد الذكر. المتبقي: ${remaining}`}
              className={`min-w-[2.25rem] h-9 px-2.5 rounded-lg font-bold text-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isDone
                  ? 'bg-transparent text-text-muted opacity-40 cursor-not-allowed'
                  : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 shadow-2xs'
              }`}
            >
              <span className="font-mono text-base font-bold">−</span>
            </button>

            {/* Remaining / Target Count */}
            <div
              className="min-w-[3.5rem] px-2 text-center text-xs sm:text-sm font-bold font-mono text-text-main"
              aria-live="polite"
              aria-label={`المتبقي ${remaining} من ${zikr.count}`}
            >
              <span className={remaining === 0 ? 'text-gold' : 'text-text-main'}>
                {remaining}
              </span>
              <span className="text-text-muted text-[10px] mx-1">/</span>
              <span className="text-text-muted text-[11px]">{zikr.count}</span>
            </div>

            {/* Reset Card Counter Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset(cardId, zikr.count);
              }}
              aria-label="إعادة تعيين هذا الذكر"
              title="إعادة تعيين هذا الذكر"
              className="w-9 h-9 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 flex items-center justify-center text-xs transition cursor-pointer active:scale-95"
            >
              <i className="fas fa-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
