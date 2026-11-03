import React, { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_DHIKRS = [
  { label: 'سبحان الله', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { label: 'الحمد لله', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { label: 'الله أكبر', arabic: 'اللَّهُ أَكْبَرُ', target: 34 },
  { label: 'لا إله إلا الله', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 100 },
  { label: 'أستغفر الله', arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100 },
  { label: 'الصلاة على النبي', arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى مُحَمَّدٍ', target: 10 },
  { label: 'سبحان الله وبحمده', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 100 },
  { label: 'حسبي الله', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', target: 7 },
];

const MILESTONES = [33, 66, 99, 100, 200, 300, 500, 1000];
const CIRCUMFERENCE = 2 * Math.PI * 115;

function getMilestoneMsg(n, dhikrLabel) {
  const currentDhikr = dhikrLabel || 'التسبيح';
  const msgs = {
    33: `ثلاثة وثلاثون — ${currentDhikr}! <i class="fas fa-star"></i>`,
    66: `ستة وستون ${currentDhikr} <i class="fas fa-star"></i>`,
    99: `تسعة وتسعون — ${currentDhikr}! الحمد لله <i class="fas fa-star"></i>`,
    100: `مئة ${currentDhikr}! ما شاء الله <i class="fas fa-trophy"></i>`,
    200: `مئتان ${currentDhikr}! <i class="fas fa-trophy"></i>`,
    300: `ثلاثمئة ${currentDhikr}! <i class="fas fa-trophy"></i>`,
    500: `خمسمئة ${currentDhikr}! بارك الله فيك <i class="fas fa-star"></i>`,
    1000: `ألف ${currentDhikr}! ما شاء الله <i class="fas fa-trophy"></i>`,
  };
  return msgs[n] || `${n} ${currentDhikr}! <i class="fas fa-star"></i>`;
}

export default function TasbihPanel({ isActive, showToast }) {
  const [dhikrs, setDhikrs] = useState(INITIAL_DHIKRS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [laps, setLaps] = useState(0);
  const [lastSaved, setLastSaved] = useState(-1);
  const [customTargetInput, setCustomTargetInput] = useState('33');
  const [isBumping, setIsBumping] = useState(false);
  const [arabicOpacity, setArabicOpacity] = useState(1);
  const [ripples, setRipples] = useState([]);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tasbih-history') || '[]');
    } catch {
      return [];
    }
  });

  const tapBtnRef = useRef(null);
  const currentDhikr = dhikrs[activeIdx];
  const target = currentDhikr.target || 33;
  const totalCount = laps * target + count;

  // Sync custom target input when active dhikr changes
  const handleSelectDhikr = (idx) => {
    setActiveIdx(idx);
    setCount(0);
    setLaps(0);
    setCustomTargetInput(String(dhikrs[idx].target || ''));
    setArabicOpacity(0);
    setTimeout(() => {
      setArabicOpacity(1);
    }, 150);
  };

  const triggerBump = () => {
    setIsBumping(false);
    requestAnimationFrame(() => {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 120);
    });
  };

  const createRipple = (e) => {
    if (!tapBtnRef.current) return;
    const btn = tapBtnRef.current;
    const rect = btn.getBoundingClientRect();
    const clientX = e && typeof e.clientX === 'number' ? e.clientX : null;
    const clientY = e && typeof e.clientY === 'number' ? e.clientY : null;
    const x = clientX !== null ? clientX - rect.left : rect.width / 2;
    const y = clientY !== null ? clientY - rect.top : rect.height / 2;
    const size = Math.max(rect.width, rect.height);
    const id = Date.now() + Math.random();
    const newRipple = {
      id,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
      },
    };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const increment = useCallback(
    (e) => {
      createRipple(e);
      triggerBump();
      if (navigator.vibrate) navigator.vibrate(18);

      let newCount = count + 1;
      let newLaps = laps;

      if (newCount > target) {
        newCount = 1;
        newLaps = laps + 1;
        setLaps(newLaps);
        showToast(`دورة ${newLaps} مكتملة! <i class="fas fa-star"></i>`);
      }
      setCount(newCount);

      const newTotal = newLaps * target + newCount;
      if (MILESTONES.includes(newTotal)) {
        showToast(getMilestoneMsg(newTotal, currentDhikr.label));
      }
    },
    [count, laps, target, currentDhikr, showToast]
  );

  const undoLast = useCallback(() => {
    if (count > 0) {
      setCount((prev) => prev - 1);
    } else if (laps > 0) {
      setLaps((prev) => prev - 1);
      setCount(target);
    }
  }, [count, laps, target]);

  const resetTasbihCounter = useCallback(() => {
    setCount(0);
    setLaps(0);
    showToast('تمت إعادة التعيين <i class="fas fa-check-circle"></i>');
  }, [showToast]);

  const saveToHistory = () => {
    const total = laps * target + count;
    if (total === 0 || total === lastSaved) {
      showToast('لا يوجد تسبيح للحفظ');
      return;
    }

    const now = new Date();
    const entry = {
      dhikr: currentDhikr.label,
      count: total,
      time: now.toLocaleTimeString('ar-SA', {
        numberingSystem: 'latn',
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: now.toLocaleDateString('ar-SA', {
        numberingSystem: 'latn',
        day: 'numeric',
        month: 'short',
      }),
    };

    const newHistory = [entry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('tasbih-history', JSON.stringify(newHistory));
    setLastSaved(total);
    showToast('تم حفظ الجلسة <i class="fas fa-save"></i>');
  };

  const handleSetCustomTarget = () => {
    const val = parseInt(customTargetInput, 10);
    if (!val || val < 1) {
      showToast('أدخل رقماً صحيحاً');
      return;
    }
    const updated = [...dhikrs];
    updated[activeIdx] = { ...updated[activeIdx], target: val };
    setDhikrs(updated);
    setCount(0);
    setLaps(0);
    showToast(`تم تعيين الهدف: ${val}`);
  };

  // Keyboard controls
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        increment(null);
      } else if (e.code === 'Backspace') {
        undoLast();
      } else if (e.code === 'KeyR') {
        resetTasbihCounter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, increment, undoLast, resetTasbihCounter]);

  // Ring progress
  const pct = target > 0 ? count / target : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(pct, 1));

  return (
    <section id="panel-tasbih" className="tasbih-panel active" role="tabpanel">
      <div className="dhikr-selector" role="region" aria-label="اختيار الذكر">
        <h3>اختر الذكر</h3>
        <div className="dhikr-pills" role="group">
          {dhikrs.map((d, i) => (
            <button
              key={d.label}
              className={`dhikr-pill ${i === activeIdx ? 'active' : ''}`}
              onClick={() => handleSelectDhikr(i)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div
          className="dhikr-display"
          lang="ar"
          dir="rtl"
          aria-live="polite"
          style={{
            opacity: arabicOpacity,
            transition: 'opacity 0.15s ease',
          }}
        >
          {currentDhikr.arabic}
        </div>
        <div className="dhikr-target">
          الهدف: <span className="target-badge">{target}</span>
        </div>
      </div>

      <div className="counter-section" aria-label="عداد التسبيح">
        <div className="ring-wrap" aria-hidden="false">
          <svg className="ring-svg" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--gold-bright)" />
                <stop offset="100%" stopColor="var(--teal)" />
              </linearGradient>
            </defs>
            <circle className="ring-track" cx="120" cy="120" r="115" />
            <circle
              className="ring-progress"
              cx="120"
              cy="120"
              r="115"
              style={{ strokeDashoffset }}
            />
          </svg>
          <div className="ring-inner">
            <div
              className={`count-number ${isBumping ? 'bump' : ''}`}
              aria-live="polite"
            >
              {count}
            </div>
            <div className="count-total">من {target}</div>
            <div className="count-laps" aria-live="polite">
              {laps > 0 ? `الدورة ${laps}` : ''}
            </div>
          </div>
        </div>

        <div className="tap-btn-wrap">
          <button
            ref={tapBtnRef}
            className="tap-btn"
            onClick={(e) => increment(e)}
            aria-label="اضغط للتسبيح"
          >
            <span className="tap-btn-label">إضغظ</span>
            <span className="kbd-hint">
              أو إضغط <kbd className="kbd">Space</kbd>
            </span>
            {ripples.map((rip) => (
              <span key={rip.id} className="ripple" style={rip.style} />
            ))}
          </button>
        </div>
      </div>

      <div className="controls" role="group" aria-label="أدوات التحكم">
        <button className="ctrl-btn" onClick={undoLast}>
          <i className="fas fa-arrow-right"></i> تراجع
        </button>
        <button className="ctrl-btn danger" onClick={resetTasbihCounter}>
          <i className="fas fa-undo-alt"></i> إعادة
        </button>
        <button className="ctrl-btn" onClick={saveToHistory}>
          <i className="fas fa-save"></i> حفظ
        </button>
        <div className="custom-target-wrap">
          <label htmlFor="customTarget">الهدف:</label>
          <input
            className="custom-target-input"
            id="customTarget"
            type="number"
            min="1"
            max="9999"
            placeholder="33"
            value={customTargetInput}
            onChange={(e) => setCustomTargetInput(e.target.value)}
          />
          <button className="set-target-btn" onClick={handleSetCustomTarget}>
            تعيين
          </button>
        </div>
      </div>

      <div className="milestone-section" role="region" aria-label="الإنجازات">
        <h3>
          <i className="fas fa-trophy"></i> الإنجازات
        </h3>
        <div className="milestones-grid">
          {MILESTONES.map((ms) => {
            const reached = totalCount >= ms;
            return (
              <div
                key={ms}
                className={`milestone-chip ${reached ? 'reached' : ''}`}
              >
                <span className="ms-number">{ms}</span>
                <span>{reached ? '✓ تم' : 'تسبيحة'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="history-section" role="region" aria-label="سجل التسبيح">
        <h3>
          <i className="fas fa-clipboard-list"></i> سجل الجلسات{' '}
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            (آخر 10 جلسات)
          </span>
        </h3>
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              لا توجد جلسات محفوظة — اضغط "حفظ" بعد الانتهاء
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="history-item">
                <span className="hist-dhikr">{item.dhikr}</span>
                <span className="hist-count">{item.count}×</span>
                <span className="hist-time">
                  {item.date} {item.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
