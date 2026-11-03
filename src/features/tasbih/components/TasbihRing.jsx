import React from 'react';

export default function TasbihRing({
  count,
  target,
  laps,
  isBumping,
  strokeDashoffset,
  tapBtnRef,
  onIncrement,
  ripples,
}) {
  return (
    <div className="counter-section" aria-label="عداد التسبيح">
      <div className="ring-wrap" aria-hidden="false">
        <svg className="ring-svg" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--gold-bright)" />
              <stop offset="100%" stopColor="var(--teal)" />
            </linearGradient>
          </defs>
          <circle className="ring-track" cx="120" cy="120" r="115" />
          <circle
            className="ring-progress"
            cx="120"
            cy="120"
            r="115"
            style={{ strokeDashoffset }}
          />
        </svg>
        <div className="ring-inner">
          <div
            className={`count-number ${isBumping ? 'bump' : ''}`}
            aria-live="polite"
          >
            {count}
          </div>
          <div className="count-total">من {target}</div>
          <div className="count-laps" aria-live="polite">
            {laps > 0 ? `الدورة ${laps}` : ''}
          </div>
        </div>
      </div>

      <div className="tap-btn-wrap">
        <button
          ref={tapBtnRef}
          className="tap-btn"
          onClick={onIncrement}
          aria-label="اضغط للتسبيح"
        >
          <span className="tap-btn-label">إضغظ</span>
          <span className="kbd-hint">
            أو إضغط <kbd className="kbd">Space</kbd>
          </span>
          {ripples.map((rip) => (
            <span key={rip.id} className="ripple" style={rip.style} />
          ))}
        </button>
      </div>
    </div>
  );
}
