import React from 'react';

export default function MilestonesGrid({ milestones, totalCount }) {
  return (
    <div className="milestone-section" role="region" aria-label="الإنجازات">
      <h3>
        <i className="fas fa-trophy"></i> الإنجازات
      </h3>
      <div className="milestones-grid">
        {milestones.map((ms) => {
          const reached = totalCount >= ms;
          return (
            <div
              key={ms}
              className={`milestone-chip ${reached ? 'reached' : ''}`}
            >
              <span className="ms-number">{ms}</span>
              <span>{reached ? '✓ تم' : 'تسبيحة'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
