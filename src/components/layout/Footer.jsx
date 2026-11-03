import React from 'react';

export default function Footer({ onShowToast }) {
  return (
    <footer className="mt-20 border-t border-border-theme bg-bg-card/70 backdrop-blur-md pt-12 pb-8 px-4 md:px-8 transition-colors duration-300" role="contentinfo">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-border-theme/40">
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-gold-bright/10 border border-gold-bright/30 flex items-center justify-center text-gold-bright shadow-sm">
                <i className="fas fa-star-and-crescent text-base"></i>
              </span>
              <h3 className="text-xl font-bold text-gold-bright tracking-tight">أذكاري</h3>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-xl">
              موقع إلكتروني يضم أذكار الصباح والمساء وما بعد الصلاة وأذكار النوم والأذكار المتنوعة
              من الكتاب والسنة النبوية والمسبحة، بهدف تحصين المسلم وتقوية إيمانه.
            </p>
            <div className="mt-2 p-4 rounded-xl bg-bg-deep/70 border border-border-theme/50 text-xs md:text-sm text-text-muted italic leading-relaxed">
              <p>
                <i className="fas fa-quote-right text-gold-bright/70 ml-2"></i>
                مَثَلُ الذي يَذكُرُ رَبَّه والذي لا يَذكُرُ رَبَّه مَثَلُ الحَيِّ والمَيِّتِ.
                <i className="fas fa-quote-left text-gold-bright/70 mr-2"></i>
              </p>
              <small className="block mt-1 font-semibold text-text-main not-italic">
                <i className="fas fa-book ml-1 text-gold-bright"></i> — البخاري
              </small>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-base font-bold text-text-main flex items-center gap-2">
              <i className="fas fa-envelope text-gold-bright"></i> تواصل
            </h4>
            <div className="flex items-center gap-2.5">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-bg-deep border border-border-theme/60 flex items-center justify-center text-text-muted hover:text-gold-bright hover:border-gold-bright/40 transition hover:scale-105"
                aria-label="فيسبوك"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-facebook-f text-sm"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-bg-deep border border-border-theme/60 flex items-center justify-center text-text-muted hover:text-gold-bright hover:border-gold-bright/40 transition hover:scale-105"
                aria-label="إنستغرام"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-instagram text-sm"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-bg-deep border border-border-theme/60 flex items-center justify-center text-text-muted hover:text-gold-bright hover:border-gold-bright/40 transition hover:scale-105"
                aria-label="واتساب"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-whatsapp text-sm"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-bg-deep border border-border-theme/60 flex items-center justify-center text-text-muted hover:text-gold-bright hover:border-gold-bright/40 transition hover:scale-105"
                aria-label="تيليجرام"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-telegram text-sm"></i>
              </a>
            </div>
            <div>
              <button
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-bright/15 text-gold-bright border border-gold-bright/30 font-semibold text-sm hover:bg-gold-bright/25 transition active:scale-95 cursor-pointer shadow-sm"
                onClick={() =>
                  onShowToast("جزاك الله خيراً <i class='fas fa-hands-praying'></i>")
                }
              >
                <i className="fas fa-hands-praying"></i> ادعو لي
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p className="flex items-center gap-1.5">
            <i className="far fa-copyright"></i> 2026 أذكاري — روضة الأذكار والأدعية
          </p>
          <div className="flex items-center gap-1.5 text-center sm:text-right">
            <i className="fas fa-quran text-gold-bright"></i> جميع الأذكار مأخوذة من حصن المسلم — المصدر: الكتاب والسنة النبوية
          </div>
        </div>
      </div>
    </footer>
  );
}
