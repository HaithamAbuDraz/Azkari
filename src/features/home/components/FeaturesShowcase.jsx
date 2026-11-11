import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, Fingerprint, ShieldCheck } from 'lucide-react';
import {
  containerVariants,
  itemVariants,
  cardHoverSpring,
} from '../constants/homeData';
import { KhatamDivider } from './IslamicOrnament';

const PILLARS = [
  {
    Icon: BookOpen,
    badge: 'حصن المسلم',
    title: 'توثيقٌ أصيل من الكتاب والسنة',
    desc: 'جميع الأذكار والأدعية مراجعة ومشكّلة بعناية، ومقرونة بمصادرها من الصحيحين والسنن وفضائل كل ذكر.',
  },
  {
    Icon: Compass,
    badge: 'مواقيت دقيقة',
    title: 'مواقيت دقيقة وأذانٌ فوري',
    desc: 'أوقات الصلوات الخمس حسب موقعك الجغرافي مع بوصلة القبلة الحية و٨ مؤذنين بأداء صوتي فوري.',
  },
  {
    Icon: Fingerprint,
    badge: 'مسبحة تفاعلية',
    title: 'مسبحة تفاعلية بروح إسلامية',
    desc: 'عدّاد تسبيح رقمي مع نقر خشبي لطيف واهتزاز تفاعلي وحفظ تلقائي لسجل الجلسات والأذكار المفضلة.',
  },
  {
    Icon: ShieldCheck,
    badge: 'خالي من الإعلانات',
    title: 'بيئة نقية بلا إعلانات أو تتبع',
    desc: 'تحفظ بياناتك وأذكارك محلياً على جهازك لخصوصية تامة، وتعمل بسلاسة في الوضعين الليلي والنهاري.',
  },
];

/**
 * Feature Highlights ("عناية بالتفاصيل") rendered as sleek horizontal-flow
 * glassmorphic cards with Lucide icons.
 */
export default function FeaturesShowcase() {
  return (
    <section
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'
      aria-label='مميزات أذكاري'>
      <motion.div
        className='text-center mb-8 sm:mb-10'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}>
        <KhatamDivider
          label='عنايةٌ بالتفاصيل'
          className='mb-3'
        />
        <h2 className='font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-arabic)] mb-2'>
          صُمِّمَ ليعينكَ على الخشوعِ والاستمرار
        </h2>
        <p className='text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto'>
          كل تفصيل في الواجهة مدروس ليكون مريحاً للعين وهادئاً للقلب في كل وقت
        </p>
      </motion.div>

      <motion.div
        className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.12 }}>
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.Icon;
          return (
            <motion.div
              key={pillar.badge}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.015 }}
              transition={cardHoverSpring}
              style={{ boxShadow: 'var(--glass-highlight)' }}
              className='group relative overflow-hidden rounded-3xl bg-[var(--glass-card)] backdrop-blur-md border border-[var(--border)] hover:border-[var(--gold)]/55 p-5 sm:p-6 shadow-lg transition-colors duration-300 flex items-start gap-4 sm:gap-5'>
              {/* Subtle Top Shimmer Line */}
              <span
                className='absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                aria-hidden='true'
              />

              {/* Horizontal Leading Icon Badge with Glow */}
              <div className='relative shrink-0 mt-0.5'>
                <span
                  className='absolute inset-0 rounded-2xl bg-[var(--gold)]/25 blur-md opacity-0 group-hover:opacity-90 transition-opacity duration-300'
                  aria-hidden='true'
                />
                <div className='relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--primary)]/10 border border-[var(--border-accent)] flex items-center justify-center text-[var(--gold-text)] group-hover:scale-110 transition-transform duration-300'>
                  <Icon className='w-5 h-5' />
                </div>
              </div>

              {/* Horizontal Content Flow */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between gap-2 mb-1.5'>
                  <span className='text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--glass-elevated)] border border-[var(--border)] text-[var(--gold-text)]'>
                    {pillar.badge}
                  </span>
                  <span className='font-ibm text-[11px] text-[var(--gold-text)]/80 font-semibold'>
                    0{idx + 1}
                  </span>
                </div>

                <h3 className='font-amiri text-xl font-bold text-[var(--text-arabic)] mb-1.5 leading-snug group-hover:text-[var(--gold-text)] transition-colors'>
                  {pillar.title}
                </h3>
                <p className='text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed'>
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
