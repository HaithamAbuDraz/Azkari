import React, { useState, useMemo, useEffect } from 'react';
import {
  POPULAR_CITIES,
  CALCULATION_METHODS,
  MUEZZINS,
  ALERT_TYPES,
} from '../../../constants/prayers';
import { preloadAdhanAudio } from '../../../utils/sound';

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectCity,
  onRequestGps,
  isGpsLoading,
  currentMethod,
  onSelectMethod,
  currentMuezzinId,
  onSelectMuezzin,
  currentAlertType,
  onSelectAlertType,
  onPreviewAlert,
  onPreviewMuezzin,
  isAdhanPlaying,
  onStopAudio,
}) {
  const [search, setSearch] = useState('');
  const [showMethods, setShowMethods] = useState(false);
  const [showMuezzins, setShowMuezzins] = useState(false);
  const [showAlertTypes, setShowAlertTypes] = useState(false);

  // Preload top muezzin audio files for instant auditioning
  useEffect(() => {
    if (isOpen) {
      MUEZZINS.slice(0, 5).forEach((m) => {
        if (m.url) preloadAdhanAudio(m.url);
      });
    }
  }, [isOpen]);

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

        {/* Alert Type Selection Accordion */}
        <div className='pt-3 border-t border-border-theme/60'>
          <button
            type='button'
            onClick={() => setShowAlertTypes(!showAlertTypes)}
            className='flex items-center justify-between w-full text-xs text-text-muted hover:text-text-main py-1 cursor-pointer'>
            <span className='flex items-center gap-1.5'>
              <i className='fas fa-bell text-gold/80 text-[11px]'></i>
              <span>نوع التنبيه عند دخول وقت الصلاة</span>
            </span>
            <i
              className={`fas fa-chevron-${
                showAlertTypes ? 'up' : 'down'
              } text-[10px]`}></i>
          </button>

          {showAlertTypes && (
            <div className='mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs'>
              {ALERT_TYPES.map((type) => {
                const active = (currentAlertType || 'full_adhan') === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => onSelectAlertType(type.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition cursor-pointer select-none ${
                      active
                        ? 'bg-gold/20 text-gold font-bold border border-gold/40'
                        : 'text-text-muted hover:text-text-main hover:bg-bg-elevated border border-transparent'
                    }`}>
                    <div className='flex items-center gap-2.5 flex-1 min-w-0'>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          active
                            ? 'bg-gold/20 text-gold'
                            : 'bg-bg-elevated text-text-muted'
                        }`}>
                        <i className={type.icon}></i>
                      </div>
                      <div className='truncate'>
                        <span className='font-bold block truncate'>
                          {type.label}
                        </span>
                        <span className='text-[10px] text-text-muted font-normal block truncate'>
                          {type.desc}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 shrink-0 mr-2'>
                      {onPreviewAlert && (
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewAlert(type.id);
                          }}
                          title={`تجربة ${type.label}`}
                          className='px-2 py-1 rounded-lg text-[10px] bg-bg-elevated hover:bg-gold/20 text-gold border border-gold/30 transition cursor-pointer active:scale-95'>
                          <i className='fas fa-play text-[9px] ml-1'></i>
                          تجربة
                        </button>
                      )}
                      {active && (
                        <i className='fas fa-check text-xs text-gold'></i>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Muezzin Voice Selection Accordion */}
        <div className='pt-3 border-t border-border-theme/60'>
          <button
            type='button'
            onClick={() => setShowMuezzins(!showMuezzins)}
            className='flex items-center justify-between w-full text-xs text-text-muted hover:text-text-main py-1 cursor-pointer'>
            <span className='flex items-center gap-1.5'>
              <i className='fas fa-mosque text-gold/80 text-[11px]'></i>
              <span>صوت الأذان والمؤذن ({MUEZZINS.length} مؤذنين)</span>
            </span>
            <i
              className={`fas fa-chevron-${
                showMuezzins ? 'up' : 'down'
              } text-[10px]`}></i>
          </button>

          {showMuezzins && (
            <div className='mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs'>
              {currentAlertType === 'short_reminder' && (
                <div className='p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 mb-2'>
                  <i className='fas fa-circle-info mr-1 text-amber-400'></i>
                  <span>
                    أنت مفعل حالياً التنبيه الصوتي الناطق (حان الآن موعد
                    أذان...). اختيار المؤذن أدناه ينطبق عند اختيار الأذان الكامل
                    أو التكبيرات.
                  </span>
                </div>
              )}
              {MUEZZINS.map((muezzin) => {
                const active = (currentMuezzinId || 'mishary') === muezzin.id;
                return (
                  <div
                    key={muezzin.id}
                    onClick={() => onSelectMuezzin(muezzin.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition cursor-pointer select-none ${
                      active
                        ? 'bg-gold/20 text-gold font-bold border border-gold/40'
                        : 'text-text-muted hover:text-text-main hover:bg-bg-elevated border border-transparent'
                    }`}>
                    <div className='truncate flex-1 min-w-0'>
                      <span className='block font-bold truncate'>
                        {muezzin.name}
                      </span>
                      {muezzin.location && (
                        <span className='text-[10px] text-text-muted font-normal block truncate'>
                          {muezzin.location}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2 shrink-0 mr-2'>
                      {onPreviewMuezzin && (
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewMuezzin(muezzin.id);
                          }}
                          title={`استماع لصوت ${muezzin.name}`}
                          className='px-2 py-1 rounded-lg text-[10px] bg-bg-elevated hover:bg-gold/20 text-gold border border-gold/30 transition cursor-pointer active:scale-95'>
                          <i className='fas fa-play text-[9px] ml-1'></i>
                          استماع
                        </button>
                      )}
                      {active && (
                        <i className='fas fa-check text-xs text-gold'></i>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
