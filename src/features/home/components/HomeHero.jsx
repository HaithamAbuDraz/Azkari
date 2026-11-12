import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  CloudMoon,
  Compass,
  Heart,
  MapPin,
  Sparkles,
  Sun,
} from 'lucide-react';
import { getDefaultTab, PANELS } from '../../../constants/tabs';
import { getDisplayCityName } from '../../../utils/location';
import { cn } from '../../../utils/cn';
import {
  containerVariants,
  itemVariants,
  cardHoverSpring,
  PORTAL_ICONS,
} from '../constants/homeData';
import {
  GirihMandala,
  KhatamDivider,
  ManuscriptCorners,
} from './IslamicOrnament';

/**
 * Hero & Quick-Access Banner featuring live Hijri date, digital clock,
 * breathing Next Prayer countdown pill, Quranic verse callout, and CTAs.
 */
export default function HomeHero({
  clock,
  prayerSchedule,
  hijriDate,
  location,
  favoritesCount = 0,
  onSelectTab,
}) {
  const recommendedTab = getDefaultTab();
  const recommendedMeta = PANELS[recommendedTab] || PANELS.morning;
  const RecommendedIcon = PORTAL_ICONS[recommendedTab] || PORTAL_ICONS.morning;
  const PrayersIcon = PORTAL_ICONS.prayers;

  const tasbihCount = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const parsed = parseInt(localStorage.getItem('tasbih-current-count'), 10);
      return !Number.isNaN(parsed) && parsed >= 0 ? parsed : 0;
    } catch {
      return 0;
    }
  }, []);

  const cityName = getDisplayCityName(location);
  const nextPrayer = prayerSchedule?.nextPrayer;

  const hijriLabel = hijriDate
    ? `${hijriDate.day} ${hijriDate.month?.ar} ${hijriDate.year} هـ`
    : clock.dateStr;

  const scrollToPortals = () => {
    const el = document.getElementById('sanctuary-portals');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8'
      aria-label='الترحيب وبوابة أذكاري'>
      <div
        style={{
          boxShadow:
            'var(--glass-highlight), 0 24px 56px -18px rgba(16, 27, 23, 0.14)',
        }}
        className='relative overflow-hidden rounded-[2rem] sm:rounded-[2.75rem] bg-[var(--glass-card)] backdrop-blur-xl border border-[var(--border-accent)] px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 transition-colors duration-300'>
        {/* Architectural inner hairline frame */}
        <div
          className='absolute inset-2.5 sm:inset-4 rounded-[1.5rem] sm:rounded-[2.1rem] border border-[var(--gold)]/25 pointer-events-none'
          aria-hidden='true'
        />

        <ManuscriptCorners />

        {/* Ambient hero glows */}
        <div
          className='absolute -top-32 left-1/2 -translate-x-1/2 w-[34rem] h-[22rem] rounded-full bg-[var(--gold)]/10 blur-3xl pointer-events-none'
          aria-hidden='true'
        />
        <div
          className='absolute -bottom-32 right-1/4 w-96 h-64 rounded-full bg-[var(--primary)]/12 blur-3xl pointer-events-none'
          aria-hidden='true'
        />

        {/* Rotating Girih sacred geometry centerpiece watermark */}
        <div
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] text-[var(--gold)]/15 pointer-events-none select-none'
          aria-hidden='true'>
          <GirihMandala className='w-full h-full mandala-spin' />
        </div>

        {/* Hero centerpiece content */}
        <motion.div
          className='relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto'
          variants={containerVariants}
          initial='hidden'
          animate='visible'>
          {/* Top Bar / Status Pill: Clock, Hijri date & Breathing Next Prayer Countdown */}
          <motion.div
            variants={itemVariants}
            className='inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-[var(--glass-elevated)] border border-[var(--gold)]/35 backdrop-blur-md text-xs text-[var(--text-muted)] shadow-sm mb-6'>
            {/* Ticking digital clock */}
            <span className='inline-flex items-center gap-1.5'>
              <span
                className='relative flex h-2 w-2'
                aria-hidden='true'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500' />
              </span>
              <Clock className='w-3.5 h-3.5 text-[var(--gold-text)]' />
              <strong
                dir='ltr'
                className='font-ibm text-[var(--text-main)] tracking-wider'>
                {clock.timeString}
              </strong>
            </span>

            <span
              className='text-[var(--border)] hidden sm:inline'
              aria-hidden='true'>
              •
            </span>

            {/* Hijri date badge */}
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='w-3.5 h-3.5 text-[var(--gold-text)]' />
              <span className='font-medium text-[var(--text-main)]'>
                {hijriLabel}
              </span>
            </span>

            <span
              className='text-[var(--border)] hidden sm:inline'
              aria-hidden='true'>
              •
            </span>

            {/* Dynamic Period Badge */}
            <span className='inline-flex items-center gap-1 text-[var(--gold-text)] font-semibold'>
              {clock.isMorning ? (
                <Sun className='w-3.5 h-3.5' />
              ) : (
                <CloudMoon className='w-3.5 h-3.5' />
              )}
              <span>{clock.period}</span>
            </span>

            {/* Dynamic Next Prayer Countdown Badge with breathing pulse */}
            {nextPrayer && (
              <>
                <span
                  className='text-[var(--border)] hidden md:inline'
                  aria-hidden='true'>
                  •
                </span>
                <motion.button
                  type='button'
                  onClick={() => onSelectTab('prayers')}
                  animate={{ opacity: [1, 0.78, 1] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/40 text-[var(--gold-text)] font-semibold hover:bg-[var(--gold)]/25 transition-colors cursor-pointer'>
                  <Compass className='w-3 h-3' />
                  <span>{nextPrayer.label}</span>
                  <span
                    dir='ltr'
                    className='font-ibm font-bold'>
                    {prayerSchedule.countdownFormatted}
                  </span>
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Bismillah Calligraphy Header */}
          <motion.div
            variants={itemVariants}
            className='w-full mb-5'>
            <KhatamDivider
              label='بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
              className='w-full'
            />
          </motion.div>

          {/* Monumental Two-Tone Gold & Emerald Hero Title */}
          <motion.h1
            variants={itemVariants}
            className='font-amiri text-3xl sm:text-5xl lg:text-[3.6rem] font-bold leading-[1.45] py-1 tracking-normal mb-5 text-[var(--text-arabic)]'>
            <span
              style={{ filter: 'var(--hero-title-filter)' }}
              className='bg-gradient-to-l from-[var(--gold-vivid)] via-[var(--gold-text)] to-[var(--gold-vivid)] bg-clip-text text-transparent'>
              أذكاري:
            </span>{' '}
            <span>ملاذك اليومي</span>{' '}
            <span className='text-[var(--primary)]'>للذِّكر والسكينة</span>
          </motion.h1>

          {/* Quranic Verse Callout Illuminated Plaque */}
          <motion.div
            variants={itemVariants}
            style={{ boxShadow: 'var(--glass-highlight)' }}
            className='relative max-w-2xl mx-auto mb-7 px-7 py-4.5 rounded-2xl bg-gradient-to-br from-[var(--gold)]/12 via-[var(--glass-elevated)] to-[var(--primary)]/8 backdrop-blur-md border border-[var(--border-accent)] shadow-md'>
            <span
              className='absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent'
              aria-hidden='true'
            />
            <span
              className='absolute top-2 right-3.5 font-amiri text-2xl text-[var(--gold-text)]/55 leading-none select-none'
              aria-hidden='true'>
              «
            </span>
            <p className='font-amiri text-xl sm:text-2xl lg:text-[1.7rem] text-[var(--gold-text)] font-bold leading-relaxed'>
              أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
            </p>
            <span
              className='block text-[11px] font-tajawal font-medium text-[var(--text-muted)] mt-1'
              aria-label='سورة الرعد آية 28'>
              سورة الرعد • الآية ٢٨
            </span>
            <span
              className='absolute bottom-1 left-3.5 font-amiri text-2xl text-[var(--gold-text)]/55 leading-none select-none'
              aria-hidden='true'>
              »
            </span>
          </motion.div>

          {/* Editorial Description */}
          <motion.p
            variants={itemVariants}
            className='text-sm sm:text-base lg:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed mb-8 font-tajawal'>
            روضة رقمية هادئة تجمع صحيح الأذكار من حصن المسلم، مسبحة تفاعلية
            متقنة، ومواقيت الصلاة والأذان الفوري بـ ٨ أصوات ندية، بتجربة عربية
            خالية تماماً من الإعلانات والمشتتات.
          </motion.p>

          {/* Primary Floating Glass Action CTAs */}
          <motion.div
            variants={itemVariants}
            className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto mb-10'>
            <motion.button
              type='button'
              onClick={() => onSelectTab(recommendedTab)}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={cardHoverSpring}
              className='group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-l from-[#d6b05f] via-[#e3c57b] to-[#c2963d] text-[#101b17] ring-1 ring-[#b88a32]/40 shadow-lg shadow-[var(--gold)]/20 hover:shadow-xl hover:shadow-[var(--gold)]/30 transition-shadow cursor-pointer'>
              <RecommendedIcon className='w-4 h-4' />
              <span>ابدأ {recommendedMeta.title}</span>
              <ArrowLeft className='w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1' />
            </motion.button>

            <motion.button
              type='button'
              onClick={() => onSelectTab('prayers')}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={cardHoverSpring}
              className='group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold bg-[var(--glass-elevated)] backdrop-blur-md hover:bg-[var(--primary)]/12 text-[var(--text-main)] hover:text-[var(--primary)] border border-[var(--border-accent)] hover:border-[var(--gold)] shadow-sm transition-all cursor-pointer'>
              <PrayersIcon className='w-4 h-4 text-[var(--gold-text)] transition-transform duration-300 group-hover:scale-110' />
              <span>مواقيت الصلاة</span>
            </motion.button>

            <motion.button
              type='button'
              onClick={scrollToPortals}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className='group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold bg-[var(--glass-card)] backdrop-blur-md text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] hover:border-[var(--gold)]/45 transition-all cursor-pointer shadow-xs'>
              <span>تصفح الأقسام</span>
              <ChevronDown className='w-4 h-4 text-[var(--gold-text)] transition-transform duration-300 group-hover:translate-y-0.5' />
            </motion.button>
          </motion.div>

          {/* Quick Location & Next Prayer Telemetry Strip */}
          <motion.div
            variants={itemVariants}
            className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl text-right'>
            {/* Next Prayer Card */}
            <motion.button
              type='button'
              onClick={() => onSelectTab('prayers')}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={cardHoverSpring}
              style={{ boxShadow: 'var(--glass-highlight)' }}
              className='group flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--glass-elevated)] backdrop-blur-md hover:bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--gold)]/55 transition-all cursor-pointer text-right shadow-sm'>
              <div className='min-w-0'>
                <span className='text-[11px] font-semibold text-[var(--gold-text)] flex items-center gap-1.5 mb-0.5'>
                  <MapPin className='w-3 h-3 shrink-0' />
                  <span className='truncate'>
                    الصلاة القادمة{cityName ? ` • ${cityName}` : ''}
                  </span>
                </span>
                <div className='flex items-baseline gap-2'>
                  <strong className='text-base sm:text-lg font-bold font-amiri text-[var(--text-arabic)]'>
                    {nextPrayer ? `صلاة ${nextPrayer.label}` : 'مواقيت الصلاة'}
                  </strong>
                  {nextPrayer && (
                    <span className='text-xs font-ibm text-[var(--text-muted)]'>
                      {nextPrayer.time12}
                    </span>
                  )}
                </div>
              </div>
              <motion.span
                dir='ltr'
                animate={{ opacity: [1, 0.72, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className='shrink-0 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--gold)]/40 font-ibm text-xs sm:text-sm font-bold text-[var(--gold-text)] group-hover:border-[var(--gold)] transition-colors shadow-2xs'>
                {prayerSchedule?.countdownFormatted || '--:--:--'}
              </motion.span>
            </motion.button>

            {/* Saved Favorites & Total Tasbih Summary Card */}
            <motion.button
              type='button'
              onClick={() => onSelectTab('tasbih')}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={cardHoverSpring}
              style={{ boxShadow: 'var(--glass-highlight)' }}
              className='group flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--glass-elevated)] backdrop-blur-md hover:bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--gold)]/55 transition-all cursor-pointer text-right shadow-sm'>
              <div className='min-w-0'>
                <span className='text-[11px] font-semibold text-[var(--primary)] flex items-center gap-1.5 mb-0.5'>
                  <Sparkles className='w-3 h-3 text-[var(--gold-text)] shrink-0' />
                  <span>سجل الذكر والمفضلة</span>
                </span>
                <div className='flex items-center gap-3 flex-wrap'>
                  <strong className='text-base sm:text-lg font-bold font-amiri text-[var(--text-arabic)]'>
                    {tasbihCount > 0
                      ? `${tasbihCount} تسبيحة حالية`
                      : 'المسبحة الرقمية'}
                  </strong>
                </div>
              </div>
              <span
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-ibm text-xs font-bold transition-colors shadow-2xs',
                  favoritesCount > 0
                    ? 'bg-[var(--gold)]/15 border-[var(--gold)]/40 text-[var(--gold-text)]'
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] group-hover:text-[var(--gold-text)]'
                )}>
                <Heart className='w-3.5 h-3.5 text-[var(--gold-text)]' />
                <span>{favoritesCount} مفضلة</span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
