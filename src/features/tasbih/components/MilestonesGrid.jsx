import React from 'react';

export default function MilestonesGrid({ milestones, totalCount }) {
  // Find current progress towards next milestone
  const nextMilestone =
    milestones.find((m) => totalCount < m) || milestones[milestones.length - 1];
  const progressPct = Math.min(
    Math.round((totalCount / nextMilestone) * 100),
    100
  );

  return (
    <div
      className='w-full p-5 sm:p-6 rounded-3xl bg-bg-card border border-border-theme shadow-xs'
      role='region'
      aria-label='سجل إنجازات وأوسمة التسبيح'>
      <div className='flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-border-theme/60'>
        <h3 className='text-sm font-bold text-text-main flex items-center gap-2'>
          <span className='w-6 h-6 rounded-lg bg-gold/15 text-gold flex items-center justify-center text-xs'>
            <i className='fas fa-trophy'></i>
          </span>
          <span>الإنجازات والهمة</span>
        </h3>
        <span className='text-xs font-mono font-bold text-gold'>
          {totalCount} تسبيحة اليوم
        </span>
      </div>

      {/* Progress towards next milestone */}
      {totalCount < milestones[milestones.length - 1] && (
        <div className='mb-4 p-3 rounded-2xl bg-bg-elevated/50 border border-border-theme/60'>
          <div className='flex items-center justify-between text-xs mb-1.5'>
            <span className='text-text-muted'>
              الوسام التالي ({nextMilestone} تسبيحة):
            </span>
            <span className='font-mono font-bold text-primary'>
              {progressPct}%
            </span>
          </div>
          <div className='w-full h-2 rounded-full bg-bg-card overflow-hidden border border-border-theme/40'>
            <div
              className='h-full bg-gradient-to-l from-gold to-primary transition-all duration-300 rounded-full'
              style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>
      )}

      {/* Milestones Badges Grid */}
      <div className='grid grid-cols-4 sm:grid-cols-4 gap-2'>
        {milestones.map((ms) => {
          const reached = totalCount >= ms;
          return (
            <div
              key={ms}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                reached
                  ? 'bg-primary/15 border-primary/40 text-primary font-bold shadow-2xs'
                  : 'bg-bg-elevated/40 border-border-theme/50 text-text-muted opacity-65'
              }`}>
              <span className='text-xs sm:text-sm font-extrabold font-mono mb-0.5'>
                {ms}
              </span>
              <span className='text-[10px] flex items-center gap-1'>
                {reached ? (
                  <>
                    <i className='fas fa-check text-[9px] text-gold'></i>
                    <span>مكتمل</span>
                  </>
                ) : (
                  <span>تسبيحة</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
