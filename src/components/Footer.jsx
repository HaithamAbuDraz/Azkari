import React from 'react';

export default function Footer({ onShowToast }) {
  return (
    <footer role="contentinfo">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="footer-logo-icon">
                <i className="fas fa-star-and-crescent"></i>
              </span>
              <h3>أذكاري</h3>
            </div>
            <p className="footer-description">
              موقع إلكتروني يضم أذكار الصباح والمساء وما بعد الصلاة وأذكار النوم والأذكار المتنوعة
              من الكتاب والسنة النبوية والمسبحة، بهدف تحصين المسلم وتقوية إيمانه.
            </p>
            <div className="footer-hadith">
              <p>
                <i className="fas fa-quote-right"></i> مَثَلُ الذي يَذكُرُ رَبَّه والذي لا يَذكُرُ رَبَّه مَثَلُ الحَيِّ
                والمَيِّتِ. <i className="fas fa-quote-left"></i>
              </p>
              <small>
                <i className="fas fa-book"></i> — البخاري
              </small>
            </div>
          </div>

          <div className="footer-section">
            <h4>
              <i className="fas fa-envelope"></i> تواصل
            </h4>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="فيسبوك" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon" aria-label="إنستغرام" target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-icon" aria-label="واتساب" target="_blank" rel="noreferrer">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href="#" className="social-icon" aria-label="تيليجرام" target="_blank" rel="noreferrer">
                <i className="fab fa-telegram"></i>
              </a>
            </div>
            <button
              className="dua-btn"
              onClick={() =>
                onShowToast("جزاك الله خيراً <i class='fas fa-hands-praying'></i>")
              }
            >
              <i className="fas fa-hands-praying"></i> ادعو لي
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            <i className="far fa-copyright"></i> 2026 أذكاري — روضة الأذكار والأدعية
          </p>
          <div className="footer-source">
            <i className="fas fa-quran"></i> جميع الأذكار مأخوذة من حصن المسلم — المصدر: الكتاب والسنة النبوية الشريفة
          </div>
        </div>
      </div>
    </footer>
  );
}
