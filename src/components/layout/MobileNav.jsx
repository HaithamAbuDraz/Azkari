import React from 'react';
import { NAV_ITEMS } from '../../constants/tabs';

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
          <i className={item.icon}></i> {item.fullLabel || item.label}
        </a>
      ))}
    </div>
  );
}
