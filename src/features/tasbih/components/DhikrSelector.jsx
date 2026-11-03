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
    <div className="w-full max-w-3xl mx-auto mb-6 text-center" role="region" aria-label="اختيار الذكر">
      <h3 className="text-xs md:text-sm font-bold text-text-muted mb-3">اختر الذكر</h3>
      <div className="flex flex-wrap gap-2 justify-center mb-4" role="group">
        {dhikrs.map((d, i) => (
          <button
            key={d.label}
            className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-medium border transition-all cursor-pointer ${
              i === activeIdx
                ? 'bg-gold-bright text-bg-deep font-bold border-gold-bright shadow-md scale-105'
                : 'bg-bg-card border-border-theme text-text-muted hover:text-gold-bright hover:border-gold-bright/30'
            }`}
            onClick={() => onSelectDhikr(i)}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div
        className="p-6 rounded-2xl bg-bg-card border border-border-theme font-amiri text-2xl md:text-3xl text-center text-text-arabic my-4 shadow-sm min-h-[5.5rem] flex items-center justify-center leading-relaxed"
        lang="ar"
        dir="rtl"
        aria-live="polite"
        style={{
          opacity: arabicOpacity,
          transition: 'opacity 0.15s ease',
        }}
      >
        {currentDhikr.arabic}
      </div>
      <div className="text-center text-xs md:text-sm text-text-muted font-medium">
        الهدف: <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold-bright/15 text-gold-bright font-bold mr-1">{target}</span>
      </div>
    </div>
  );
}
