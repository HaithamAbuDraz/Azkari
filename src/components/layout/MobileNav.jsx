import React from 'react';
import { NAV_ITEMS } from '../../constants/tabs';

export default function MobileNav({ isOpen, onClose, activeTab, onSelectTab }) {
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-bg-card/95 backdrop-blur-2xl border-l border-border-theme z-50 p-6 flex flex-col gap-3 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        role="dialog"
        aria-label="القائمة الرئيسية"
      >
        <button
          className="self-end w-9 h-9 rounded-xl border border-border-theme flex items-center justify-center text-text-muted hover:text-gold-bright hover:bg-gold-bright/10 mb-4 transition cursor-pointer"
          onClick={onClose}
          aria-label="إغلاق القائمة"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gold-bright/15 text-gold-bright border border-gold-bright/30 font-bold shadow-sm'
                    : 'text-text-muted hover:text-gold-bright hover:bg-gold-bright/10 border border-transparent'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(item.id);
                  onClose();
                }}
              >
                <i className={`${item.icon} text-base w-5 text-center`}></i>
                <span>{item.fullLabel || item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
