import React, { useState } from 'react';

export default function DhikrSelector({
  dhikrs,
  activeIdx,
  onSelectDhikr,
  onAddCustomDhikr,
  arabicOpacity,
  target,
}) {
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0: Normal, 1: Large, 2: Extra Large
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customArabic, setCustomArabic] = useState('');
  const [customTarget, setCustomTarget] = useState('100');

  const currentDhikr = dhikrs[activeIdx] || dhikrs[0];

  const fontSizeClasses = [
    'text-xl sm:text-2xl lg:text-3xl', // Normal
    'text-2xl sm:text-3xl lg:text-4xl', // Large (default)
    'text-3xl sm:text-4xl lg:text-5xl', // Extra Large (elderly accessible)
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!customLabel.trim()) return;
    const newDhikr = {
      label: customLabel.trim(),
      arabic: customArabic.trim() || customLabel.trim(),
      target: parseInt(customTarget, 10) || 100,
      virtue: 'ذكر مخصص من اختيارك — تقبل الله طاعتك.',
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
      className='w-full max-w-4xl mx-auto mb-6 sm:mb-8'
      role='region'
      aria-label='اختيار الذكر للتسبيح'>
      {/* Header with Title and Text-Size Adjuster */}
      <div className='flex items-center justify-between gap-3 mb-3 px-1'>
        <h3 className='text-xs sm:text-sm font-bold text-text-muted flex items-center gap-2'>
          <span className='w-6 h-6 rounded-lg bg-gold/15 text-gold flex items-center justify-center text-xs'>
            <i className='fas fa-list-check'></i>
          </span>
          <span>اختر صيغة الذكر</span>
        </h3>

        {/* Text size scaling for accessibility / elderly users */}
        <div
          className='flex items-center gap-1 bg-bg-card border border-border-theme px-2 py-1 rounded-xl text-xs shadow-2xs'
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

      {/* Horizontally scrollable on mobile & wrapped on desktop */}
      <div
        className='flex items-center gap-2 overflow-x-auto pb-2.5 pt-1 px-1 no-scrollbar sm:flex-wrap sm:overflow-visible focus:outline-none'
        role='group'
        aria-label='قائمة الأذكار'>
        {dhikrs.map((d, i) => {
          const isSelected = i === activeIdx;
          return (
            <button
              key={`${d.label}-${i}`}
              type='button'
              className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer select-none flex items-center gap-2 active:scale-95 ${
                isSelected
                  ? 'bg-primary/20 text-primary border-primary/50 shadow-xs ring-2 ring-primary/25 font-bold'
                  : 'bg-bg-card border-border-theme text-text-muted hover:text-text-main hover:bg-bg-elevated hover:border-gold/30'
              }`}
              onClick={() => onSelectDhikr(i)}
              aria-pressed={isSelected}>
              {isSelected ? (
                <span className='w-2 h-2 rounded-full bg-gold animate-pulse'></span>
              ) : (
                <span className='w-1.5 h-1.5 rounded-full bg-border-theme'></span>
              )}
              <span>{d.label}</span>
              <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-bg-elevated/80 font-mono text-text-muted'>
                {d.target}
              </span>
            </button>
          );
        })}

        {/* Add custom dhikr button */}
        <button
          type='button'
          onClick={() => setShowCustomModal(true)}
          className='shrink-0 px-3 py-2 rounded-2xl text-xs font-semibold border border-dashed border-gold/40 bg-gold/5 text-gold hover:bg-gold/15 transition cursor-pointer flex items-center gap-1.5'
          title='إضافة صيغة ذكر مخصصة'>
          <i className='fas fa-plus text-[10px]'></i>
          <span>ذكر مخصص</span>
        </button>
      </div>

      {/* Central Arabic Calligraphy Display Banner */}
      <div
        className='relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-theme text-center text-text-arabic my-4 sm:my-5 shadow-xs transition-all duration-300'
        lang='ar'
        dir='rtl'
        aria-live='polite'>
        {/* Subtle decorative Islamic corner patterns */}
        <div
          className='absolute top-2 right-2 text-gold/15 text-xl pointer-events-none select-none'
          aria-hidden='true'>
          ❖
        </div>
        <div
          className='absolute bottom-2 left-2 text-gold/15 text-xl pointer-events-none select-none'
          aria-hidden='true'>
          ❖
        </div>

        {/* Selected Arabic text with full diacritics */}
        <div
          className={`font-amiri font-bold text-text-arabic leading-relaxed min-h-[4rem] sm:min-h-[5rem] flex items-center justify-center ${fontSizeClasses[fontSizeLevel]}`}
          style={{
            opacity: arabicOpacity,
            transition: 'opacity 0.25s ease-in-out',
          }}>
          {currentDhikr.arabic || currentDhikr.label}
        </div>

        {/* Virtue / Hadith footnote */}
        {currentDhikr.virtue && (
          <div className='mt-3 pt-3 border-t border-border-theme/60 flex items-center justify-center gap-2 text-xs sm:text-sm text-text-muted'>
            <i className='fas fa-feather-pointed text-gold text-xs'></i>
            <span className='font-tajawal leading-normal'>
              {currentDhikr.virtue}
            </span>
          </div>
        )}
      </div>

      {/* Custom Dhikr Modal */}
      {showCustomModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='custom-modal-title'>
          <div className='w-full max-w-md bg-bg-card border border-border-theme rounded-3xl p-6 shadow-2xl relative'>
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
          </div>
        </div>
      )}
    </div>
  );
}
