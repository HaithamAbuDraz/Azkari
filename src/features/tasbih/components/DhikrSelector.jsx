import React from 'react';

export default function DhikrSelector({
  dhikrs,
  activeIdx,
  onSelectDhikr,
  arabicOpacity,
  target,
}) {
  const currentDhikr = dhikrs[activeIdx];

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 text-center" role="region" aria-label="اختيار الذكر للتسبيح">
      <h3 className="text-xs sm:text-sm font-bold text-text-muted mb-3 flex items-center justify-center gap-2">
        <i className="fas fa-list-check text-gold text-xs"></i>
        <span>اختر صيغة الذكر</span>
      </h3>

      {/* Dhikr Pills Carousel / Wrap */}
      <div className="flex flex-wrap gap-2 justify-center mb-4" role="group">
        {dhikrs.map((d, i) => {
          const isSelected = i === activeIdx;
          return (
            <button
              key={d.label}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/20 text-primary font-bold border-primary/40 shadow-2xs scale-102'
                  : 'bg-bg-card border-border-theme text-text-muted hover:text-text-main hover:bg-bg-elevated'
              }`}
              onClick={() => onSelectDhikr(i)}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Central Arabic Dhikr Display Banner */}
      <div
        className="p-5 sm:p-7 rounded-3xl bg-bg-card border border-border-theme font-amiri text-2xl sm:text-3xl lg:text-4xl text-center text-text-arabic my-4 shadow-xs min-h-[5.5rem] sm:min-h-[6.5rem] flex items-center justify-center leading-relaxed"
        lang="ar"
        dir="rtl"
        aria-live="polite"
        style={{
          opacity: arabicOpacity,
          transition: 'opacity 0.2s ease',
        }}
      >
        {currentDhikr.arabic}
      </div>

      {/* Current Target */}
      <div className="text-center text-xs sm:text-sm text-text-muted font-medium">
        <span>الهدف الحالي:</span>{' '}
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold/15 text-gold font-bold font-mono mr-1">
          {target}
        </span>
      </div>
    </div>
  );
}
