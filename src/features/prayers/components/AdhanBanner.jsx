import React from 'react';

export default function AdhanBanner({
  isAdhanPlaying,
  activePrayer,
  autoplayBlocked,
  onStartAdhan,
  onStopAdhan,
  currentMuezzin,
  onSelectTab,
  alertType = 'full_adhan',
}) {
  if (!isAdhanPlaying && !autoplayBlocked) return null;

  const isShortReminder = alertType === 'short_reminder';
  const isTakbeerat = alertType === 'takbeerat';
  const isChime = alertType === 'chime';

  // Badge text
  const badgeText = isShortReminder
    ? 'تنبيه صوتي ناطق'
    : isTakbeerat
      ? 'تكبيرات الأذان'
      : isChime
        ? 'تنبيه موعد الصلاة'
        : isAdhanPlaying
          ? 'يُرفع الآن الأذان'
          : 'حان وقت الصلاة';

  // Banner title
  const bannerTitle = isShortReminder
    ? `حان الآن موعد أذان ${activePrayer ? `صلاة ${activePrayer}` : 'الصلاة'}`
    : isTakbeerat
      ? `تكبيرات أذان ${activePrayer ? `صلاة ${activePrayer}` : 'الصلاة'}`
      : isChime
        ? `حان موعد ${activePrayer ? `صلاة ${activePrayer}` : 'الصلاة'}`
        : `أذان ${activePrayer ? `صلاة ${activePrayer}` : 'الصلاة'}`;

  // Subtitle (only show muezzin for full adhan and takbeerat)
  const subtitle = isShortReminder
    ? 'تنبيه صوتي لدخول وقت الصلاة'
    : isChime
      ? 'نغمة تنبيه روحانية'
      : currentMuezzin
        ? `بصوت: ${currentMuezzin.name}`
        : null;

  // Icon
  const iconClass = isShortReminder
    ? 'fas fa-bullhorn'
    : isChime
      ? 'fas fa-bell'
      : 'fas fa-mosque';

  // Stop button label
  const stopButtonLabel = isShortReminder
    ? 'إيقاف التنبيه'
    : isTakbeerat
      ? 'إيقاف التكبيرات'
      : isChime
        ? 'إيقاف الرنين'
        : 'إيقاف الأذان';

  // Play button label
  const playButtonLabel = isShortReminder
    ? 'تشغيل التنبيه'
    : isTakbeerat
      ? 'تشغيل التكبيرات'
      : 'تشغيل صوت الأذان';

  return (
    <div
      role='alert'
      aria-live='assertive'
      className='fixed bottom-5 inset-x-4 max-w-xl mx-auto z-50 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-bg-card via-bg-elevated to-bg-card border-2 border-gold shadow-2xl backdrop-blur-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce-in'>
      {/* Icon & Details */}
      <div className='flex items-center gap-3.5 w-full sm:w-auto text-center sm:text-right'>
        <div className='w-12 h-12 rounded-2xl bg-gold/20 border border-gold/40 text-gold flex items-center justify-center text-xl shrink-0 shadow-xs'>
          <i className={iconClass}></i>
        </div>

        <div className='flex-1'>
          <div className='flex items-center justify-center sm:justify-start gap-2 mb-0.5'>
            <span className='w-2 h-2 rounded-full bg-emerald-400 animate-ping' />
            <span className='text-xs font-bold text-gold'>{badgeText}</span>
          </div>

          <h4 className='text-base sm:text-lg font-bold font-tajawal text-text-main'>
            {bannerTitle}
          </h4>

          {subtitle && (
            <p className='text-[11px] text-text-muted'>{subtitle}</p>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className='flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end shrink-0'>
        {autoplayBlocked ? (
          <button
            type='button'
            onClick={() => onStartAdhan(activePrayer)}
            className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gold text-bg-deep hover:bg-gold-bright active:scale-95 transition cursor-pointer shadow-md animate-pulse'>
            <i className='fas fa-volume-high text-xs'></i>
            <span>{playButtonLabel}</span>
          </button>
        ) : (
          <button
            type='button'
            onClick={onStopAdhan}
            className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 active:scale-95 transition cursor-pointer shadow-2xs'>
            <i className='fas fa-stop text-xs'></i>
            <span>{stopButtonLabel}</span>
          </button>
        )}

        {/* Quick jump to after prayer azkar */}
        {onSelectTab && (
          <button
            type='button'
            onClick={() => {
              onStopAdhan();
              onSelectTab('salah');
            }}
            title='الانتقال لأذكار بعد الصلاة'
            className='p-2.5 rounded-xl bg-bg-elevated border border-border-theme hover:border-gold/40 text-text-muted hover:text-gold transition cursor-pointer text-xs'
            aria-label='الانتقال لأذكار بعد الصلاة'>
            <i className='fas fa-kaaba'></i>
          </button>
        )}
      </div>
    </div>
  );
}
