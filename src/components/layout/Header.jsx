import React from 'react';
import { NAV_ITEMS } from '../../constants/tabs';

export default function Header({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  onOpenMobileNav,
  favoritesCount = 0,
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg-glass/95 border-b border-border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Identity / Logo */}
          <a
            href="/morning"
            aria-label="الصفحة الرئيسية — أذكاري"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('morning');
            }}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-xl"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-2xs group-hover:border-gold/60 group-hover:bg-gold/15 transition-all duration-300">
              {/* Islamic 8-point geometric star rosette icon */}
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l2.4 4.8 5.3-2.1-2.1 5.3 4.8 2.4-4.8 2.4 2.1 5.3-5.3-2.1-2.4 4.8-2.4-4.8-5.3 2.1 2.1-5.3-4.8-2.4 4.8-2.4-2.1-5.3 5.3 2.1z" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl sm:text-2xl font-bold font-tajawal tracking-tight text-text-main group-hover:text-gold transition-colors">
                أذكاري
              </span>
              <span className="text-[10px] sm:text-xs text-text-muted font-normal -mt-0.5">
                روضة الأذكار والأدعية
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 rounded-2xl bg-bg-card/70 border border-border-theme/70 shadow-2xs"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`/${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTab(item.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs xl:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-2xs'
                      : 'text-text-muted hover:text-text-main hover:bg-bg-elevated/70 border border-transparent'
                  }`}
                >
                  <i
                    className={`${item.icon} text-xs ${
                      isActive ? 'text-gold' : 'text-text-muted'
                    }`}
                  ></i>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Actions: Theme Toggle + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Pill */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`تبديل المظهر (الحالي: ${
                theme === 'dark' ? 'داكن' : 'فاتح'
              })`}
              title="تبديل الوضع الفاتح والداكن"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border-theme bg-bg-card hover:border-gold/40 text-text-muted hover:text-text-main transition-all duration-200 cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform duration-300 ${
                  theme === 'dark'
                    ? 'text-gold rotate-0'
                    : 'text-amber-600 rotate-180'
                }`}
              >
                <i
                  className={
                    theme === 'dark' ? 'fas fa-moon text-sm' : 'fas fa-sun text-sm'
                  }
                ></i>
              </div>
              <span className="hidden sm:inline text-xs font-medium">
                {theme === 'dark' ? 'داكن' : 'فاتح'}
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onOpenMobileNav}
              aria-label="فتح قائمة التنقل"
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-border-theme bg-bg-card text-text-main hover:border-gold/40 hover:bg-bg-elevated transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <i className="fas fa-bars-staggered text-base"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
