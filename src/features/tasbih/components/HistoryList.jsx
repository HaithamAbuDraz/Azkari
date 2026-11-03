import React from 'react';

export default function HistoryList({ history = [] }) {
  return (
    <div className="mt-8 p-5 md:p-6 rounded-2xl bg-bg-card border border-border-theme max-w-4xl mx-auto shadow-sm" role="region" aria-label="سجل التسبيح">
      <h3 className="text-sm md:text-base font-bold text-gold-bright flex items-center gap-2 mb-4">
        <i className="fas fa-clipboard-list"></i> سجل الجلسات{' '}
        <span className="text-xs text-text-muted font-normal font-tajawal">
          (آخر 10 جلسات)
        </span>
      </h3>
      <div className="flex flex-col gap-2.5">
        {history.length === 0 ? (
          <div className="text-center py-6 text-text-muted text-xs md:text-sm">
            لا توجد جلسات محفوظة — اضغط "حفظ" بعد الانتهاء
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-bg-deep/60 border border-border-theme/60 text-xs md:text-sm">
              <span className="font-semibold text-text-main">{item.dhikr}</span>
              <span className="font-bold text-gold-bright">{item.count}×</span>
              <span className="text-text-muted text-xs">
                {item.date} {item.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
