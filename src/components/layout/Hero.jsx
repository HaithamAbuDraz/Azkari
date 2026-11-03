import React from 'react';
import { useClock } from '../../hooks';

export default function Hero({ activeTab }) {
  const clock = useClock();

  const timeRibbon = (
    <div className="time-ribbon" aria-live="polite" aria-label="الوقت الحالي">
      <div className="dot" aria-hidden="true"></div>
      <span>
        <i className="fas fa-clock"></i> التوقيت: <strong>{clock.timeString}</strong>
      </span>
      <span>|</span>
      <span>
        <i className="fas fa-calendar-alt"></i> الفترة: <strong>{clock.period}</strong>
      </span>
      <span>|</span>
      <span>
        <i className="fas fa-calendar-day"></i> التاريخ: <strong>{clock.dateStr}</strong>
      </span>
    </div>
  );

  if (activeTab === 'tasbih') {
    return (
      <section id="tasbihHeroSection" className="hero" style={{ display: 'block' }}>
        <div className="page-wrapper">
          <div className="page-title-section">
            <div className="hero-badge">سبحان الله وبحمده</div>
            <h1>التسبيح الرقمي</h1>
            <p className="hero-sub">اذكر الله ذكراً كثيراً — اضغط الزر أو مفتاح المسافة</p>
            {timeRibbon}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="defaultHeroSection" className="hero" aria-label="مقدمة" style={{ display: 'block' }}>
      <div className="hero-badge">بسم الله الرحمن الرحيم</div>
      <h1>روضة الأذكار والأدعية</h1>
      <p className="hero-sub">
        حصن المسلم من أذكار الكتاب والسنة النبوية الشريفة — أذكار يومية لتقوية الإيمان وتحصين النفس
      </p>
      {timeRibbon}
    </section>
  );
}
