import React from 'react';

export default function HistoryList({ history = [] }) {
  return (
    <div
      className="mt-8 p-5 sm:p-7 rounded-3xl bg-bg-card border border-border-theme max-w-4xl mx-auto shadow-xs"
      role="region"
      aria-label="سجل جلسات التسبيح المحفوظة"
    >
      <h3 className="text-sm sm:text-base font-bold text-text-main flex items-center justify-between gap-2 mb-4">
        <span className="flex items-center gap-2">
          <i className="fas fa-clipboard-list text-gold text-sm"></i>
          <span>سجل الجلسات المحفوظة</span>
        </span>
        <span className="text-xs text-text-muted font-normal">
          (آخر 10 جلسات)
        </span>
      </h3>

      <div className="flex flex-col gap-2.5">
        {history.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-xs sm:text-sm bg-bg-elevated/40 rounded-2xl border border-dashed border-border-theme/70">
            لا توجد جلسات محفوظة حالياً — اضغط "حفظ" بعد إتمام التسبيح
          </div>
        ) : (
          history.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-bg-elevated/70 border border-border-theme/70 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                <span className="font-semibold text-text-main">{item.dhikr}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold font-mono text-gold px-2 py-0.5 rounded-lg bg-gold/10">
                  {item.count}×
                </span>
                <span className="text-text-muted text-[11px] font-mono">
                  {item.date} {item.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
