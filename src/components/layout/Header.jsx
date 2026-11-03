import React from 'react';
import { NAV_ITEMS } from '../../constants/tabs';

export default function Header({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  onOpenMobileNav,
}) {
  return (
    <header role="banner">
      <div className="header-inner">
        <a
          className="logo"
          href="#"
          aria-label="الصفحة الرئيسية"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('morning');
          }}
        >
          <div className="logo-icon" aria-hidden="true">
            <i className="fas fa-star-and-crescent"></i>
          </div>
          <span className="logo-text">أذكاري</span>
        </a>

        <nav role="navigation" aria-label="التنقل الرئيسي">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(item.id);
                }}
              >
                <i className={item.icon}></i> {item.label}
              </a>
            );
          })}
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="تبديل المظهر"
            title="تبديل الوضع الفاتح/الداكن"
          >
            <div className="theme-toggle-thumb">
              <span className="theme-toggle-icon">
                <i className={theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'}></i>
              </span>
            </div>
          </button>
          <button
            className="hamburger"
            onClick={onOpenMobileNav}
            aria-label="فتح القائمة"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
