import React, { useState, useEffect } from 'react';

function getClockData() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeString = `${h}:${m}:${s}`;

  const hour = now.getHours();
  let period = 'الليل';
  if (hour >= 5 && hour < 12) period = 'الصباح';
  else if (hour >= 12 && hour < 16) period = 'الظهر';
  else if (hour >= 16 && hour < 19) period = 'العصر';
  else if (hour >= 19 && hour < 20) period = 'المغرب';

  const dateStr = now.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    numberingSystem: 'latn',
  });

  return { timeString, period, dateStr };
}

export default function Hero({ activeTab }) {
  const [clock, setClock] = useState(getClockData);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(getClockData());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
