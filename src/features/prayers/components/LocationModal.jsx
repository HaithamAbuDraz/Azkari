import React, { useState, useMemo } from 'react';
import {
  POPULAR_CITIES,
  CALCULATION_METHODS,
} from '../../../constants/prayers';

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectCity,
  onRequestGps,
  isGpsLoading,
  currentMethod,
  onSelectMethod,
}) {
  const [search, setSearch] = useState('');
  const [showMethods, setShowMethods] = useState(false);

  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return POPULAR_CITIES;
    return POPULAR_CITIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.countryLabel.toLowerCase().includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/70 backdrop-blur-xs z-50 transition-opacity'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal Dialog */}
      <div
        role='dialog'
        aria-modal='true'
        aria-label='اختيار المدينة والموقع الجغرافي'
        className='fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-bg-card border border-border-theme rounded-3xl p-5 sm:p-6 shadow-2xl z-50 max-h-[88vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between pb-4 border-b border-border-theme/60 mb-4'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center text-sm'>
              <i className='fas fa-location-dot'></i>
            </div>
            <div>
              <h3 className='text-lg font-bold font-tajawal text-text-main'>
                اختيار المدينة والموقع
              </h3>
              <p className='text-xs text-text-muted'>
                لتحديد مواقيت الصلاة والقبلة بدقة
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='إغلاق النافذة'
            className='w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-bg-elevated transition cursor-pointer'>
            <i className='fas fa-times'></i>
          </button>
        </div>

        {/* GPS Button */}
        <button
          type='button'
          onClick={() => {
            onRequestGps();
            onClose();
          }}
          disabled={isGpsLoading}
          className='flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary/20 via-gold/15 to-primary/20 border border-gold/40 text-text-main font-semibold text-xs sm:text-sm hover:border-gold active:scale-[0.99] transition cursor-pointer mb-4 shadow-2xs'>
          <i
            className={`fas fa-location-crosshairs text-gold ${
              isGpsLoading ? 'animate-spin' : ''
            }`}></i>
          <span>
            {isGpsLoading
              ? 'جاري تحديد موقعك...'
              : 'استخدام موقعي الجغرافي الحالي (GPS)'}
          </span>
        </button>

        {/* Search Input */}
        <div className='relative mb-4'>
          <div className='absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted'>
            <i className='fas fa-magnifying-glass text-xs text-gold/80'></i>
          </div>
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='ابحث عن مدينة أو دولة...'
            className='w-full pl-3 pr-9 py-2 rounded-xl bg-bg-elevated border border-border-theme text-xs sm:text-sm text-text-main placeholder:text-text-muted/70 focus:outline-none focus:border-gold/60 shadow-inner'
          />
        </div>

        {/* Cities Grid / List */}
        <div className='flex-1 overflow-y-auto space-y-1.5 pr-1 mb-4 scrollbar-thin'>
          {filteredCities.map((item) => {
            const isSelected =
              !currentLocation.isGps &&
              (currentLocation.city === item.city ||
                currentLocation.label === item.label);

            return (
              <button
                key={item.city}
                type='button'
                onClick={() => {
                  onSelectCity(item);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition cursor-pointer text-xs sm:text-sm ${
                  isSelected
                    ? 'bg-gold/15 border-gold/50 text-gold font-bold shadow-2xs'
                    : 'bg-bg-elevated/50 border-border-theme/60 text-text-main hover:bg-bg-elevated hover:border-gold/30'
                }`}>
                <div className='flex items-center gap-2.5'>
                  <i
                    className={`fas fa-city text-xs ${
                      isSelected ? 'text-gold' : 'text-text-muted'
                    }`}></i>
                  <span>{item.label}</span>
                  <span className='text-[11px] text-text-muted'>
                    ({item.countryLabel})
                  </span>
                </div>
                {isSelected && (
                  <i className='fas fa-check text-gold text-xs'></i>
                )}
              </button>
            );
          })}
        </div>

        {/* Calculation Method Accordion */}
        <div className='pt-3 border-t border-border-theme/60'>
          <button
            type='button'
            onClick={() => setShowMethods(!showMethods)}
            className='flex items-center justify-between w-full text-xs text-text-muted hover:text-text-main py-1 cursor-pointer'>
            <span className='flex items-center gap-1.5'>
              <i className='fas fa-calculator text-gold/80 text-[11px]'></i>
              <span>طريقة حساب المواقيت الفلكية</span>
            </span>
            <i
              className={`fas fa-chevron-${
                showMethods ? 'up' : 'down'
              } text-[10px]`}></i>
          </button>

          {showMethods && (
            <div className='mt-2.5 space-y-1 max-h-36 overflow-y-auto pr-1 text-xs'>
              {CALCULATION_METHODS.map((method) => {
                const active = (currentLocation.method || 4) === method.id;
                return (
                  <button
                    key={method.id}
                    type='button'
                    onClick={() => onSelectMethod(method.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-right transition cursor-pointer ${
                      active
                        ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                        : 'text-text-muted hover:text-text-main hover:bg-bg-elevated'
                    }`}>
                    <span>{method.name}</span>
                    {active && <i className='fas fa-check text-xs'></i>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
