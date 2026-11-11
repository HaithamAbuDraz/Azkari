import React from 'react';
import { NAV_ITEMS } from '../../constants/tabs';

export default function Footer({ onShowToast, onSelectTab }) {
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        window.location.origin || window.location.href
      );
      if (onShowToast) {
        onShowToast(
          'تم نسخ رابط الموقع، جزاك الله خيراً لنشر الخير! <i class="fas fa-share-nodes text-gold"></i>'
        );
      }
    }
  };

  const handleDua = () => {
    if (onShowToast) {
      onShowToast(
        'تقبل الله منا ومنكم صالح الأعمال، جزاك الله خيراً <i class="fas fa-hands-praying text-gold"></i>'
      );
    }
  };

  return (
    <footer
      className='mt-12 sm:mt-20 border-t border-border-theme bg-bg-card/75 backdrop-blur-md pt-8 sm:pt-10 pb-3.5 sm:pb-4 px-4 sm:px-6 lg:px-8 transition-colors duration-300'
      role='contentinfo'>
      <div className='max-w-7xl mx-auto flex flex-col gap-8'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-border-theme/50'>
          {/* Brand & Spiritual Hadith */}
          <div className='md:col-span-6 flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-xs'>
                <svg
                  className='w-5 h-5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.8'>
                  <path d='M12 2l2.4 4.8 5.3-2.1-2.1 5.3 4.8 2.4-4.8 2.4 2.1 5.3-5.3-2.1-2.4 4.8-2.4-4.8-5.3 2.1 2.1-5.3-4.8-2.4 4.8-2.4-2.1-5.3 5.3 2.1z' />
                  <circle
                    cx='12'
                    cy='12'
                    r='2.5'
                    fill='currentColor'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-xl font-bold font-tajawal text-text-main tracking-tight'>
                  أذكاري
                </h3>
                <span className='text-xs text-text-muted'>
                  روضة الأذكار والأدعية
                </span>
              </div>
            </div>

            <p className='text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl'>
              تطبيق إسلامي يهدف إلى تيسير قراءة الأذكار اليومية والأدعية
              المأثورة عن النبي ﷺ، وتوفير بيئة هادئة ومريحة تعين المسلم على ذكر
              الله في كل أوقاته.
            </p>

            {/* Hadith Citation Card */}
            <div className='p-4 rounded-xl bg-bg-elevated/70 border border-border-theme/70 text-xs sm:text-sm text-text-muted leading-relaxed'>
              <p className='font-amiri text-base sm:text-lg text-text-arabic mb-1'>
                <i className='fas fa-quote-right text-gold/60 ml-2 text-xs'></i>
                مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ،
                مَثَلُ الحَيِّ وَالمَيِّتِ.
                <i className='fas fa-quote-left text-gold/60 mr-2 text-xs'></i>
              </p>
              <div className='flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-theme/40'>
                <span className='font-medium text-text-main'>
                  <i className='fas fa-book-open ml-1 text-gold'></i> صحيح
                  البخاري (6407)
                </span>
                <span className='text-[11px] text-gold font-normal'>
                  حديث شريف
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className='md:col-span-3 flex flex-col gap-3'>
            <h4 className='text-xs font-bold text-text-main uppercase tracking-wider mb-1'>
              أقسام الموقع
            </h4>
            <div className='flex flex-col gap-2'>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`/${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectTab) onSelectTab(item.id);
                  }}
                  className='flex items-center gap-2 text-xs sm:text-sm text-text-muted hover:text-gold text-right transition cursor-pointer'>
                  <i
                    className={`${item.icon} text-xs w-4 text-center text-gold/70`}></i>
                  <span>{item.fullLabel || item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Share & Developer Accounts */}
          <div className='md:col-span-3 flex flex-col gap-3'>
            <h4 className='text-xs font-bold text-text-main uppercase tracking-wider mb-1'>
              نشر الخير والتواصل
            </h4>
            <div className='flex flex-col gap-2'>
              <button
                type='button'
                onClick={handleShare}
                className='flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-gold/15 text-text-main hover:text-gold border border-border-theme text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95'>
                <i className='fas fa-share-nodes text-xs'></i>
                <span>مشاركة الموقع</span>
              </button>
              <button
                type='button'
                onClick={handleDua}
                className='flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95'>
                <i className='fas fa-hands-praying text-xs'></i>
                <span>ادعُ لنا بظهر الغيب</span>
              </button>
            </div>

            {/* Developer Social Links */}
            <div className='flex flex-col gap-2 pt-2 border-t border-border-theme/50'>
              <span className='text-[11px] font-semibold text-text-muted'>
                تواصل مع المطور:
              </span>
              <div className='flex items-center gap-2'>
                <a
                  href='https://github.com/HaithamAbuDraz'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='حساب GitHub للمطور هيثم أبو دراز'
                  className='flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-gold/15 text-text-main hover:text-gold border border-border-theme text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95 group'>
                  <i className='fab fa-github text-sm group-hover:scale-110 transition-transform'></i>
                  <span>GitHub</span>
                </a>
                <a
                  href='https://www.linkedin.com/in/haithamabudraz'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='حساب LinkedIn للمطور هيثم أبو دراز'
                  className='flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-[#0A66C2]/15 text-text-main hover:text-[#0A66C2] border border-border-theme text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95 group'>
                  <i className='fab fa-linkedin text-sm group-hover:scale-110 transition-transform'></i>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className='flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted sm:pl-16'>
          <p className='flex items-center gap-1.5 flex-wrap'>
            <i className='far fa-copyright text-xs'></i>
            <span>
              {new Date().getFullYear()} أذكاري — تطوير{' '}
              <a
                href={`https://wa.me/970592580144?text=${encodeURIComponent(
                  'مرحباً هيثم أبو دراز، أريد التواصل معك'
                )}`}
                target='_blank'
                rel='noopener noreferrer'
                className='font-semibold text-text-main hover:text-gold transition-colors inline-flex items-center gap-1 underline underline-offset-4 decoration-border-theme hover:decoration-gold'>
                هيثم أبو دراز
              </a>
            </span>
          </p>
          <div className='flex items-center gap-2 text-center sm:text-right'>
            <i className='fas fa-quran text-gold'></i>
            <span>
              جميع الأذكار مأخوذة من حصن المسلم — من الكتاب والسنة النبوية
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
