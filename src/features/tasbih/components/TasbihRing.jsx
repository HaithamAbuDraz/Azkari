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
      {/* Circular Progress Ring */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          {/* Background circle track */}
          <circle
            cx="120"
            cy="120"
            r="115"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            className="text-border-theme/35"
          />
          {/* Progress circle */}
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
              transition: 'stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Central Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <div
            className={`text-5xl sm:text-6xl font-extrabold font-mono text-gold transition-transform duration-150 ${
              isBumping ? 'scale-110' : 'scale-100'
            }`}
            aria-live="polite"
          >
            {count}
          </div>
          <div className="text-xs sm:text-sm text-text-muted mt-1 font-medium">
            من <span className="font-mono">{target}</span>
          </div>
          <div className="text-xs text-primary font-bold mt-1 min-h-[1.25rem]" aria-live="polite">
            {laps > 0 ? `الدورة ${laps}` : ''}
          </div>
        </div>
      </div>

      {/* Main Big Tap Button */}
      <div className="mt-8">
        <button
          ref={tapBtnRef}
          type="button"
          onClick={onIncrement}
          aria-label="اضغط للتسبيح"
          className="relative overflow-hidden w-44 h-44 sm:w-48 sm:h-48 rounded-full text-white font-bold shadow-xl flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 border-4 border-gold/40 select-none group bg-gradient-to-br from-[#245B46] to-[#194332]"
        >
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-1 text-gold">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l2.4 4.8 5.3-2.1-2.1 5.3 4.8 2.4-4.8 2.4 2.1 5.3-5.3-2.1-2.4 4.8-2.4-4.8-5.3 2.1 2.1-5.3-4.8-2.4 4.8-2.4-2.1-5.3 5.3 2.1z" />
            </svg>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold font-tajawal tracking-wide">
            اضغط
          </span>
          <span className="text-[11px] text-white/80 font-normal mt-0.5">
            أو اضغط <kbd className="px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-mono font-bold">Space</kbd>
          </span>

          {/* Click Ripples */}
          {ripples.map((rip) => (
            <span key={rip.id} className="ripple" style={rip.style} />
          ))}
        </button>
      </div>
    </div>
  );
}
