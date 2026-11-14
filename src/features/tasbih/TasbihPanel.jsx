import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  INITIAL_DHIKRS,
  MILESTONES,
  CIRCUMFERENCE,
  getMilestoneMsg,
} from '../../constants/tasbih';
import {
  CONTAINER_STAGGER_VARIANTS,
  ITEM_FADE_UP_VARIANTS,
} from '../../constants/motion';
import { triggerHaptic } from '../../utils/haptics';
import { playTasbihClick, playMilestoneChime } from '../../utils/sound';
import { fireSpiritualConfetti } from '../../utils/celebrate';
import DhikrSelector from './components/DhikrSelector';
import TasbihRing from './components/TasbihRing';
import TasbihControls from './components/TasbihControls';
import MilestonesGrid from './components/MilestonesGrid';
import HistoryList from './components/HistoryList';
import { recordTasbihProgress } from '../progress';

export default function TasbihPanel({ isActive, showToast }) {
  const [dhikrs, setDhikrs] = useState(() => {
    try {
      const saved = localStorage.getItem('azkari-custom-dhikrs');
      return saved ? JSON.parse(saved) : INITIAL_DHIKRS;
    } catch {
      return INITIAL_DHIKRS;
    }
  });

  const [activeIdx, setActiveIdx] = useState(() => {
    try {
      const saved = localStorage.getItem('tasbih-active-idx');
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    } catch {
      return 0;
    }
  });
  const [count, setCount] = useState(() => {
    try {
      const saved = localStorage.getItem('tasbih-current-count');
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    } catch {
      return 0;
    }
  });
  const [laps, setLaps] = useState(() => {
    try {
      const saved = localStorage.getItem('tasbih-current-laps');
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    } catch {
      return 0;
    }
  });
  const [lastSaved, setLastSaved] = useState(-1);
  const [isBumping, setIsBumping] = useState(false);
  const [arabicOpacity, setArabicOpacity] = useState(1);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('tasbih-active-idx', String(activeIdx));
    } catch {
      // ignore
    }
  }, [activeIdx]);

  useEffect(() => {
    try {
      localStorage.setItem('tasbih-current-count', String(count));
      localStorage.setItem('tasbih-current-laps', String(laps));
    } catch {
      // ignore
    }
  }, [count, laps]);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('tasbih-sound') !== 'false';
    } catch {
      return true;
    }
  });

  const [hapticEnabled, setHapticEnabled] = useState(() => {
    try {
      return localStorage.getItem('tasbih-haptic') !== 'false';
    } catch {
      return true;
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tasbih-history') || '[]');
    } catch {
      return [];
    }
  });

  const tapBtnRef = useRef(null);
  const currentDhikr = dhikrs[activeIdx] || dhikrs[0];
  const target = currentDhikr.target || 33;
  const currentTotal = laps * target + count;

  // Toggle Sound
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('tasbih-sound', String(next));
      if (showToast) {
        showToast(
          next
            ? 'تم تفعيل صوت النقر <i class="fas fa-volume-high text-gold"></i>'
            : 'تم كتم الصوت <i class="fas fa-volume-xmark text-text-muted"></i>'
        );
      }
      return next;
    });
  };

  // Toggle Haptic
  const handleToggleHaptic = () => {
    setHapticEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('tasbih-haptic', String(next));
      if (showToast) {
        showToast(
          next
            ? 'تم تفعيل الاهتزاز <i class="fas fa-mobile-screen-button text-gold"></i>'
            : 'تم تعطيل الاهتزاز <span class="relative inline-flex items-center justify-center text-text-muted"><i class="fas fa-mobile-screen-button opacity-50"></i><span class="absolute w-3.5 h-[1.5px] bg-current -rotate-45 rounded-full pointer-events-none"></span></span>'
        );
      }
      return next;
    });
  };

  // Select Dhikr
  const handleSelectDhikr = (idx) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setCount(0);
    setLaps(0);
    setArabicOpacity(0);
    setTimeout(() => {
      setArabicOpacity(1);
    }, 180);
  };

  // Add Custom Dhikr
  const handleAddCustomDhikr = (newDhikr) => {
    const updated = [newDhikr, ...dhikrs];
    setDhikrs(updated);
    setActiveIdx(0);
    setCount(0);
    setLaps(0);
    try {
      localStorage.setItem('azkari-custom-dhikrs', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (showToast) {
      showToast(
        `تمت إضافة الذكر الجديد: "${newDhikr.label}" <i class="fas fa-check text-gold"></i>`
      );
    }
  };

  // Set Target
  const handleSelectTarget = (newTarget) => {
    const updated = [...dhikrs];
    updated[activeIdx] = { ...updated[activeIdx], target: newTarget };
    setDhikrs(updated);
    setCount(0);
    setLaps(0);
    if (showToast) {
      showToast(
        `تم تعيين الهدف: ${newTarget} تسبيحة <i class="fas fa-bullseye text-gold"></i>`
      );
    }
  };

  // Trigger tactile bump
  const triggerBump = () => {
    setIsBumping(false);
    requestAnimationFrame(() => {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 120);
    });
  };

  // Create Ripple Effect
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
    }, 550);
  };

  // Increment
  const increment = useCallback(
    (e) => {
      createRipple(e);
      triggerBump();

      if (soundEnabled) {
        playTasbihClick();
      }
      if (hapticEnabled) {
        triggerHaptic(20);
      }

      let newCount = count + 1;
      let newLaps = laps;

      if (newCount > target) {
        newCount = 1;
        newLaps = laps + 1;
        setLaps(newLaps);
        if (soundEnabled) playMilestoneChime();
        fireSpiritualConfetti({ y: 0.65 });
        if (showToast) {
          showToast(
            `ما شاء الله! اكتملت الدورة ${newLaps} <i class="fas fa-star text-gold"></i>`
          );
        }
      }
      setCount(newCount);
      recordTasbihProgress({ delta: 1 });

      const newTotal = newLaps * target + newCount;
      if (MILESTONES.includes(newTotal)) {
        if (soundEnabled) playMilestoneChime();
        fireSpiritualConfetti({ y: 0.65 });
        if (showToast) {
          showToast(getMilestoneMsg(newTotal, currentDhikr.label));
        }
      }
    },
    [count, laps, target, currentDhikr, soundEnabled, hapticEnabled, showToast]
  );

  // Undo Last
  const undoLast = useCallback(() => {
    if (count > 0) {
      setCount((prev) => prev - 1);
    } else if (laps > 0) {
      setLaps((prev) => prev - 1);
      setCount(target);
    }
  }, [count, laps, target]);

  // Reset Counter
  const resetTasbihCounter = useCallback(() => {
    setCount(0);
    setLaps(0);
    if (showToast) {
      showToast(
        'تمت إعادة تعيين العداد <i class="fas fa-rotate-left text-gold"></i>'
      );
    }
  }, [showToast]);

  // Save Session
  const saveToHistory = () => {
    const total = laps * target + count;
    if (total === 0 || total === lastSaved) {
      if (showToast) showToast('لا يوجد تسبيح جديد للحفظ');
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

    const newHistory = [entry, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('tasbih-history', JSON.stringify(newHistory));
    setLastSaved(total);
    if (soundEnabled) playMilestoneChime();
    if (showToast) {
      showToast(
        `تم حفظ الجلسة: ${entry.dhikr} (${total}×) <i class="fas fa-floppy-disk text-gold"></i>`
      );
    }
  };

  // Delete Individual Session
  const handleDeleteSession = (idx) => {
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    localStorage.setItem('tasbih-history', JSON.stringify(updated));
    if (showToast) {
      showToast('تم حذف الجلسة من السجل');
    }
  };

  // Clear All History
  const handleClearHistory = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح سجل جلسات التسبيح؟')) {
      setHistory([]);
      localStorage.removeItem('tasbih-history');
      if (showToast) {
        showToast('تم مسح سجل الجلسات بالكامل');
      }
    }
  };

  // Copy History Summary
  const handleCopyHistory = () => {
    if (history.length === 0) return;
    const summary = history
      .map(
        (item, i) =>
          `${i + 1}. ${item.dhikr}: ${item.count} مرة (${item.date} ${item.time})`
      )
      .join('\n');
    const fullText = `📿 ملخص جلسات التسبيح من تطبيق أذكاري:\n\n${summary}\n\nتقبل الله منا ومنكم صالح الأعمال.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      if (showToast) {
        showToast(
          'تم نسخ ملخص الجلسات إلى الحافظة <i class="fas fa-copy text-gold"></i>'
        );
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        increment(null);
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        undoLast();
      } else if (e.code === 'KeyR') {
        resetTasbihCounter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, increment, undoLast, resetTasbihCounter]);

  // SVG Progress Stroke Offset
  const pct = target > 0 ? count / target : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(pct, 1));

  return (
    <section
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4'
      role='tabpanel'
      aria-label='صفحة التسبيح الرقمي'>
      {/* 2-Column Responsive Layout on Desktop (Counter + Controls on right/main, Sidebar on left/sidebar for RTL) */}
      <motion.div
        className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
        variants={CONTAINER_STAGGER_VARIANTS}
        initial='hidden'
        animate='visible'>
        {/* Main Interaction Area & Controls (cols 12 -> lg:7 or 8) */}
        <motion.div
          variants={ITEM_FADE_UP_VARIANTS}
          className='lg:col-span-8 flex flex-col items-center'>
          {/* 3. Zikr Selection Panel */}
          <DhikrSelector
            dhikrs={dhikrs}
            activeIdx={activeIdx}
            onSelectDhikr={handleSelectDhikr}
            onAddCustomDhikr={handleAddCustomDhikr}
            arabicOpacity={arabicOpacity}
            target={target}
          />

          {/* 4. Main Interaction Area (The Core Focus: Circular Counter Button) */}
          <TasbihRing
            count={count}
            target={target}
            laps={laps}
            totalCount={currentTotal}
            isBumping={isBumping}
            strokeDashoffset={strokeDashoffset}
            tapBtnRef={tapBtnRef}
            onIncrement={increment}
            ripples={ripples}
          />

          {/* 5. Controls & Goal Setting */}
          <TasbihControls
            onUndo={undoLast}
            onReset={resetTasbihCounter}
            onSave={saveToHistory}
            canUndo={count > 0 || laps > 0}
            target={target}
            onSelectTarget={handleSelectTarget}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            hapticEnabled={hapticEnabled}
            onToggleHaptic={handleToggleHaptic}
          />
        </motion.div>

        {/* 6. Saved Sessions / History Sidebar (cols 12 -> lg:4) */}
        <motion.div
          variants={ITEM_FADE_UP_VARIANTS}
          className='lg:col-span-4 flex flex-col gap-6'>
          {/* History / Saved Sessions Sidebar */}
          <HistoryList
            history={history}
            onDeleteSession={handleDeleteSession}
            onClearHistory={handleClearHistory}
            onCopyHistory={handleCopyHistory}
          />

          {/* Milestones & Achievements Card */}
          <MilestonesGrid
            milestones={MILESTONES}
            totalCount={currentTotal}
          />

          {/* Keyboard Shortcuts Hint Card */}
          <div className='p-4 rounded-3xl bg-bg-card/70 border border-border-theme/70 shadow-2xs text-xs text-text-muted'>
            <h4 className='font-bold text-text-main mb-2.5 flex items-center gap-1.5'>
              <i className='fas fa-keyboard text-gold'></i>
              <span>اختصارات لوحة المفاتيح</span>
            </h4>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span>التسبيح والعدّ:</span>
                <kbd className='px-2 py-0.5 rounded-lg bg-bg-elevated border border-border-theme font-mono font-bold text-text-main'>
                  Space
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span>تراجع تسبيحة:</span>
                <kbd className='px-2 py-0.5 rounded-lg bg-bg-elevated border border-border-theme font-mono font-bold text-text-main'>
                  Backspace
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span>إعادة تعيين:</span>
                <kbd className='px-2 py-0.5 rounded-lg bg-bg-elevated border border-border-theme font-mono font-bold text-text-main'>
                  R
                </kbd>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
