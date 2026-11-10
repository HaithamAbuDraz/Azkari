import React from 'react';
import { getDisplayCityName } from '../../../utils/location';

export default function NextPrayerHero({
  prayerSchedule,
  location,
  onOpenLocationModal,
  audioEnabled,
  onToggleAudio,
  hijriDate,
  isAdhanPlaying,
  onToggleAdhanTest,
  alertType,
}) {
  if (!prayerSchedule?.nextPrayer) return null;

  const { nextPrayer, countdownFormatted, progress, isNextTomorrow } =
    prayerSchedule;
  const cityName = getDisplayCityName(location);

  return (
    <div className='relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-bg-card via-bg-elevated/80 to-bg-card border border-border-theme shadow-md mb-8 transition-all'>
      {/* Subtle Islamic Ambient Glow behind card */}
      <div
        className='absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none'
        aria-hidden='true'
      />
      <div
        className='absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none'
        aria-hidden='true'
      />

      <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-6'>
        {/* Left / Main info */}
        <div className='flex flex-col items-center md:items-start text-center md:text-right'>
          {/* Top Pill with Location & Hijri Date */}
          <div className='flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3.5'>
            {/* City Selector Button */}
            <button
              type='button'
              onClick={onOpenLocationModal}
              aria-label='تغيير المدينة والموقع الجغرافي'
              className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 active:scale-95 transition cursor-pointer shadow-2xs'>
              <i
                className={
                  location.isGps
                    ? 'fas fa-location-crosshairs text-[11px]'
                    : 'fas fa-location-dot text-[11px]'
                }></i>
              <span>{cityName || 'موقعي الحالي'}</span>
              <i className='fas fa-chevron-down text-[9px] opacity-70 mr-0.5'></i>
            </button>

            {/* Hijri Date Pill if available */}
            {hijriDate && (
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-bg-elevated border border-border-theme text-text-muted'>
                <i className='fas fa-moon text-gold text-[10px]'></i>
                <span>
                  {hijriDate.day} {hijriDate.month?.ar} {hijriDate.year} هـ
                </span>
              </span>
            )}
          </div>

          {/* Next Prayer Title */}
          <span className='text-xs sm:text-sm font-medium text-text-muted mb-1'>
            {isNextTomorrow ? 'الصلاة القادمة غداً' : 'الصلاة القادمة'}
          </span>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold font-amiri text-text-arabic flex items-center gap-3'>
            <span>صلاة {nextPrayer.label}</span>
            <span className='text-lg sm:text-2xl font-mono text-gold'>
              {nextPrayer.time12}
            </span>
          </h2>
        </div>

        {/* Right: Large Countdown Box & Audio Toggle */}
        <div className='flex flex-col items-center md:items-end w-full md:w-auto'>
          <div className='flex items-center gap-2 mb-2 flex-wrap justify-center md:justify-end'>
            {/* Audio Preview / Stop Test Button */}
            <button
              type='button'
              onClick={onToggleAdhanTest}
              title={
                isAdhanPlaying
                  ? 'إيقاف الصوت الحالي'
                  : alertType === 'short_reminder'
                    ? 'تجربة التنبيه الصوتي الناطق'
                    : 'تجربة الاستماع للأذان'
              }
              aria-label={
                isAdhanPlaying
                  ? 'إيقاف الصوت'
                  : alertType === 'short_reminder'
                    ? 'تجربة التنبيه الصوتي الناطق'
                    : 'تجربة الاستماع للأذان'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs border ${
                isAdhanPlaying
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                  : 'bg-bg-elevated text-text-muted hover:text-gold border-border-theme hover:border-gold/40'
              }`}>
              <i
                className={`text-[10px] ${
                  isAdhanPlaying
                    ? 'fas fa-stop'
                    : alertType === 'short_reminder'
                      ? 'fas fa-bullhorn text-gold'
                      : 'fas fa-volume-high text-gold'
                }`}></i>
              <span>
                {isAdhanPlaying
                  ? alertType === 'short_reminder'
                    ? 'إيقاف التنبيه'
                    : alertType === 'takbeerat'
                      ? 'إيقاف التكبيرات'
                      : alertType === 'chime'
                        ? 'إيقاف الرنين'
                        : 'إيقاف الأذان'
                  : alertType === 'short_reminder'
                    ? 'تجربة التنبيه الناطق'
                    : alertType === 'takbeerat'
                      ? 'تجربة التكبيرات'
                      : alertType === 'chime'
                        ? 'تجربة الرنين'
                        : 'تجربة الأذان'}
              </span>
            </button>

            {/* Audio notification toggle */}
            <button
              type='button'
              onClick={onToggleAudio}
              title={
                audioEnabled
                  ? 'التنبيه الصوتي مفعّل عند حلول الأذان'
                  : 'التنبيه الصوتي معطّل'
              }
              aria-label={
                audioEnabled ? 'تعطيل صوت التنبيه' : 'تفعيل صوت التنبيه'
              }
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition cursor-pointer border ${
                audioEnabled
                  ? 'bg-gold/15 text-gold border-gold/40 shadow-2xs'
                  : 'bg-bg-elevated text-text-muted border-border-theme hover:text-text-main'
              }`}>
              <i
                className={
                  audioEnabled ? 'fas fa-bell' : 'fas fa-bell-slash'
                }></i>
            </button>
          </div>

          {/* Big monospaced digital timer */}
          <div
            className='px-5 py-2.5 rounded-2xl bg-bg-elevated/90 border border-gold/30 text-text-arabic font-mono font-bold text-3xl sm:text-4xl tracking-wider shadow-inner text-gold flex items-center justify-center min-w-[210px]'
            dir='ltr'
            aria-live='off'>
            {countdownFormatted}
          </div>
        </div>
      </div>

      {/* Interval Progress Bar */}
      <div className='mt-6 pt-4 border-t border-border-theme/40'>
        <div className='flex items-center justify-between text-[11px] sm:text-xs text-text-muted mb-1.5'>
          <span>
            {prayerSchedule.prevPrayer
              ? `منذ ${prayerSchedule.prevPrayer.label}`
              : 'منذ الصلاة السابقة'}
          </span>
          <span>{Math.round(progress * 100)}%</span>
          <span>صلاة {nextPrayer.label}</span>
        </div>
        <div
          className='w-full h-2 rounded-full bg-bg-elevated overflow-hidden border border-border-theme/60'
          role='progressbar'
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin='0'
          aria-valuemax='100'>
          <div
            className='h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-1000 ease-linear'
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
