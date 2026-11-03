import React from 'react';

export default function MilestonesGrid({ milestones, totalCount }) {
  return (
    <div className="mt-10 p-5 md:p-6 rounded-2xl bg-bg-card border border-border-theme max-w-4xl mx-auto shadow-sm" role="region" aria-label="الإنجازات">
      <h3 className="text-sm md:text-base font-bold text-gold-bright flex items-center gap-2 mb-4">
        <i className="fas fa-trophy"></i> الإنجازات
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {milestones.map((ms) => {
          const reached = totalCount >= ms;
          return (
            <div
              key={ms}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                reached
                  ? 'bg-teal-brand/15 border-teal-brand/50 text-teal-brand font-bold shadow-xs'
                  : 'bg-bg-deep/60 border-border-theme/60 text-text-muted opacity-70'
              }`}
            >
              <span className="text-base font-extrabold mb-0.5">{ms}</span>
              <span className="text-xs">{reached ? '✓ تم' : 'تسبيحة'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
