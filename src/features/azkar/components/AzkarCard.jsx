import React, { useState, useRef, useCallback, useEffect } from 'react';
import { triggerHaptic } from '../../../utils/haptics';
import { MisbahaCounter } from '../../../components/common';
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
  isResumed = false,
}) {
  const [copied, setCopied] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [favBounceKey, setFavBounceKey] = useState(0);
  const [resetFlashKey, setResetFlashKey] = useState(0);
  const [showResetHint, setShowResetHint] = useState(false);
  const resetHintTimer = useRef(null);

  // Refs
  const cardRef = useRef(null);

  const isDone = remaining === 0;
  const hasStarted = remaining < zikr.count && remaining > 0;
  const progressRatio =
    zikr.count > 0 ? (zikr.count - remaining) / zikr.count : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // Ripple hook for card body tap
  const spawnCardRipple = useRipple(cardRef);

  // Milestone glow
  const milestoneKey = useMilestone(progressPercent);

  /* ── Tap handler: state-first, then animation ── */
  const handleCardClick = useCallback(
    (e) => {
      if (
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input') ||
        e.target.closest('[data-misbaha-counter]')
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
      e?.stopPropagation?.();
      if (isDone) return;
      onDecrement(cardId, zikr.count);
      setShowResetHint(true);
      clearTimeout(resetHintTimer.current);
      resetHintTimer.current = setTimeout(() => setShowResetHint(false), 2000);
    },
    [isDone, cardId, zikr.count, onDecrement]
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
      data-card-id={cardId}
      aria-label={`الذكر رقم ${index + 1}`}
      onClick={handleCardClick}
      className={[
        // ── Card entrance stagger: each card delays by its index ──
        'card-enter',
        // ── Completion animations ──
        isDone ? 'card-completion-shimmer card-completion-glow' : '',
        // ── Base card styles ──
        'group relative p-5 sm:p-6 rounded-2xl bg-bg-card border',
        'transition-all duration-300 flex flex-col justify-between select-none',
        // ── Distinct Border & Background States ──
        isDone
          ? 'border-gold/30 bg-primary-light/10 shadow-xs cursor-default'
          : isResumed
            ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/50 dark:ring-emerald-400/50 shadow-xl shadow-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] scale-[1.01] cursor-pointer'
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
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Dhikr Number Badge */}
          <div className='w-8 h-8 rounded-xl bg-gold/10 border border-gold/25 text-gold text-xs font-bold flex items-center justify-center shadow-2xs'>
            {index + 1}
          </div>
          {/* Target repetitions label */}
          <span className='text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border-theme/60'>
            {zikr.count === 1 ? 'مرة واحدة' : `${zikr.count} مرات`}
          </span>
          {/* Direct Resume Badge */}
          {isResumed && !isDone && (
            <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold shadow-2xs animate-pulse'>
              <i className='fas fa-bookmark text-[9px] text-emerald-500' />
              <span>الذكر التالي للقراءة</span>
            </span>
          )}
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
        <div className='flex items-center gap-2.5 sm:gap-3'>
          {/* Completion badge */}
          {isDone && (
            <div className='completion-badge-enter inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-light text-primary font-bold text-xs border border-primary/30 shadow-2xs'>
              <i className='fas fa-check-circle text-xs text-gold'></i>
              <span>اكتمل بحمد الله</span>
            </div>
          )}

          {/* Reset button — appears when dhikr has started or completed */}
          {(hasStarted || isDone) && (
            <button
              type='button'
              onClick={handleReset}
              aria-label='إعادة تعيين هذا الذكر'
              title='إعادة تعيين هذا الذكر'
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer active:scale-90 border ${
                showResetHint
                  ? 'text-gold bg-gold/15 border-gold/40 shadow-xs ring-1 ring-gold/30'
                  : 'text-text-muted hover:text-gold hover:bg-gold/10 border-border-theme/60 bg-bg-elevated/80 shadow-2xs'
              }`}
              style={{ touchAction: 'manipulation' }}>
              <i
                key={resetFlashKey}
                className={`fas fa-rotate-left ${resetFlashKey > 0 && showResetHint ? 'reset-flash' : ''}`}></i>
            </button>
          )}

          {/* Interactive 3D Glossy Misbaha Counter */}
          <MisbahaCounter
            count={remaining}
            target={zikr.count}
            mode='decrement'
            size={84}
            onDeduct={handleDecrementBtn}
            disabled={isDone}
            showRatio={true}
          />
        </div>
      </div>
    </article>
  );
}
