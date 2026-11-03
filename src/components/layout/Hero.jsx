import React from 'react';
import { useClock } from '../../hooks';

export default function Hero({ activeTab }) {
  const clock = useClock();

  const timeRibbon = (
    <div
      className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-4 px-4 py-2.5 rounded-full bg-bg-card/85 border border-border-theme backdrop-blur-md text-xs md:text-sm text-text-muted shadow-sm"
      aria-live="polite"
      aria-label="الوقت الحالي"
    >
      <div className="w-2 h-2 rounded-full bg-teal-brand animate-pulse" aria-hidden="true"></div>
      <span className="flex items-center gap-1.5">
        <i className="fas fa-clock text-gold-bright"></i> التوقيت:
        <strong className="text-text-main font-semibold">{clock.timeString}</strong>
      </span>
      <span className="text-border-theme hidden sm:inline">|</span>
      <span className="flex items-center gap-1.5">
        <i className="fas fa-calendar-alt text-gold-bright"></i> الفترة:
        <strong className="text-text-main font-semibold">{clock.period}</strong>
      </span>
      <span className="text-border-theme hidden sm:inline">|</span>
      <span className="flex items-center gap-1.5">
        <i className="fas fa-calendar-day text-gold-bright"></i> التاريخ:
        <strong className="text-text-main font-semibold">{clock.dateStr}</strong>
      </span>
    </div>
  );

  if (activeTab === 'tasbih') {
    return (
      <section className="relative text-center py-8 md:py-14 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs md:text-sm font-medium bg-gold-bright/10 border border-gold-bright/30 text-gold-bright mb-3 shadow-sm">
          سبحان الله وبحمده
        </div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-amiri text-text-main mb-2 leading-relaxed">
          التسبيح الرقمي
        </h1>
        <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto mb-6 leading-relaxed">
          اذكر الله ذكراً كثيراً — اضغط الزر أو مفتاح المسافة
        </p>
        {timeRibbon}
      </section>
    );
  }

  return (
    <section className="relative text-center py-8 md:py-14 px-4 max-w-4xl mx-auto flex flex-col items-center" aria-label="مقدمة">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs md:text-sm font-medium bg-gold-bright/10 border border-gold-bright/30 text-gold-bright mb-3 shadow-sm">
        بسم الله الرحمن الرحيم
      </div>
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-amiri text-text-main mb-2 leading-relaxed">
        روضة الأذكار والأدعية
      </h1>
      <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto mb-6 leading-relaxed">
        حصن المسلم من أذكار الكتاب والسنة النبوية الشريفة — أذكار يومية لتقوية الإيمان وتحصين النفس
      </p>
      {timeRibbon}
    </section>
  );
}
