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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg-glass/90 border-b border-border-theme px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 md:h-20">
        <a
          href="#"
          aria-label="الصفحة الرئيسية"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('morning');
          }}
          className="flex items-center gap-3 text-gold-bright font-bold text-xl md:text-2xl transition hover:opacity-85"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-bright/10 border border-gold-bright/30 flex items-center justify-center text-gold-bright shadow-sm">
            <i className="fas fa-star-and-crescent text-lg"></i>
          </div>
          <span className="font-bold tracking-tight">أذكاري</span>
        </a>

        <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gold-bright/15 text-gold-bright border border-gold-bright/30 shadow-sm font-semibold'
                    : 'text-text-muted hover:text-gold-bright hover:bg-gold-bright/10 border border-transparent'
                }`}
              >
                <i className={`${item.icon} text-sm`}></i>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            aria-label="تبديل المظهر"
            title="تبديل الوضع الفاتح/الداكن"
            className="relative w-12 h-7 rounded-full border border-border-theme bg-bg-card p-0.5 cursor-pointer transition focus:outline-none shadow-inner"
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-gold-bright text-bg-deep flex items-center justify-center text-xs transition-transform duration-300 shadow-sm ${
                theme === 'light' ? '-translate-x-5' : 'translate-x-0'
              }`}
            >
              <i className={theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'}></i>
            </div>
          </button>

          <button
            onClick={onOpenMobileNav}
            aria-label="فتح القائمة"
            aria-expanded="false"
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-xl border border-border-theme bg-bg-card text-text-main cursor-pointer p-2 hover:border-gold-bright/40 transition"
          >
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
