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
    <div className="dhikr-selector" role="region" aria-label="اختيار الذكر">
      <h3>اختر الذكر</h3>
      <div className="dhikr-pills" role="group">
        {dhikrs.map((d, i) => (
          <button
            key={d.label}
            className={`dhikr-pill ${i === activeIdx ? 'active' : ''}`}
            onClick={() => onSelectDhikr(i)}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div
        className="dhikr-display"
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
      <div className="dhikr-target">
        الهدف: <span className="target-badge">{target}</span>
      </div>
    </div>
  );
}
