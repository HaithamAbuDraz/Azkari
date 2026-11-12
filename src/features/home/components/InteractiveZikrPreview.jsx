import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { getAzkarByCategory } from '../../../utils/azkar';
import { getDefaultTab } from '../../../constants/tabs';
import { triggerHaptic } from '../../../utils/haptics';
import { playTasbihClick, playMilestoneChime } from '../../../utils/sound';
import { cn } from '../../../utils/cn';
import { RollingNumber } from '../../../components/common';
import { useRipples } from '../hooks/useRipples';
import {
  copyTextWithToast,
  fireSpiritualConfetti,
  shareWithFallback,
} from '../utils/celebrate';
import { KhatamDivider, ManuscriptCorners } from './IslamicOrnament';

const FEATURED_IDS = [
  'subhanallah-adada-khalqih',
  'bismillah-la-yadurr',
  'sayyid-al-istighfar',
  'salawat-10',
];

const RING_RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Featured Card of the Day ("نفحة من رياض الذكر") with golden aura glassmorphism,
 * authentic source tag, quick copy/share buttons, ripple & confetti celebration.
 */
export default function InteractiveZikrPreview({ onSelectTab, onShowToast }) {
  const featuredItems = useMemo(() => {
    const morning = getAzkarByCategory('morning');
    return FEATURED_IDS.map((id) =>
      morning.find((item) => item.id === id)
    ).filter(Boolean);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [counts, setCounts] = useState(() => {
    const init = {};
    for (const item of featuredItems) {
      init[item.id] = item.count;
    }
    return init;
  });
  const [isTapping, setIsTapping] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const tapBtnRef = useRef(null);
  const { ripples, spawnRipple: spawnButtonRipple } = useRipples(tapBtnRef);

  const currentItem = featuredItems[activeIndex];
  if (!currentItem) return null;

  const currentRemaining = counts[currentItem.id] ?? currentItem.count;
  const isCompleted = currentRemaining === 0;
  const totalCount = currentItem.count;
  const progress =
    totalCount > 0 ? ((totalCount - currentRemaining) / totalCount) * 100 : 100;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const handleTap = (e) => {
    if (isCompleted) return;
    spawnButtonRipple(e);

    const nextVal = Math.max(0, currentRemaining - 1);
    setCounts((prev) => ({ ...prev, [currentItem.id]: nextVal }));

    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 160);

    if (nextVal === 0) {
      triggerHaptic([25, 45, 25]);
      playMilestoneChime();
      fireSpiritualConfetti({ y: 0.72 });
      if (onShowToast) {
        onShowToast(
          'أحسنت! تقبّل الله ذكرك وطاعتك <i class="fas fa-check-circle text-gold"></i>'
        );
      }
    } else {
      triggerHaptic(15);
      playTasbihClick();
    }
  };

  const handleResetCurrent = (e) => {
    e.stopPropagation();
    setCounts((prev) => ({ ...prev, [currentItem.id]: currentItem.count }));
    triggerHaptic(10);
  };

  const handleCycle = (dir) => {
    setActiveIndex(
      (prev) => (prev + dir + featuredItems.length) % featuredItems.length
    );
  };

  const handleCopyDhikr = async (e) => {
    e.stopPropagation();
    const formatted = `${currentItem.arabic}\n\n(${currentItem.source})`;
    const ok = await copyTextWithToast(
      formatted,
      onShowToast,
      'تم نسخ الذكر إلى الحافظة <i class="fas fa-copy text-gold"></i>'
    );
    if (ok) {
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1800);
    }
  };

  const handleShareDhikr = async (e) => {
    e.stopPropagation();
    await shareWithFallback(
      {
        title: 'أذكاري • نفحة من رياض الذكر',
        text: `${currentItem.arabic}\n(${currentItem.source})`,
        url: typeof window !== 'undefined' ? window.location.origin : '',
      },
      onShowToast
    );
  };

  return (
    <section
      className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'
      aria-label='معاينة تفاعلية للأذكار'>
      {/* Section Heading */}
      <motion.div
        className='text-center mb-6 sm:mb-8'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}>
        <KhatamDivider
          label='نفحةٌ من رياضِ الذِّكر'
          className='mb-3'
        />
        <h2 className='font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-arabic)] mb-2'>
          جَرِّب حلاوةَ الذِّكرِ الآن
        </h2>
        <p className='text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto'>
          اضغط على البطاقة لتجربة عدّاد الأذكار التفاعلي مع النقر الهادئ وتوثيق
          الأحاديث من مصادرها الأصيلة
        </p>
      </motion.div>

      {/* Illuminated Glassmorphic Card with Subtle Golden Aura */}
      <motion.article
        style={{ boxShadow: 'var(--glass-highlight)' }}
        className={cn(
          'relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] p-6 sm:p-10 lg:p-12 border backdrop-blur-md transition-all duration-300 shadow-lg tasbih-glow-aura',
          isCompleted
            ? 'bg-[var(--bg-card)] border-[var(--gold)]/75 card-completion-shimmer card-completion-glow'
            : 'bg-[var(--glass-card)] border-[var(--border-accent)] hover:border-[var(--gold)]/70'
        )}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.08 }}>
        {/* Inner Double Hairline */}
        <div
          className='absolute inset-2.5 sm:inset-3.5 rounded-[1.35rem] sm:rounded-[1.75rem] border border-[var(--gold)]/20 pointer-events-none'
          aria-hidden='true'
        />
        <ManuscriptCorners />

        {/* Top Source Badge & Quick Copy / Share Actions */}
        <div className='relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--gold)]/12 border border-[var(--border-accent)] text-[var(--gold-text)]'>
              <BookOpen className='w-3.5 h-3.5' />
              <span>{currentItem.source}</span>
            </span>
            {currentItem.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className='px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--bg-elevated)]/80 border border-[var(--border)] text-[var(--text-muted)]'>
                #{tag}
              </span>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handleCopyDhikr}
              aria-label='نسخ الذكر'
              title='نسخ الذكر'
              className='w-8 h-8 rounded-xl bg-[var(--bg-elevated)]/85 hover:bg-[var(--gold)]/15 border border-[var(--border)] hover:border-[var(--gold)]/45 text-[var(--text-muted)] hover:text-[var(--gold)] flex items-center justify-center transition cursor-pointer active:scale-95'>
              {justCopied ? (
                <Check className='w-3.5 h-3.5 text-emerald-500' />
              ) : (
                <Copy className='w-3.5 h-3.5' />
              )}
            </button>
            <button
              type='button'
              onClick={handleShareDhikr}
              aria-label='مشاركة الذكر'
              title='مشاركة الذكر'
              className='w-8 h-8 rounded-xl bg-[var(--bg-elevated)]/85 hover:bg-[var(--gold)]/15 border border-[var(--border)] hover:border-[var(--gold)]/45 text-[var(--text-muted)] hover:text-[var(--gold)] flex items-center justify-center transition cursor-pointer active:scale-95'>
              <Share2 className='w-3.5 h-3.5' />
            </button>
            <span className='text-xs font-ibm text-[var(--text-muted)] px-1.5'>
              {activeIndex + 1} / {featuredItems.length}
            </span>
          </div>
        </div>

        {/* Clickable Manuscript Dhikr Area */}
        <div
          onClick={handleTap}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTap(e);
            }
          }}
          aria-label={`عدّاد الذكر التفاعلي، المتبقي ${currentRemaining} من ${totalCount}`}
          className='relative z-10 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 rounded-2xl py-2 transition'>
          <AnimatePresence mode='wait'>
            <motion.p
              key={currentItem.id}
              className='font-amiri text-2xl sm:text-3xl lg:text-4xl text-[var(--text-arabic)] text-center leading-[2] sm:leading-[2.1] mb-6 px-2 sm:px-6'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}>
              {currentItem.arabic}
            </motion.p>
          </AnimatePresence>

          {currentItem.benefit && (
            <div className='max-w-2xl mx-auto mb-6 px-4 py-3 rounded-2xl bg-[var(--glass-elevated)] backdrop-blur-sm border border-[var(--border)] text-center'>
              <p className='text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed'>
                <span className='font-bold text-[var(--gold-text)] ml-1.5'>
                  فضلُ الذكر:
                </span>
                {currentItem.benefit}
              </p>
            </div>
          )}
        </div>

        {/* Interactive Footer Controls */}
        <div className='relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-[var(--border)]'>
          {/* Switch Between Curated Adhkar */}
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => handleCycle(-1)}
              aria-label='الذكر السابق'
              className='w-9 h-9 rounded-xl bg-[var(--bg-elevated)]/85 hover:bg-[var(--gold)]/15 border border-[var(--border)] hover:border-[var(--gold)]/45 text-[var(--text-main)] hover:text-[var(--gold)] flex items-center justify-center transition cursor-pointer active:scale-95'>
              <ChevronRight className='w-4 h-4' />
            </button>
            <div className='flex items-center gap-1.5 px-2'>
              {featuredItems.map((itm, idx) => (
                <button
                  key={itm.id}
                  type='button'
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`عرض الذكر رقم ${idx + 1}`}
                  className={cn(
                    'h-2 rounded-full transition-all cursor-pointer',
                    idx === activeIndex
                      ? 'w-6 bg-[var(--gold)]'
                      : 'w-2 bg-[var(--border)] hover:bg-[var(--gold)]/50'
                  )}
                />
              ))}
            </div>
            <button
              type='button'
              onClick={() => handleCycle(1)}
              aria-label='الذكر التالي'
              className='w-9 h-9 rounded-xl bg-[var(--bg-elevated)]/85 hover:bg-[var(--gold)]/15 border border-[var(--border)] hover:border-[var(--gold)]/45 text-[var(--text-main)] hover:text-[var(--gold)] flex items-center justify-center transition cursor-pointer active:scale-95'>
              <ChevronLeft className='w-4 h-4' />
            </button>
          </div>

          {/* Interactive Counter Button + Full Azkar Link */}
          <div className='flex items-center gap-3'>
            {currentRemaining < currentItem.count && (
              <button
                type='button'
                onClick={handleResetCurrent}
                aria-label='إعادة العد'
                title='إعادة العد'
                className='w-9 h-9 rounded-xl bg-[var(--bg-elevated)]/85 hover:bg-[var(--gold)]/15 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold)] flex items-center justify-center transition cursor-pointer active:scale-95'>
                <RotateCcw className='w-4 h-4' />
              </button>
            )}

            <motion.button
              ref={tapBtnRef}
              type='button'
              onClick={handleTap}
              disabled={isCompleted}
              animate={isTapping ? { scale: [1, 1.09, 0.96, 1] } : { scale: 1 }}
              transition={{ duration: 0.22 }}
              aria-label={
                isCompleted
                  ? 'اكتمل الذكر'
                  : `تسبيح، المتبقي ${currentRemaining} من ${totalCount}`
              }
              className={cn(
                'relative overflow-hidden inline-flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all cursor-pointer active:scale-95',
                isCompleted
                  ? 'bg-[var(--gold)]/15 border-[var(--gold)] text-[var(--gold-text)] cursor-default'
                  : 'bg-[var(--bg-elevated)]/90 border-[var(--gold)]/40 hover:border-[var(--gold)] text-[var(--text-main)]'
              )}>
              {ripples.map((r) => (
                <span
                  key={r.id}
                  className='ripple'
                  style={r.style}
                />
              ))}

              <div className='relative w-11 h-11 flex items-center justify-center'>
                <svg
                  className='w-11 h-11 -rotate-90'
                  viewBox='0 0 56 56'>
                  <circle
                    cx='28'
                    cy='28'
                    r={RING_RADIUS}
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='3'
                    className='text-[var(--border)]'
                  />
                  <motion.circle
                    cx='28'
                    cy='28'
                    r={RING_RADIUS}
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='3'
                    strokeDasharray={CIRCUMFERENCE}
                    strokeLinecap='round'
                    className='text-[var(--gold)]'
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </svg>
                <span className='absolute inset-0 flex items-center justify-center'>
                  {isCompleted ? (
                    <Check className='w-4 h-4 text-[var(--gold-text)]' />
                  ) : (
                    <RollingNumber
                      value={currentRemaining}
                      ariaLabel={`المتبقي ${currentRemaining} من ${totalCount}`}
                      className='font-ibm text-sm font-bold text-[var(--text-arabic)]'
                    />
                  )}
                </span>
              </div>

              <div className='text-right'>
                <span className='block text-xs font-bold text-[var(--text-main)]'>
                  {isCompleted ? 'تقبّل الله طاعتك!' : 'اضغط للتسبيح والعد'}
                </span>
                <span className='block text-[11px] text-[var(--text-muted)] font-ibm'>
                  التكرار: {currentRemaining} / {totalCount}
                </span>
              </div>
            </motion.button>

            {isCompleted && (
              <span className='completion-badge-enter inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs border border-[var(--primary)]/30'>
                <CheckCircle2 className='w-3.5 h-3.5 text-[var(--gold-text)]' />
                <span>اكتمل بحمد الله</span>
              </span>
            )}

            <button
              type='button'
              onClick={() => onSelectTab(getDefaultTab())}
              className='group hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary-light)] hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 text-xs font-bold transition cursor-pointer active:scale-95'>
              <span>افتح جميع الأذكار</span>
              <ArrowLeft className='w-3.5 h-3.5 transition-transform group-hover:-translate-x-1' />
            </button>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
