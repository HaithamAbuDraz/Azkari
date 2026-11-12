import React, { useState, useRef, useCallback, useEffect } from 'react';
import { triggerHaptic } from '../../../utils/haptics';
import { RollingNumber } from '../../../components/common';
import { useMilestone } from '../../../hooks';

/* ─────────────────────────────────────────────────────────────
   useRipple
   Spawns and auto-cleans ripple elements inside a container ref.
   Skips intermediate ripples on rapid taps (< 150ms apart).
───────────────────────────────────────────────────────────── */
function useRipple(containerRef) {
  const lastRippleTime = useRef(0);

  const spawnRipple = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const now = Date.now();
      // Throttle: skip ripple if previous one was < 150ms ago (rapid tapping)
      if (now - lastRippleTime.current < 150) return;
      lastRippleTime.current = now;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX =
        e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2;
      const clientY =
        e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height / 2;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const SIZE = 48;

      const el = document.createElement('span');
      el.className = 'ripple';
      el.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${SIZE}px;
        height: ${SIZE}px;
        margin-left: -${SIZE / 2}px;
        margin-top: -${SIZE / 2}px;
        background: var(--gold-glow);
      `;
      containerRef.current.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    },
    [containerRef]
  );

  return spawnRipple;
}

/* ─────────────────────────────────────────────────────────────
   AzkarCard
───────────────────────────────────────────────────────────── */
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
  const [favBounceKey, setFavBounceKey] = useState(0);
  const [resetFlashKey, setResetFlashKey] = useState(0);
  const [showResetHint, setShowResetHint] = useState(false);
  const resetHintTimer = useRef(null);

  // Refs
  const cardRef = useRef(null);
  const decrementBtnRef = useRef(null);

  const isDone = remaining === 0;
  const hasStarted = remaining < zikr.count && remaining > 0;
  const progressRatio =
    zikr.count > 0 ? (zikr.count - remaining) / zikr.count : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // Ripple hooks — one for the whole card body, one for the decrement btn
  const spawnCardRipple = useRipple(cardRef);
  const spawnBtnRipple = useRipple(decrementBtnRef);

  // Milestone glow
  const milestoneKey = useMilestone(progressPercent);

  /* ── Tap handler: state-first, then animation ── */
  const handleCardClick = useCallback(
    (e) => {
      if (
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input')
      )
        return;
      if (isDone) return;
      onDecrement(cardId, zikr.count);
      spawnCardRipple(e);
      // Show reset hint for 2s after any decrement
      setShowResetHint(true);
      clearTimeout(resetHintTimer.current);
      resetHintTimer.current = setTimeout(() => setShowResetHint(false), 2000);
    },
    [isDone, cardId, zikr.count, onDecrement, spawnCardRipple]
  );

  const handleDecrementBtn = useCallback(
    (e) => {
      e.stopPropagation();
      if (isDone) return;
      onDecrement(cardId, zikr.count);
      spawnBtnRipple(e);
      setShowResetHint(true);
      clearTimeout(resetHintTimer.current);
      resetHintTimer.current = setTimeout(() => setShowResetHint(false), 2000);
    },
    [isDone, cardId, zikr.count, onDecrement, spawnBtnRipple]
  );

  /* ── Copy ── */
  const handleCopy = useCallback(
    (e) => {
      e.stopPropagation();
      let textToCopy = `${zikr.arabic}\n\n[المصدر: ${zikr.source}]`;
      if (zikr.benefit) textToCopy += `\n[الفضل: ${zikr.benefit}]`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          setCopied(true);
          if (onShowToast) {
            onShowToast(
              'تم نسخ الذكر إلى الحافظة <i class="fas fa-check text-gold"></i>'
            );
          }
          setTimeout(() => setCopied(false), 2000);
        });
      }
    },
    [zikr, onShowToast]
  );

  /* ── Favorite ── */
  const handleFavoriteClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (onToggleFavorite) {
        onToggleFavorite(cardId);
        setFavBounceKey((k) => k + 1);
        triggerHaptic([15, 40]);
      }
    },
    [cardId, onToggleFavorite]
  );

  /* ── Reset ── */
  const handleReset = useCallback(
    (e) => {
      e.stopPropagation();
      onReset(cardId, zikr.count);
      setResetFlashKey((k) => k + 1);
      setShowResetHint(false);
    },
    [cardId, zikr.count, onReset]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(resetHintTimer.current);
  }, []);

  return (
    <article
      ref={cardRef}
      id={`card-${cardId}`}
      aria-label={`الذكر رقم ${index + 1}`}
      onClick={handleCardClick}
      className={[
        // ── Card entrance stagger: each card delays by its index ──
        'card-enter',
        // ── Completion animations ──
        isDone ? 'card-completion-shimmer card-completion-glow' : '',
        // ── Base card styles ──
        'group relative p-5 sm:p-6 rounded-2xl bg-bg-card border',
        'transition-colors duration-300 flex flex-col justify-between select-none',
        isDone
          ? 'border-gold/30 bg-primary-light/10 shadow-xs cursor-default'
          : 'border-border-theme hover:border-gold/50 hover:shadow-md cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        // Stagger each card's entrance by 60ms per index (capped at 360ms)
        '--card-delay': `${Math.min(index * 60, 360)}ms`,
      }}>
      {/* ── Top Header ── */}
      <div className='flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-theme/40'>
        <div className='flex items-center gap-2'>
          {/* Dhikr Number Badge */}
          <div className='w-8 h-8 rounded-xl bg-gold/10 border border-gold/25 text-gold text-xs font-bold flex items-center justify-center shadow-2xs'>
            {index + 1}
          </div>
          {/* Target repetitions label */}
          <span className='text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border-theme/60'>
            {zikr.count === 1 ? 'مرة واحدة' : `${zikr.count} مرات`}
          </span>
        </div>

        {/* Action icons — hit areas extended to ≥ 48dp via -m-1 p-1 */}
        <div
          className='flex items-center gap-1'
          role='group'
          aria-label='إجراءات الذكر'>
          {/* Font scale toggle — 48dp hit area */}
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              setIsLargeFont((prev) => !prev);
            }}
            title={isLargeFont ? 'تصغير الخط' : 'تكبير الخط'}
            aria-label={isLargeFont ? 'تصغير الخط' : 'تكبير الخط'}
            className='w-8 h-8 -m-1 p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-elevated flex items-center justify-center text-xs transition cursor-pointer'
            style={{ touchAction: 'manipulation' }}>
            <span className='font-bold text-xs'>
              {isLargeFont ? 'A-' : 'A+'}
            </span>
          </button>

          {/* Copy Button — 48dp hit area */}
          <button
            type='button'
            onClick={handleCopy}
            title='نسخ نص الذكر'
            aria-label='نسخ نص الذكر'
            className='w-8 h-8 -m-1 p-1 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 flex items-center justify-center text-xs transition cursor-pointer'
            style={{ touchAction: 'manipulation' }}>
            <i
              className={copied ? 'fas fa-check text-gold' : 'far fa-copy'}></i>
          </button>

          {/* Favorite Button — 48dp hit area + bounce animation */}
          <button
            type='button'
            onClick={handleFavoriteClick}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            className={`w-8 h-8 -m-1 p-1 rounded-lg flex items-center justify-center text-xs transition cursor-pointer ${
              isFavorite
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-text-muted hover:text-rose-500 hover:bg-rose-500/10'
            }`}
            style={{ touchAction: 'manipulation' }}>
            <i
              key={favBounceKey}
              className={[
                isFavorite ? 'fas fa-heart text-rose-500' : 'far fa-heart',
                favBounceKey > 0 ? 'favorite-bounce' : '',
              ]
                .filter(Boolean)
                .join(' ')}></i>
          </button>
        </div>
      </div>

      {/* ── Arabic Text — staggered fade-in ── */}
      <div
        className='my-auto py-2 text-reveal text-center'
        style={{ '--reveal-delay': '80ms' }}>
        <p
          className={`font-amiri text-text-arabic text-center leading-[2.2] tracking-wide transition-[font-size] duration-200 ease-out ${
            isLargeFont
              ? 'text-2xl sm:text-3xl'
              : 'text-lg sm:text-xl md:text-2xl'
          }`}
          lang='ar'
          dir='rtl'>
          {zikr.arabic}
        </p>
      </div>

      {/* ── Benefit / Fadl box — staggered ── */}
      {zikr.benefit && (
        <div
          className='my-3.5 p-3.5 rounded-xl bg-bg-elevated/75 border border-border-theme/60 text-xs sm:text-sm text-text-muted leading-relaxed text-right text-reveal'
          style={{ '--reveal-delay': '160ms' }}>
          <div className='flex items-center gap-1.5 text-gold font-semibold mb-1 text-xs'>
            <i className='fas fa-sparkles text-[10px]'></i>
            <span>الشرح والفضل:</span>
          </div>
          <p className='text-text-main/90'>{zikr.benefit}</p>
        </div>
      )}

      {/* ── Bottom Footer ── */}
      <div
        className='mt-4 pt-3.5 border-t border-border-theme/50 flex flex-wrap items-center justify-between gap-3 text-reveal'
        style={{ '--reveal-delay': '220ms' }}>
        {/* Source attribution */}
        <div className='flex items-center gap-1.5 text-[11px] sm:text-xs text-text-muted bg-bg-elevated/70 px-2.5 py-1 rounded-lg border border-border-theme/50 max-w-[200px] sm:max-w-xs truncate'>
          <i className='fas fa-book-open text-gold/70 text-[10px] shrink-0'></i>
          <span className='truncate'>{zikr.source}</span>
        </div>

        {/* Counter & Status */}
        <div className='flex items-center gap-2'>
          {/* Completion badge */}
          {isDone && (
            <div className='completion-badge-enter inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary-light text-primary font-bold text-xs border border-primary/30'>
              <i className='fas fa-check-circle text-xs text-gold'></i>
              <span>اكتمل بحمد الله</span>
            </div>
          )}

          {/* Interactive Counter Controls */}
          <div
            className='relative flex items-center gap-1 bg-bg-elevated p-1 rounded-xl border border-border-theme/70 overflow-hidden'
            role='group'
            aria-label='أداة عد الذكر'>
            {/* Hairline progress indicator at bottom of counter pill */}
            {hasStarted && !isDone && (
              <div className='absolute bottom-0 inset-x-0 h-[2px] bg-border-theme/30 overflow-hidden pointer-events-none'>
                <div
                  className={`h-full bg-gradient-to-l from-gold to-primary transition-all duration-300 ease-out ${
                    milestoneKey > 0 ? 'milestone-pulse' : ''
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Decrement button — 48dp+ hit area via min-w / h-10 */}
            <button
              ref={decrementBtnRef}
              type='button'
              disabled={isDone}
              onClick={handleDecrementBtn}
              aria-label={`إنقاص عداد الذكر. المتبقي: ${remaining}`}
              className={`relative min-w-[2.75rem] h-10 px-2.5 rounded-lg font-bold text-sm flex items-center justify-center transition-all cursor-pointer overflow-hidden active:scale-[0.92] ${
                isDone
                  ? 'bg-transparent text-text-muted opacity-40 cursor-not-allowed'
                  : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 shadow-2xs'
              }`}
              style={{ touchAction: 'manipulation' }}>
              <span className='font-mono text-base font-bold'>−</span>
            </button>

            {/* Remaining / Target — rolling number */}
            <div
              className='min-w-[3.5rem] px-2 text-center text-xs sm:text-sm font-bold font-mono text-text-main'
              aria-hidden='true' /* RollingNumber has its own aria-live */
            >
              <span
                className={
                  remaining === 0
                    ? 'text-gold transition-colors duration-180'
                    : 'text-text-main'
                }>
                {remaining === 0 ? (
                  <span className='text-gold'>-</span>
                ) : (
                  <RollingNumber value={remaining} />
                )}
              </span>
              <span className='text-text-muted text-[10px] mx-1'>/</span>
              <span className='text-text-muted text-[11px]'>{zikr.count}</span>
            </div>

            {/* Reset button — 48dp hit area, attention flash after decrement */}
            <button
              type='button'
              onClick={handleReset}
              aria-label='إعادة تعيين هذا الذكر'
              title='إعادة تعيين هذا الذكر'
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-xs transition cursor-pointer active:scale-95 ${
                showResetHint
                  ? 'text-gold bg-gold/10 border border-gold/30'
                  : 'text-text-muted hover:text-gold hover:bg-gold/10'
              }`}
              style={{ touchAction: 'manipulation' }}>
              <i
                key={resetFlashKey}
                className={`fas fa-rotate-left ${resetFlashKey > 0 && showResetHint ? 'reset-flash' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
