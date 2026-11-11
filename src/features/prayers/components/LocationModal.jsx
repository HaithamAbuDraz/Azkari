import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MODAL_BACKDROP_VARIANTS,
  MODAL_PANEL_VARIANTS,
} from '../../../constants/motion';
import {
  POPULAR_CITIES,
  CALCULATION_METHODS,
  MUEZZINS,
  ALERT_TYPES,
} from '../../../constants/prayers';
import {
  preloadMuezzinList,
  stopMuezzinListPreload,
} from '../../../utils/sound';

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
  playingMuezzinId,
  isAudioLoading,
  onStopAudio,
  initialTab = 'location',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState('muezzins'); // 'methods' | 'alertTypes' | 'muezzins'

  // Sync activeTab when modal opens with a specific requested tab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Gently pre-warm muezzin audio cache sequentially when browsing voices
  useEffect(() => {
    if (
      !isOpen ||
      activeTab !== 'settings' ||
      openSection !== 'muezzins' ||
      isAdhanPlaying ||
      isAudioLoading
    ) {
      return;
    }

    const urls = MUEZZINS.map((m) => m.url).filter(Boolean);
    const timer = setTimeout(() => {
      preloadMuezzinList(urls);
    }, 300);

    return () => {
      clearTimeout(timer);
      stopMuezzinListPreload();
    };
  }, [isOpen, activeTab, openSection, isAdhanPlaying, isAudioLoading]);

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

  // Active labels helper for quick badges
  const activeMethodObj = useMemo(() => {
    const methodId = currentMethod ?? currentLocation.method ?? 4;
    return (
      CALCULATION_METHODS.find((m) => m.id === methodId) ||
      CALCULATION_METHODS[0]
    );
  }, [currentMethod, currentLocation.method]);

  const activeAlertObj = useMemo(() => {
    return (
      ALERT_TYPES.find((t) => t.id === (currentAlertType || 'full_adhan')) ||
      ALERT_TYPES[0]
    );
  }, [currentAlertType]);

  const activeMuezzinObj = useMemo(() => {
    return (
      MUEZZINS.find((m) => m.id === (currentMuezzinId || 'mishary')) ||
      MUEZZINS[0]
    );
  }, [currentMuezzinId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={MODAL_BACKDROP_VARIANTS}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='fixed inset-0 bg-black/75 backdrop-blur-xs z-50'
            onClick={onClose}
            aria-hidden='true'
          />

          {/* Centered Modal Viewport Wrapper */}
          <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none'>
            {/* Modal Dialog */}
            <motion.div
              variants={MODAL_PANEL_VARIANTS}
              initial='hidden'
              animate='visible'
              exit='exit'
              role='dialog'
              aria-modal='true'
              aria-label={
                activeTab === 'location'
                  ? 'اختيار المدينة والموقع الجغرافي'
                  : 'خيارات المواقيت وتنبيهات الأذان'
              }
              className='pointer-events-auto w-full max-w-lg bg-bg-card border border-border-theme rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col'>
              {/* Header */}
              <div className='flex items-center justify-between pb-3 sm:pb-4 border-b border-border-theme/60 mb-3'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm border shadow-2xs transition-colors ${
                      activeTab === 'location'
                        ? 'bg-gold/15 border-gold/30 text-gold'
                        : 'bg-primary/15 border-primary/30 text-primary'
                    }`}>
                    <i
                      className={`fas ${
                        activeTab === 'location'
                          ? 'fa-location-dot'
                          : 'fa-sliders'
                      }`}></i>
                  </div>
                  <div>
                    <h3 className='text-base sm:text-lg font-bold font-tajawal text-text-main'>
                      {activeTab === 'location'
                        ? 'اختيار المدينة والموقع'
                        : 'خيارات المواقيت والأذان'}
                    </h3>
                    <p className='text-[11px] sm:text-xs text-text-muted'>
                      {activeTab === 'location'
                        ? 'لتحديد مواقيت الصلاة واتجاه القبلة بدقة'
                        : 'تخصيص الحساب الفلكي ونوع التنبيه وصوت المؤذن'}
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={onClose}
                  aria-label='إغلاق النافذة'
                  className='w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-bg-elevated transition cursor-pointer'>
                  <i className='fas fa-times text-sm'></i>
                </button>
              </div>

              {/* Top Segmented Controls: Two distinct buttons with sliding pill */}
              <div className='grid grid-cols-2 gap-1.5 p-1 bg-bg-elevated/90 rounded-2xl border border-border-theme/80 mb-3.5 shadow-inner'>
                <button
                  type='button'
                  onClick={() => setActiveTab('location')}
                  className={`relative z-10 flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'location'
                      ? 'text-gold'
                      : 'text-text-muted hover:text-text-main'
                  }`}>
                  {activeTab === 'location' && (
                    <motion.span
                      layoutId='location-modal-tab'
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 32,
                      }}
                      className='absolute inset-0 rounded-xl bg-gold/20 border border-gold/40 shadow-xs -z-10'
                    />
                  )}
                  <i className='fas fa-location-dot text-xs text-gold'></i>
                  <span>اختيار المدينة والموقع</span>
                </button>

                <button
                  type='button'
                  onClick={() => setActiveTab('settings')}
                  className={`relative z-10 flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'text-gold'
                      : 'text-text-muted hover:text-text-main'
                  }`}>
                  {activeTab === 'settings' && (
                    <motion.span
                      layoutId='location-modal-tab'
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 32,
                      }}
                      className='absolute inset-0 rounded-xl bg-gold/20 border border-gold/40 shadow-xs -z-10'
                    />
                  )}
                  <i className='fas fa-sliders text-xs text-gold'></i>
                  <span>خيارات المواقيت والأذان</span>
                </button>
              </div>

              {/* TAB 1: LOCATION & GPS */}
              {activeTab === 'location' && (
                <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
                  {/* GPS Button */}
                  <button
                    type='button'
                    onClick={() => {
                      onRequestGps();
                      onClose();
                    }}
                    disabled={isGpsLoading}
                    title='استخدام موقعي الجغرافي الحالي تلقائياً عبر GPS'
                    className={`group flex items-center justify-between w-full p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer mb-3 shadow-2xs active:scale-[0.99] ${
                      currentLocation.isGps
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'bg-gradient-to-r from-primary/15 via-gold/15 to-primary/15 border-gold/40 text-text-main hover:border-gold hover:shadow-xs'
                    }`}>
                    <div className='flex items-center gap-2.5 sm:gap-3'>
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-transform group-hover:scale-105 ${
                          currentLocation.isGps
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-gold/20 text-gold'
                        }`}>
                        <i
                          className={`fas fa-location-crosshairs ${
                            isGpsLoading ? 'animate-spin' : ''
                          }`}></i>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-xs sm:text-sm flex items-center gap-2'>
                          <span>
                            {isGpsLoading
                              ? 'جاري تحديد موقعك الجغرافي...'
                              : 'استخدام موقعي الجغرافي الحالي (GPS)'}
                          </span>
                          {currentLocation.isGps && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-normal border border-emerald-500/30'>
                              مفعل حالياً
                            </span>
                          )}
                        </div>
                        <p className='text-[10px] sm:text-[11px] text-text-muted mt-0.5'>
                          تحديد الإحداثيات آلياً بالأقمار الصناعية بدقة عالية
                        </p>
                      </div>
                    </div>
                    <i className='fas fa-chevron-left text-xs text-gold/70 group-hover:text-gold group-hover:-translate-x-1 transition-all'></i>
                  </button>

                  {/* Search Input */}
                  <div className='relative mb-2.5'>
                    <div className='absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted'>
                      <i className='fas fa-magnifying-glass text-xs text-gold/80'></i>
                    </div>
                    <input
                      type='text'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='ابحث عن مدينة أو دولة (مثال: القدس، مكة، القاهرة...)'
                      className='w-full pl-8 pr-9 py-2.5 rounded-xl bg-bg-elevated border border-border-theme text-xs sm:text-sm text-text-main placeholder:text-text-muted/70 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 shadow-inner transition'
                    />
                    {search && (
                      <button
                        type='button'
                        onClick={() => setSearch('')}
                        aria-label='مسح البحث'
                        className='absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted hover:text-text-main cursor-pointer'>
                        <i className='fas fa-xmark text-xs'></i>
                      </button>
                    )}
                  </div>

                  {/* Cities List with Custom Dark/Gold Scrollbar */}
                  <div className='flex-1 overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar min-h-[220px] max-h-[380px]'>
                    {filteredCities.length === 0 ? (
                      <div className='py-8 text-center text-text-muted text-xs'>
                        <i className='fas fa-map-location-dot text-2xl text-gold/40 mb-2 block'></i>
                        <span>لم يتم العثور على مدينة تطابق بحثك</span>
                      </div>
                    ) : (
                      filteredCities.map((item) => {
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
                      })
                    )}
                  </div>

                  {/* Bottom helper pill navigating to settings */}
                  <div className='pt-3 mt-2 border-t border-border-theme/60 flex items-center justify-between text-xs text-text-muted'>
                    <span>تريد ضبط صوت الأذان أو الحساب الفلكي؟</span>
                    <button
                      type='button'
                      onClick={() => setActiveTab('settings')}
                      className='text-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer'>
                      <span>خيارات المواقيت والأذان</span>
                      <i className='fas fa-arrow-left text-[10px]'></i>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PRAYER & ADHAN OPTIONS (The 3 Options Improved) */}
              {activeTab === 'settings' && (
                <div className='flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar max-h-[500px]'>
                  {/* Section 1: Calculation Method */}
                  <div className='rounded-2xl border border-border-theme/80 bg-bg-elevated/40 p-3 sm:p-3.5'>
                    <button
                      type='button'
                      onClick={() =>
                        setOpenSection(
                          openSection === 'methods' ? '' : 'methods'
                        )
                      }
                      className='flex items-center justify-between w-full text-right cursor-pointer select-none'>
                      <div className='flex items-center gap-2.5'>
                        <div className='w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center text-xs'>
                          <i className='fas fa-calculator'></i>
                        </div>
                        <div>
                          <h4 className='text-xs sm:text-sm font-bold text-text-main'>
                            طريقة حساب المواقيت الفلكية
                          </h4>
                          <p className='text-[10px] sm:text-[11px] text-gold font-medium mt-0.5'>
                            المعتمدة حالياً: {activeMethodObj.name}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <i
                          className={`fas fa-chevron-${
                            openSection === 'methods' ? 'up' : 'down'
                          } text-xs text-text-muted`}></i>
                      </div>
                    </button>

                    {openSection === 'methods' && (
                      <div className='mt-3 pt-3 border-t border-border-theme/60 space-y-1.5 text-xs'>
                        {CALCULATION_METHODS.map((method) => {
                          const active =
                            (currentMethod ?? currentLocation.method ?? 4) ===
                            method.id;
                          return (
                            <button
                              key={method.id}
                              type='button'
                              onClick={() => onSelectMethod(method.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition cursor-pointer ${
                                active
                                  ? 'bg-gold/15 text-gold font-bold border border-gold/40'
                                  : 'text-text-muted hover:text-text-main hover:bg-bg-elevated border border-transparent'
                              }`}>
                              <span>{method.name}</span>
                              {active && (
                                <i className='fas fa-check text-xs text-gold'></i>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Alert Types */}
                  <div className='rounded-2xl border border-border-theme/80 bg-bg-elevated/40 p-3 sm:p-3.5'>
                    <button
                      type='button'
                      onClick={() =>
                        setOpenSection(
                          openSection === 'alertTypes' ? '' : 'alertTypes'
                        )
                      }
                      className='flex items-center justify-between w-full text-right cursor-pointer select-none'>
                      <div className='flex items-center gap-2.5'>
                        <div className='w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center text-xs'>
                          <i className='fas fa-bell'></i>
                        </div>
                        <div>
                          <h4 className='text-xs sm:text-sm font-bold text-text-main'>
                            نوع التنبيه عند دخول وقت الصلاة
                          </h4>
                          <p className='text-[10px] sm:text-[11px] text-gold font-medium mt-0.5'>
                            النوع المختار: {activeAlertObj.label}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <i
                          className={`fas fa-chevron-${
                            openSection === 'alertTypes' ? 'up' : 'down'
                          } text-xs text-text-muted`}></i>
                      </div>
                    </button>

                    {openSection === 'alertTypes' && (
                      <div className='mt-3 pt-3 border-t border-border-theme/60 space-y-2 text-xs'>
                        {ALERT_TYPES.map((type) => {
                          const active =
                            (currentAlertType || 'full_adhan') === type.id;
                          return (
                            <div
                              key={type.id}
                              onClick={() => onSelectAlertType(type.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition cursor-pointer select-none ${
                                active
                                  ? 'bg-gold/20 text-gold font-bold border border-gold/40 shadow-2xs'
                                  : 'text-text-muted hover:text-text-main hover:bg-bg-elevated border border-border-theme/40'
                              }`}>
                              <div className='flex items-center gap-2.5 flex-1 min-w-0'>
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                                    active
                                      ? 'bg-gold/25 text-gold'
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
                                    className='px-2.5 py-1 rounded-lg text-[10px] font-bold bg-bg-elevated hover:bg-gold/20 text-gold border border-gold/30 transition cursor-pointer active:scale-95'>
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

                  {/* Section 3: Muezzin Voices */}
                  <div className='rounded-2xl border border-border-theme/80 bg-bg-elevated/40 p-3 sm:p-3.5'>
                    <button
                      type='button'
                      onClick={() =>
                        setOpenSection(
                          openSection === 'muezzins' ? '' : 'muezzins'
                        )
                      }
                      className='flex items-center justify-between w-full text-right cursor-pointer select-none'>
                      <div className='flex items-center gap-2.5'>
                        <div className='w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center text-xs'>
                          <i className='fas fa-mosque'></i>
                        </div>
                        <div>
                          <h4 className='text-xs sm:text-sm font-bold text-text-main'>
                            صوت الأذان والمؤذن ({MUEZZINS.length} مؤذنين)
                          </h4>
                          <p className='text-[10px] sm:text-[11px] text-gold font-medium mt-0.5'>
                            المؤذن المختار: {activeMuezzinObj.name}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <i
                          className={`fas fa-chevron-${
                            openSection === 'muezzins' ? 'up' : 'down'
                          } text-xs text-text-muted`}></i>
                      </div>
                    </button>

                    {openSection === 'muezzins' && (
                      <div className='mt-3 pt-3 border-t border-border-theme/60 space-y-2 text-xs'>
                        {currentAlertType === 'short_reminder' && (
                          <div className='p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 mb-2 flex items-center gap-2'>
                            <i className='fas fa-circle-info text-amber-400 shrink-0 text-xs'></i>
                            <span>
                              أنت مفعل حالياً التنبيه الصوتي الناطق. اختيار
                              المؤذن أدناه يُطبق عند اختيار الأذان الكامل أو
                              التكبيرات.
                            </span>
                          </div>
                        )}

                        {MUEZZINS.map((muezzin) => {
                          const isSelected =
                            (currentMuezzinId || 'mishary') === muezzin.id;
                          const isPlayingThis =
                            isAdhanPlaying && playingMuezzinId === muezzin.id;
                          const isLoadingThis =
                            isAudioLoading && playingMuezzinId === muezzin.id;

                          return (
                            <div
                              key={muezzin.id}
                              onClick={() => onSelectMuezzin(muezzin.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-gold/20 text-gold font-bold border border-gold/40 shadow-2xs'
                                  : 'text-text-muted hover:text-text-main hover:bg-bg-elevated border border-border-theme/40'
                              }`}>
                              <div className='truncate flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                  <span className='block font-bold truncate text-xs sm:text-sm'>
                                    {muezzin.name}
                                  </span>
                                  {isPlayingThis && (
                                    <span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-normal animate-pulse'>
                                      <i className='fas fa-volume-high text-[9px]'></i>
                                      <span>يعمل الآن</span>
                                    </span>
                                  )}
                                </div>
                                {muezzin.location && (
                                  <span className='text-[10px] text-text-muted font-normal block truncate mt-0.5'>
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
                                      if (isPlayingThis || isLoadingThis) {
                                        if (onStopAudio) onStopAudio();
                                      } else {
                                        onPreviewMuezzin(muezzin.id);
                                      }
                                    }}
                                    title={
                                      isPlayingThis
                                        ? `إيقاف صوت ${muezzin.name}`
                                        : `استماع لصوت ${muezzin.name}`
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs ${
                                      isPlayingThis
                                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                                        : isLoadingThis
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                          : 'bg-bg-elevated hover:bg-gold/20 text-gold border-gold/30'
                                    }`}>
                                    {isLoadingThis ? (
                                      <>
                                        <i className='fas fa-spinner animate-spin text-[9px]'></i>
                                        <span>جاري التحميل...</span>
                                      </>
                                    ) : isPlayingThis ? (
                                      <>
                                        <i className='fas fa-stop text-[9px] text-rose-400'></i>
                                        <span>إيقاف</span>
                                      </>
                                    ) : (
                                      <>
                                        <i className='fas fa-play text-[9px] text-gold'></i>
                                        <span>استماع</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                {isSelected && (
                                  <i
                                    className='fas fa-check text-xs text-gold'
                                    title='المؤذن المعتمد'></i>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
