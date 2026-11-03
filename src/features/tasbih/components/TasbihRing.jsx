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
    <div className="flex flex-col items-center my-6" aria-label="عداد التسبيح">
      <div className="relative w-64 h-64 flex items-center justify-center" aria-hidden="false">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--gold-bright)" />
              <stop offset="100%" stopColor="var(--teal)" />
            </linearGradient>
          </defs>
          <circle
            cx="120"
            cy="120"
            r="115"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border-theme/30"
          />
          <circle
            cx="120"
            cy="120"
            r="115"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: 722,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <div
            className={`text-5xl md:text-6xl font-extrabold text-gold-bright transition-transform duration-150 ${
              isBumping ? 'scale-115' : 'scale-100'
            }`}
            aria-live="polite"
          >
            {count}
          </div>
          <div className="text-sm text-text-muted mt-1 font-medium">من {target}</div>
          <div className="text-xs text-teal-brand font-semibold mt-0.5 min-h-[1.25rem]" aria-live="polite">
            {laps > 0 ? `الدورة ${laps}` : ''}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          ref={tapBtnRef}
          className="relative overflow-hidden w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-gold-bright to-gold-dim text-bg-deep font-bold shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 border-4 border-gold-bright/40 select-none"
          onClick={onIncrement}
          aria-label="اضغط للتسبيح"
        >
          <span className="text-2xl md:text-3xl font-extrabold tracking-wide mb-1">إضغظ</span>
          <span className="text-xs text-bg-deep/75 font-normal">
            أو إضغط <kbd className="px-1.5 py-0.5 rounded bg-bg-deep/20 text-xs font-mono font-bold">Space</kbd>
          </span>
          {ripples.map((rip) => (
            <span key={rip.id} className="ripple" style={rip.style} />
          ))}
        </button>
      </div>
    </div>
  );
}
