import React from 'react';
import ProgressSection from './components/ProgressSection';

/**
 * Dedicated Page for Weekly & Monthly Progress, Analytics & Spiritual Habit Tracking.
 */
export default function ProgressPage({ counters, onSelectTab, showToast }) {
  return (
    <div className='relative w-full pb-8 pt-2 sm:pt-4'>
      <ProgressSection
        counters={counters}
        onSelectTab={onSelectTab}
        onShowToast={showToast}
      />
    </div>
  );
}
