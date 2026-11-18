import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  EASE_SPIRITUAL,
  MODAL_BACKDROP_VARIANTS,
  MODAL_PANEL_VARIANTS,
} from '../../../constants/motion';
import { useTasbihFavorites } from '../../../hooks';

/**
 * DhikrSelector
 *
 * Dhikr formula selector for the Tasbih page featuring:
 * - Persistent favorites system stored in localStorage
 * - Toggle filter tabs between All Dhikrs and Favorites
 * - Interactive heart button on each card and on the main calligraphy banner
 * - Custom Dhikr modal creator
 * - Responsive font-size scaling and Light/Dark mode support
 */
export default function DhikrSelector({
  dhikrs,
  activeIdx,
  onSelectDhikr,
  onAddCustomDhikr,
  arabicOpacity,
  showToast,
}) {
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0: Normal, 1: Large, 2: Extra Large
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites'
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customArabic, setCustomArabic] = useState('');
  const [customTarget, setCustomTarget] = useState('100');

  // ── 1. Favorites State & LocalStorage Persistence ──
  const { favorites, isFavorite, toggleFavorite } =
    useTasbihFavorites(showToast);

  // ── 2. Filtered Dhikrs List ──
  const visibleDhikrs = useMemo(() => {
    if (filterMode === 'favorites') {
      return dhikrs
        .map((d, index) => ({ ...d, originalIndex: index }))
        .filter((d) => favorites.includes(d.label));
    }
    return dhikrs.map((d, index) => ({ ...d, originalIndex: index }));
  }, [dhikrs, filterMode, favorites]);

  const currentDhikr = dhikrs[activeIdx] || dhikrs[0];
  const isCurrentFavorite = isFavorite(currentDhikr.label);

  const fontSizeClasses = [
    'text-xl sm:text-2xl lg:text-3xl',
    'text-2xl sm:text-3xl lg:text-4xl',
    'text-3xl sm:text-4xl lg:text-5xl',
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!customLabel.trim()) return;
    const newDhikr = {
      label: customLabel.trim(),
      arabic: customArabic.trim() || customLabel.trim(),
      target: parseInt(customTarget, 10) || 100,
      virtue: 'ذكر مخصص من اختيارك، تقبل الله طاعتك.',
    };
    if (onAddCustomDhikr) {
      onAddCustomDhikr(newDhikr);
    }
    setCustomLabel('');
    setCustomArabic('');
    setCustomTarget('100');
    setShowCustomModal(false);
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto mb-6 sm:mb-8 font-['IBM_Plex_Sans_Arabic']"
      role='region'
      aria-label='اختيار صيغة الذكر للتسبيح'>
      {/* ── Top Bar: Title, Filters & Font Sizer ── */}
      <div className='flex flex-wrap items-center justify-between gap-3 mb-3 px-1'>
        {/* Title & Filter Tabs */}
        <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
          <h3 className='text-xs sm:text-sm font-bold text-text-muted flex items-center gap-1.5'>
            <span className='w-6 h-6 rounded-lg bg-gold/15 text-gold flex items-center justify-center text-xs'>
              <i className='fas fa-list-check'></i>
            </span>
            <span>صيغة الذكر</span>
          </h3>

          {/* All / Favorites Tabs Toggle */}
          <div
            className='inline-flex items-center p-0.5 rounded-xl bg-bg-card border border-border-theme shadow-2xs text-xs'
            role='tablist'
            aria-label='تصفية صيغ الأذكار'>
            <button
              type='button'
              role='tab'
              aria-selected={filterMode === 'all'}
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                filterMode === 'all'
                  ? 'bg-primary/15 text-primary border-primary/30 font-bold shadow-2xs'
                  : 'border-transparent text-text-muted hover:text-text-main'
              }`}>
              <span>كل الأذكار</span>
              <span className='text-[10px] opacity-75 font-mono'>
                ({dhikrs.length})
              </span>
            </button>

            <button
              type='button'
              role='tab'
              aria-selected={filterMode === 'favorites'}
              onClick={() => setFilterMode('favorites')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                filterMode === 'favorites'
                  ? 'bg-gold/15 text-gold border-gold/30 font-bold shadow-2xs'
                  : 'border-transparent text-text-muted hover:text-gold'
              }`}>
              <i
                className={`text-[10px] ${
                  favorites.length > 0
                    ? 'fas fa-heart text-gold'
                    : 'far fa-heart'
                }`}
              />
              <span>المفضلة</span>
              <span className='text-[10px] opacity-75 font-mono'>
                ({favorites.length})
              </span>
            </button>
          </div>
        </div>

        {/* Font size adjustment buttons */}
        <div
          className='flex items-center gap-1 bg-bg-card border border-border-theme px-2 py-1 rounded-xl text-xs shadow-2xs mr-auto sm:mr-0'
          title='تغيير حجم خط الذكر لتسهيل القراءة'>
          <span className='text-[11px] text-text-muted hidden sm:inline ml-1'>
            حجم الخط:
          </span>
          <button
            type='button'
            onClick={() => setFontSizeLevel((prev) => Math.max(0, prev - 1))}
            disabled={fontSizeLevel === 0}
            className='w-6 h-6 flex items-center justify-center rounded-lg bg-bg-elevated hover:bg-gold/20 text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs font-bold'
            aria-label='تصغير خط الذكر'>
            A-
          </button>
          <button
            type='button'
            onClick={() => setFontSizeLevel((prev) => Math.min(2, prev + 1))}
            disabled={fontSizeLevel === 2}
            className='w-6 h-6 flex items-center justify-center rounded-lg bg-bg-elevated hover:bg-gold/20 text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs font-bold'
            aria-label='تكبير خط الذكر'>
            A+
          </button>
        </div>
      </div>

      {/* ── Dhikrs Chips List / Cards ── */}
      {visibleDhikrs.length > 0 ? (
        <div
          className='flex items-center gap-2 overflow-x-auto pb-2.5 pt-1 px-1 no-scrollbar sm:flex-wrap sm:overflow-visible focus:outline-none'
          role='group'
          aria-label='قائمة الأذكار'>
          {visibleDhikrs.map((d) => {
            const isSelected = d.originalIndex === activeIdx;
            const isFav = isFavorite(d.label);

            return (
              <motion.div
                key={`${d.label}-${d.originalIndex}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDhikr(d.originalIndex)}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDhikr(d.originalIndex);
                  }
                }}
                className={`group shrink-0 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all duration-200 select-none flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/50 shadow-xs ring-2 ring-primary/25 font-bold'
                    : 'bg-bg-card border-border-theme text-text-muted hover:text-text-main hover:bg-bg-elevated hover:border-gold/30'
                }`}>
                {/* Active Indicator Dot */}
                {isSelected ? (
                  <span className='w-2 h-2 rounded-full bg-gold animate-pulse'></span>
                ) : (
                  <span className='w-1.5 h-1.5 rounded-full bg-border-theme'></span>
                )}

                {/* Dhikr Label */}
                <span>{d.label}</span>

                {/* Target Count Badge */}
                <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-bg-elevated/80 font-mono text-text-muted'>
                  {d.target}
                </span>

                {/* Favorite Heart Button with micro-interaction */}
                <button
                  type='button'
                  onClick={(e) => toggleFavorite(d.label, e)}
                  title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  aria-label={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  className='p-1 -mr-0.5 rounded-lg transition-transform active:scale-90 hover:scale-110 cursor-pointer focus:outline-none'>
                  <i
                    className={`text-xs transition-colors duration-200 ${
                      isFav
                        ? 'fas fa-heart text-gold drop-shadow-xs'
                        : 'far fa-heart text-stone-400 dark:text-stone-500 group-hover:text-gold'
                    }`}
                  />
                </button>
              </motion.div>
            );
          })}

          {/* Add custom dhikr button */}
          <motion.button
            type='button'
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomModal(true)}
            className='shrink-0 px-3 py-1.5 rounded-2xl text-xs font-semibold border border-dashed border-gold/40 bg-gold/5 text-gold hover:bg-gold/15 transition cursor-pointer flex items-center gap-1.5'
            title='إضافة صيغة ذكر مخصصة'>
            <i className='fas fa-plus text-[10px]'></i>
            <span>ذكر مخصص</span>
          </motion.button>
        </div>
      ) : (
        /* Empty State for Favorites tab */
        <div className='w-full py-8 px-4 text-center rounded-3xl bg-bg-card/70 border border-dashed border-border-theme flex flex-col items-center justify-center my-2'>
          <div className='w-11 h-11 rounded-2xl bg-gold/15 text-gold border border-gold/25 flex items-center justify-center text-lg mb-2.5 shadow-2xs'>
            <i className='far fa-heart'></i>
          </div>
          <h4 className='text-sm font-bold text-text-main mb-1'>
            لا توجد أذكار في المفضلة بعد
          </h4>
          <p className='text-xs text-text-muted max-w-sm mb-3.5 leading-relaxed'>
            انقر على رمز القلب بجوار أي صيغة ذكر لإضافتها إلى قائمتك المفضلة
            للوصول إليها بنقرة واحدة.
          </p>
          <button
            type='button'
            onClick={() => setFilterMode('all')}
            className='px-4 py-1.5 rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 text-xs font-bold transition-colors cursor-pointer'>
            عرض كل الأذكار
          </button>
        </div>
      )}

      {/* ── Central Arabic Calligraphy Display Banner ── */}
      <div
        className='relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme text-center text-text-arabic my-4 sm:my-5 shadow-xs transition-all duration-300'
        lang='ar'
        dir='rtl'
        aria-live='polite'>
        {/* Floating Favorite Button on the active calligraphy banner */}
        <button
          type='button'
          onClick={(e) => toggleFavorite(currentDhikr.label, e)}
          title={
            isCurrentFavorite
              ? 'إزالة هذا الذكر من المفضلة'
              : 'إضافة هذا الذكر إلى المفضلة'
          }
          aria-label={
            isCurrentFavorite
              ? 'إزالة هذا الذكر من المفضلة'
              : 'إضافة هذا الذكر إلى المفضلة'
          }
          className='absolute top-3.5 left-3.5 w-9 h-9 rounded-2xl bg-bg-elevated/75 hover:bg-bg-elevated border border-border-theme flex items-center justify-center text-xs transition-transform active:scale-90 hover:scale-110 shadow-2xs cursor-pointer z-10'>
          <i
            className={`text-sm transition-colors duration-200 ${
              isCurrentFavorite
                ? 'fas fa-heart text-gold drop-shadow-xs'
                : 'far fa-heart text-text-muted hover:text-gold'
            }`}
          />
        </button>

        {/* Decorative corner accents */}
        <div
          className='absolute top-3 right-3 text-gold/15 text-xl pointer-events-none select-none'
          aria-hidden='true'>
          ❖
        </div>
        <div
          className='absolute bottom-3 left-3 text-gold/15 text-xl pointer-events-none select-none'
          aria-hidden='true'>
          ❖
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentDhikr.arabic || currentDhikr.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: arabicOpacity ?? 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: EASE_SPIRITUAL }}>
            <div
              className={`font-amiri font-bold text-text-arabic leading-relaxed min-h-[4rem] sm:min-h-[5rem] flex items-center justify-center px-6 ${fontSizeClasses[fontSizeLevel]}`}>
              {currentDhikr.arabic || currentDhikr.label}
            </div>

            {currentDhikr.virtue && (
              <div className='mt-3 pt-3 border-t border-border-theme/60 flex items-center justify-center gap-2 text-xs sm:text-sm text-text-muted'>
                <i className='fas fa-feather-pointed text-gold text-xs'></i>
                <span className='font-tajawal leading-normal'>
                  {currentDhikr.virtue}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Animated Custom Dhikr Modal ── */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            variants={MODAL_BACKDROP_VARIANTS}
            initial='hidden'
            animate='visible'
            exit='exit'
            onClick={() => setShowCustomModal(false)}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
            role='dialog'
            aria-modal='true'
            aria-labelledby='custom-modal-title'>
            <motion.div
              variants={MODAL_PANEL_VARIANTS}
              initial='hidden'
              animate='visible'
              exit='exit'
              onClick={(e) => e.stopPropagation()}
              className='w-full max-w-md bg-bg-card border border-border-theme rounded-3xl p-6 shadow-2xl relative'>
              <button
                type='button'
                onClick={() => setShowCustomModal(false)}
                className='absolute top-4 left-4 w-8 h-8 rounded-full bg-bg-elevated hover:bg-gold/20 text-text-muted hover:text-text-main flex items-center justify-center text-xs transition cursor-pointer'
                aria-label='إغلاق'>
                <i className='fas fa-times'></i>
              </button>

              <h4
                id='custom-modal-title'
                className='text-base font-bold text-text-main mb-4 flex items-center gap-2'>
                <i className='fas fa-plus-circle text-gold'></i>
                <span>إضافة صيغة ذكر مخصصة</span>
              </h4>

              <form
                onSubmit={handleAddSubmit}
                className='space-y-4'>
                <div>
                  <label className='block text-xs font-semibold text-text-muted mb-1.5'>
                    اسم الذكر (مختصر):
                  </label>
                  <input
                    type='text'
                    required
                    placeholder='مثال: يا حي يا قيوم'
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className='w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border-theme text-text-main text-sm focus:outline-none focus:border-gold/60'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-text-muted mb-1.5'>
                    النص الكامل (مع التشكيل إن أمكن):
                  </label>
                  <textarea
                    rows='2'
                    placeholder='يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ'
                    value={customArabic}
                    onChange={(e) => setCustomArabic(e.target.value)}
                    className='w-full px-3.5 py-2 rounded-xl bg-bg-elevated border border-border-theme text-text-main text-sm font-amiri focus:outline-none focus:border-gold/60'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-text-muted mb-1.5'>
                    الهدف التكراري الافتراضي:
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='9999'
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    className='w-full px-3.5 py-2 rounded-xl bg-bg-elevated border border-border-theme text-text-main text-sm font-mono focus:outline-none focus:border-gold/60'
                  />
                </div>

                <div className='flex items-center justify-end gap-2.5 pt-2'>
                  <button
                    type='button'
                    onClick={() => setShowCustomModal(false)}
                    className='px-4 py-2 rounded-xl border border-border-theme text-xs font-semibold text-text-muted hover:text-text-main cursor-pointer'>
                    إلغاء
                  </button>
                  <button
                    type='submit'
                    className='px-5 py-2 rounded-xl bg-gold text-bg-deep text-xs font-bold hover:opacity-90 shadow-xs cursor-pointer'>
                    إضافة الذكر
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
