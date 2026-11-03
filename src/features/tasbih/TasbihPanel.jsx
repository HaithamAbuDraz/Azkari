import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  INITIAL_DHIKRS,
  MILESTONES,
  CIRCUMFERENCE,
  getMilestoneMsg,
} from '../../constants/tasbih';
import { triggerHaptic } from '../../utils/haptics';
import DhikrSelector from './components/DhikrSelector';
import TasbihRing from './components/TasbihRing';
import MilestonesGrid from './components/MilestonesGrid';
import HistoryList from './components/HistoryList';

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
      triggerHaptic(18);

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

  const pct = target > 0 ? count / target : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(pct, 1));

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-8 py-4" role="tabpanel">
      <DhikrSelector
        dhikrs={dhikrs}
        activeIdx={activeIdx}
        onSelectDhikr={handleSelectDhikr}
        arabicOpacity={arabicOpacity}
        target={target}
      />

      <TasbihRing
        count={count}
        target={target}
        laps={laps}
        isBumping={isBumping}
        strokeDashoffset={strokeDashoffset}
        tapBtnRef={tapBtnRef}
        onIncrement={increment}
        ripples={ripples}
      />

      <div className="flex flex-wrap items-center justify-center gap-3 my-6" role="group" aria-label="أدوات التحكم">
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-theme bg-bg-card text-text-main hover:text-gold-bright hover:border-gold-bright/40 text-xs md:text-sm font-semibold transition active:scale-95 shadow-sm cursor-pointer"
          onClick={undoLast}
        >
          <i className="fas fa-arrow-right"></i> تراجع
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-bg-card text-rose-400 hover:text-rose-300 hover:border-rose-500/60 text-xs md:text-sm font-semibold transition active:scale-95 shadow-sm cursor-pointer"
          onClick={resetTasbihCounter}
        >
          <i className="fas fa-undo-alt"></i> إعادة
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-theme bg-bg-card text-text-main hover:text-gold-bright hover:border-gold-bright/40 text-xs md:text-sm font-semibold transition active:scale-95 shadow-sm cursor-pointer"
          onClick={saveToHistory}
        >
          <i className="fas fa-save"></i> حفظ
        </button>
        <div className="flex items-center gap-2 bg-bg-card p-1.5 rounded-xl border border-border-theme text-xs md:text-sm shadow-sm">
          <label htmlFor="customTarget" className="text-text-muted px-1">الهدف:</label>
          <input
            id="customTarget"
            type="number"
            min="1"
            max="9999"
            placeholder="33"
            value={customTargetInput}
            onChange={(e) => setCustomTargetInput(e.target.value)}
            className="w-16 px-2.5 py-1 rounded-lg bg-bg-deep border border-border-theme text-text-main text-center text-sm font-bold focus:outline-none focus:border-gold-bright"
          />
          <button
            className="px-3.5 py-1.5 rounded-lg bg-gold-bright text-bg-deep font-bold text-xs hover:bg-gold-dim transition active:scale-95 cursor-pointer"
            onClick={handleSetCustomTarget}
          >
            تعيين
          </button>
        </div>
      </div>

      <MilestonesGrid milestones={MILESTONES} totalCount={totalCount} />

      <HistoryList history={history} />
    </section>
  );
}
