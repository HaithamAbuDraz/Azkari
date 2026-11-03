import React from 'react';

export default function MilestonesGrid({ milestones, totalCount }) {
  return (
    <div
      className="mt-10 p-5 sm:p-7 rounded-3xl bg-bg-card border border-border-theme max-w-4xl mx-auto shadow-xs"
      role="region"
      aria-label="سجل إنجازات التسبيح"
    >
      <h3 className="text-sm sm:text-base font-bold text-text-main flex items-center gap-2 mb-4">
        <i className="fas fa-trophy text-gold text-sm"></i>
        <span>الإنجازات والوسام</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {milestones.map((ms) => {
          const reached = totalCount >= ms;
          return (
            <div
              key={ms}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                reached
                  ? 'bg-primary-light border-primary/40 text-primary font-bold shadow-2xs'
                  : 'bg-bg-elevated/60 border-border-theme/60 text-text-muted opacity-70'
              }`}
            >
              <span className="text-base font-extrabold font-mono mb-0.5">{ms}</span>
              <span className="text-[11px]">{reached ? '✓ مكتمل' : 'تسبيحة'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
