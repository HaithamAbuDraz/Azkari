import React from 'react';

const NAV_ITEMS = [
  { id: 'morning', label: 'أذكار الصباح', icon: 'fas fa-sun' },
  { id: 'evening', label: 'أذكار المساء', icon: 'fas fa-moon' },
  { id: 'salah', label: 'أذكار الصلاة', icon: 'fas fa-kaaba' },
  { id: 'sleep', label: 'أذكار النوم', icon: 'fas fa-bed' },
  { id: 'various', label: 'أذكار متنوعة', icon: 'fas fa-gem' },
  { id: 'tasbih', label: 'التسبيح', icon: 'fas fa-praying-hands' },
];

export default function MobileNav({ isOpen, onClose, activeTab, onSelectTab }) {
  return (
    <div
      className={`mobile-nav ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-label="القائمة الرئيسية"
    >
      <button className="close-nav" onClick={onClose} aria-label="إغلاق القائمة">
        <i className="fas fa-times"></i>
      </button>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={activeTab === item.id ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onSelectTab(item.id);
            onClose();
          }}
        >
          <i className={item.icon}></i> {item.label}
        </a>
      ))}
    </div>
  );
}
