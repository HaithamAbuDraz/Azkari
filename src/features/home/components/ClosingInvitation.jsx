import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { getDefaultTab, PANELS } from '../../../constants/tabs';
import { PORTAL_ICONS, cardHoverSpring } from '../constants/homeData';
import { shareWithFallback } from '../utils/celebrate';
import { GirihMandala, ManuscriptCorners } from './IslamicOrnament';

/**
 * Closing Hadith Banner in gold-framed bordered glass with quick start & share CTAs.
 */
export default function ClosingInvitation({ onSelectTab, onShowToast }) {
  const recommendedTab = getDefaultTab();
  const recommendedMeta = PANELS[recommendedTab] || PANELS.morning;
  const RecommendedIcon = PORTAL_ICONS[recommendedTab] || PORTAL_ICONS.morning;

  const handleShare = () => {
    shareWithFallback(
      {
        title: 'أذكاري • روضة الأذكار والأدعية',
        text: 'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ، مَثَلُ الحَيِّ وَالمَيِّتِ. شارك الخير في تطبيق أذكاري:',
        url: typeof window !== 'undefined' ? window.location.origin : '',
      },
      onShowToast,
      'تم نسخ رابط أذكاري، الدالّ على الخير كفاعله! <i class="fas fa-share-nodes text-gold"></i>'
    );
  };

  return (
    <section
      className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 sm:pt-8'
      aria-label='ختام ودعوة للذكر'>
      <motion.div
        style={{ boxShadow: 'var(--glass-highlight)' }}
        className='relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[var(--primary)]/12 via-[var(--glass-card)] to-[var(--gold)]/12 backdrop-blur-md border border-[var(--border-accent)] p-7 sm:p-12 text-center shadow-lg'
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}>
        <ManuscriptCorners />

        {/* Counter-rotating mandala watermark */}
        <div
          className='absolute -bottom-24 -left-24 w-72 h-72 text-[var(--gold)]/15 pointer-events-none select-none'
          aria-hidden='true'>
          <GirihMandala className='w-full h-full mandala-spin-reverse' />
        </div>

        {/* Top ambient gold glow */}
        <div
          className='absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full bg-[var(--gold)]/10 blur-2xl pointer-events-none'
          aria-hidden='true'
        />

        <div className='relative z-10 max-w-3xl mx-auto flex flex-col items-center'>
          <motion.span
            className='inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--gold)]/15 border border-[var(--gold)]/40 text-[var(--gold-text)] mb-4'
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}>
            <Sparkles className='w-3.5 h-3.5' />
            <span>فضلُ مجالسِ الذِّكر</span>
          </motion.span>

          <motion.blockquote
            className='font-amiri text-xl sm:text-2xl lg:text-3xl text-[var(--text-arabic)] leading-loose mb-3'
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}>
            «لَا يَقْعُدُ قَوْمٌ يَذْكُرُونَ اللَّهَ عَزَّ وَجَلَّ إِلَّا
            حَفَّتْهُمُ الْمَلَائِكَةُ، وَغَشِيَتْهُمُ الرَّحْمَةُ، وَنَزَلَتْ
            عَلَيْهِمُ السَّكِينَةُ، وَذَكَرَهُمُ اللَّهُ فِيمَنْ عِنْدَهُ»
          </motion.blockquote>

          <motion.cite
            className='not-italic text-xs sm:text-sm font-semibold text-[var(--gold-text)] mb-7'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}>
            رواه مسلم في صحيحه (2700)
          </motion.cite>

          <motion.div
            className='flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.45 }}>
            <motion.button
              type='button'
              onClick={() => onSelectTab(recommendedTab)}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={cardHoverSpring}
              className='group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-l from-[#d6b05f] via-[#e3c57b] to-[#c2963d] text-[#101b17] ring-1 ring-[#b88a32]/40 shadow-lg shadow-[var(--gold)]/20 hover:shadow-xl transition-shadow cursor-pointer'>
              <RecommendedIcon className='w-4 h-4' />
              <span>ابدأ {recommendedMeta.title}</span>
              <ArrowLeft className='w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1' />
            </motion.button>

            <motion.button
              type='button'
              onClick={handleShare}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={cardHoverSpring}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[var(--glass-elevated)] backdrop-blur-md hover:bg-[var(--bg-elevated)] text-[var(--text-main)] hover:text-[var(--gold-text)] border border-[var(--border-accent)] hover:border-[var(--gold)] shadow-sm transition-all cursor-pointer'>
              <Share2 className='w-4 h-4 text-[var(--gold-text)]' />
              <span>انشر الخير صدقةً جارية</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
