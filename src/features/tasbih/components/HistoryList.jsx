import React from 'react';

export default function HistoryList({ history = [] }) {
  return (
    <div className="history-section" role="region" aria-label="سجل التسبيح">
      <h3>
        <i className="fas fa-clipboard-list"></i> سجل الجلسات{' '}
        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          (آخر 10 جلسات)
        </span>
      </h3>
      <div className="history-list">
        {history.length === 0 ? (
          <div className="history-empty">
            لا توجد جلسات محفوظة — اضغط "حفظ" بعد الانتهاء
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="history-item">
              <span className="hist-dhikr">{item.dhikr}</span>
              <span className="hist-count">{item.count}×</span>
              <span className="hist-time">
                {item.date} {item.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
