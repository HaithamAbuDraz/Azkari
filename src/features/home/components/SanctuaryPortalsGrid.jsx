import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Compass,
  Keyboard,
  MapPin,
  Target,
  Volume2,
} from 'lucide-react';
import { getDefaultTab, PANELS } from '../../../constants/tabs';
import { getAzkarByCategory } from '../../../utils/azkar';
import { cn } from '../../../utils/cn';
import {
  containerVariants,
  itemVariants,
  cardHoverSpring,
  PORTAL_ICONS,
  PORTAL_META,
} from '../constants/homeData';
import { KhatamDivider } from './IslamicOrnament';

/**
 * Category Navigation Hub ("بوابات الروضة") displaying all 5 Azkar categories,
 * Digital Tasbih, and Prayer Times & Qibla in a staggered glassmorphic bento grid.
 */
export default function SanctuaryPortalsGrid({
  counters,
  prayerSchedule,
  onSelectTab,
}) {
  const recommendedId = getDefaultTab();
  const TasbihIcon = PORTAL_ICONS.tasbih;
  const PrayersIcon = PORTAL_ICONS.prayers;

  const categoryPortals = useMemo(() => {
    return PORTAL_META.map((portal) => {
      const meta = PANELS[portal.id];
      const items = getAzkarByCategory(portal.id);
      const completed = items.filter(
        (item) => counters[item.cardId] === 0
      ).length;
      const total = items.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...portal,
        title: meta.title,
        Icon: PORTAL_ICONS[portal.id],
        total,
        completed,
        percent,
        isRecommended: portal.id === recommendedId,
      };
    });
  }, [counters, recommendedId]);

  return (
    <section
      id='sanctuary-portals'
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-24'
      aria-label='بوابات وأقسام أذكاري'>
      <motion.div
        className='text-center mb-8 sm:mb-10'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}>
        <KhatamDivider
          label='بواباتُ الروضة'
          className='mb-3'
        />
        <h2 className='font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-arabic)] mb-2'>
          جميعُ أقسام الذِّكرِ والعبادة في مكانٍ واحد
        </h2>
        <p className='text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mx-auto'>
          اختر القسم الذي يناسب وقتك وحاجتك، ويُحفَظ تقدمك تلقائياً على جهازك
        </p>
      </motion.div>

      <motion.div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.08 }}>
        {/* 5 Azkar Categories */}
        {categoryPortals.map((portal) => {
          const Icon = portal.Icon;
          return (
            <motion.a
              key={portal.id}
              href={portal.path}
              onClick={(e) => {
                e.preventDefault();
                onSelectTab(portal.id);
              }}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={cardHoverSpring}
              style={{ boxShadow: 'var(--glass-highlight)' }}
              className={cn(
                'group relative overflow-hidden rounded-3xl bg-[var(--glass-card)] backdrop-blur-md border p-6 flex flex-col justify-between gap-5 shadow-lg transition-all duration-300 cursor-pointer',
                portal.highlightSpan,
                portal.isRecommended
                  ? 'border-[var(--gold)]/60 ring-1 ring-[var(--gold)]/25'
                  : 'border-[var(--border)] group-hover:border-[var(--gold)] hover:border-[var(--gold)]'
              )}>
              {/* Top Shimmer Border */}
              <span
                className='absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/65 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300'
                aria-hidden='true'
              />
              {/* Hover Backlight Aura */}
              <span
                className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl'
                style={{
                  background:
                    'radial-gradient(ellipse at 80% 10%, var(--gold-glow) 0%, transparent 65%)',
                }}
                aria-hidden='true'
              />

              <div className='relative z-10 flex items-start justify-between gap-3'>
                <div className='flex items-center gap-3.5'>
                  {/* Gradient Icon Badge with Glowing Backlight */}
                  <div className='relative shrink-0'>
                    <span
                      className='absolute inset-0 rounded-2xl bg-[var(--gold)]/30 blur-md opacity-0 group-hover:opacity-80 transition-opacity duration-300'
                      aria-hidden='true'
                    />
                    <div
                      className={cn(
                        'relative w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110',
                        portal.isRecommended
                          ? 'bg-gradient-to-br from-[var(--gold)]/25 to-[var(--gold)]/5 border-[var(--gold)]/45 text-[var(--gold-text)]'
                          : 'bg-gradient-to-br from-[var(--primary)]/20 to-[var(--gold)]/10 border-[var(--primary)]/30 text-[var(--primary)] group-hover:text-[var(--gold-text)] group-hover:border-[var(--gold)]/50'
                      )}>
                      <Icon className='w-5 h-5' />
                    </div>
                  </div>

                  <div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <h3 className='font-amiri text-xl sm:text-2xl font-bold text-[var(--text-arabic)] group-hover:text-[var(--gold-text)] transition-colors'>
                        {portal.title}
                      </h3>
                      {portal.isRecommended && (
                        <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--gold)]/15 border border-[var(--gold)]/40 text-[var(--gold-text)]'>
                          <motion.span
                            className='w-1.5 h-1.5 rounded-full bg-[var(--gold)]'
                            animate={{ opacity: [1, 0.35, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span>الموصى به</span>
                        </span>
                      )}
                    </div>
                    <p className='text-xs sm:text-sm text-[var(--text-muted)] mt-0.5'>
                      {portal.subtitle}
                    </p>
                  </div>
                </div>

                <span className='w-9 h-9 rounded-xl bg-[var(--bg-elevated)]/85 border border-[var(--border)] group-hover:border-[var(--gold)]/45 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--gold-text)] transition-colors shrink-0'>
                  <ArrowLeft className='w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5' />
                </span>
              </div>

              {/* Micro-badge & Progress */}
              <div className='relative z-10 pt-3 border-t border-[var(--border)] flex flex-col gap-2'>
                <div className='flex items-center justify-between text-xs text-[var(--text-muted)]'>
                  <span className='px-2.5 py-0.5 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)] font-ibm text-[11px]'>
                    <strong className='text-[var(--text-main)] font-bold'>
                      {portal.total}
                    </strong>{' '}
                    ذكراً موثقاً
                  </span>
                  <span className='font-ibm text-[11px]'>
                    {portal.completed > 0 ? (
                      <span className='text-[var(--gold-text)] font-semibold'>
                        مكتمل {portal.completed} / {portal.total} (
                        {portal.percent}%)
                      </span>
                    ) : (
                      <span>جاهز للقراءة</span>
                    )}
                  </span>
                </div>
                <div className='w-full h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden'>
                  <motion.div
                    className='h-full rounded-full bg-gradient-to-l from-[var(--gold)] to-[var(--primary)]'
                    initial={{ width: 0 }}
                    whileInView={{ width: `${portal.percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
                  />
                </div>
              </div>
            </motion.a>
          );
        })}

        {/* 6. Digital Tasbih Portal */}
        <motion.a
          href='/tasbih'
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('tasbih');
          }}
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={cardHoverSpring}
          style={{ boxShadow: 'var(--glass-highlight)' }}
          className='group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--glass-card)] via-[var(--glass-elevated)] to-[var(--glass-card)] backdrop-blur-md border border-[var(--border)] hover:border-[var(--gold)] p-6 flex flex-col justify-between gap-5 shadow-lg transition-all duration-300 cursor-pointer lg:col-span-6'>
          <span
            className='absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/65 to-transparent opacity-60 group-hover:opacity-100 transition-opacity'
            aria-hidden='true'
          />
          <span
            className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl'
            style={{
              background:
                'radial-gradient(ellipse at 80% 10%, var(--gold-glow) 0%, transparent 65%)',
            }}
            aria-hidden='true'
          />

          <div className='relative z-10 flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3.5'>
              <div className='relative shrink-0'>
                <span
                  className='absolute inset-0 rounded-2xl bg-[var(--gold)]/30 blur-md opacity-0 group-hover:opacity-80 transition-opacity duration-300'
                  aria-hidden='true'
                />
                <div className='relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--gold)]/25 to-[var(--gold)]/5 border border-[var(--gold)]/45 text-[var(--gold-text)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <TasbihIcon className='w-5 h-5' />
                </div>
              </div>
              <div>
                <h3 className='font-amiri text-xl sm:text-2xl font-bold text-[var(--text-arabic)] group-hover:text-[var(--gold-text)] transition-colors'>
                  المسبحة الرقمية
                </h3>
                <p className='text-xs sm:text-sm text-[var(--text-muted)] mt-0.5'>
                  حلقة تقدم دائرية مع أذكار مخصصة وسجل للجلسات وإشعارات المراحل
                </p>
              </div>
            </div>
            <span className='w-9 h-9 rounded-xl bg-[var(--bg-elevated)]/85 border border-[var(--border)] group-hover:border-[var(--gold)]/45 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--gold-text)] transition-colors shrink-0'>
              <ArrowLeft className='w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5' />
            </span>
          </div>

          <div className='relative z-10 flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)]'>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)]'>
              <Volume2 className='w-3.5 h-3.5 text-[var(--gold-text)]' />
              نقر خشبي هادئ
            </span>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)]'>
              <Target className='w-3.5 h-3.5 text-[var(--gold-text)]' />
              أهداف مخصصة
            </span>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)]'>
              <Keyboard className='w-3.5 h-3.5 text-[var(--gold-text)]' />
              اختصارات لوحة المفاتيح
            </span>
          </div>
        </motion.a>

        {/* 7. Prayer Times & Qibla Portal */}
        <motion.a
          href='/prayers'
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('prayers');
          }}
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={cardHoverSpring}
          style={{ boxShadow: 'var(--glass-highlight)' }}
          className='group relative overflow-hidden rounded-3xl bg-gradient-to-bl from-[var(--glass-card)] via-[var(--glass-elevated)] to-[var(--glass-card)] backdrop-blur-md border border-[var(--border)] hover:border-[var(--gold)] p-6 flex flex-col justify-between gap-5 shadow-lg transition-all duration-300 cursor-pointer lg:col-span-6'>
          <span
            className='absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/65 to-transparent opacity-60 group-hover:opacity-100 transition-opacity'
            aria-hidden='true'
          />
          <span
            className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl'
            style={{
              background:
                'radial-gradient(ellipse at 20% 10%, var(--ambient-top) 0%, transparent 65%)',
            }}
            aria-hidden='true'
          />

          <div className='relative z-10 flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3.5'>
              <div className='relative shrink-0'>
                <span
                  className='absolute inset-0 rounded-2xl bg-[var(--gold)]/30 blur-md opacity-0 group-hover:opacity-80 transition-opacity duration-300'
                  aria-hidden='true'
                />
                <div className='relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--gold)]/10 border border-[var(--primary)]/35 text-[var(--primary)] group-hover:text-[var(--gold-text)] group-hover:border-[var(--gold)]/50 flex items-center justify-center group-hover:scale-110 transition-all duration-300'>
                  <PrayersIcon className='w-5 h-5' />
                </div>
              </div>
              <div>
                <div className='flex items-center gap-2 flex-wrap'>
                  <h3 className='font-amiri text-xl sm:text-2xl font-bold text-[var(--text-arabic)] group-hover:text-[var(--gold-text)] transition-colors'>
                    مواقيت الصلاة والقبلة
                  </h3>
                  {prayerSchedule?.nextPrayer && (
                    <span className='px-2.5 py-0.5 rounded-full text-[11px] font-ibm font-bold bg-[var(--gold)]/15 border border-[var(--gold)]/40 text-[var(--gold-text)]'>
                      {prayerSchedule.nextPrayer.label} •{' '}
                      {prayerSchedule.countdownFormatted}
                    </span>
                  )}
                </div>
                <p className='text-xs sm:text-sm text-[var(--text-muted)] mt-0.5'>
                  العد التنازلي للصلوات الخمس، بوصلة القبلة الحية، وأذان فوري بـ
                  ٨ مؤذنين
                </p>
              </div>
            </div>
            <span className='w-9 h-9 rounded-xl bg-[var(--bg-elevated)]/85 border border-[var(--border)] group-hover:border-[var(--gold)]/45 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--gold-text)] transition-colors shrink-0'>
              <ArrowLeft className='w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5' />
            </span>
          </div>

          <div className='relative z-10 flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)]'>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)]'>
              <Compass className='w-3.5 h-3.5 text-[var(--gold-text)]' />
              بوصلة القبلة
            </span>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)]'>
              <Volume2 className='w-3.5 h-3.5 text-[var(--gold-text)]' />٨ أصوات
              أذان
            </span>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)]/80 border border-[var(--border)]'>
              <MapPin className='w-3.5 h-3.5 text-[var(--gold-text)]' />
              دعم GPS والمدن
            </span>
          </div>
        </motion.a>
      </motion.div>
    </section>
  );
}
