import React from 'react';
import { TARGET_PRESETS } from '../../../constants/tasbih';

export default function TasbihControls({
  onUndo,
  onReset,
  onSave,
  canUndo,
  target,
  onSelectTarget,
  soundEnabled,
  onToggleSound,
  hapticEnabled,
  onToggleHaptic,
}) {
  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0) {
      onSelectTarget(val);
    }
  };

  const stepTarget = (delta) => {
    const next = Math.max(1, Math.min(9999, target + delta));
    onSelectTarget(next);
  };

  return (
    <div
      className='w-full max-w-4xl mx-auto my-6 p-5 sm:p-6 rounded-3xl bg-bg-card border border-border-theme shadow-xs space-y-6'
      role='region'
      aria-label='أدوات التحكم وتحديد الهدف'>
      {/* 1. Quick Action Buttons */}
      <div>
        <div className='text-xs font-bold text-text-muted mb-2.5 flex items-center justify-between'>
          <span className='flex items-center gap-1.5'>
            <i className='fas fa-sliders text-gold text-xs'></i>
            <span>إجراءات سريعة</span>
          </span>
          <div className='flex items-center gap-2'>
            {/* Sound Toggle */}
            <button
              type='button'
              onClick={onToggleSound}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-bg-elevated border-border-theme text-text-muted hover:text-text-main'
              }`}
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل صوت النقر'}
              aria-label={
                soundEnabled ? 'كتم صوت التسبيح' : 'تشغيل صوت التسبيح'
              }>
              <i
                className={`fas ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'} text-[11px]`}></i>
              <span className='hidden sm:inline'>الصوت</span>
            </button>

            {/* Haptic Toggle */}
            <button
              type='button'
              onClick={onToggleHaptic}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
                hapticEnabled
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-bg-elevated border-border-theme text-text-muted hover:text-text-main'
              }`}
              title={hapticEnabled ? 'تعطيل الاهتزاز' : 'تفعيل الاهتزاز'}
              aria-label={hapticEnabled ? 'إيقاف الاهتزاز' : 'تشغيل الاهتزاز'}>
              <i className='fas fa-mobile-screen-button text-[11px]'></i>
              <span className='hidden sm:inline'>الاهتزاز</span>
            </button>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2.5 sm:gap-3'>
          {/* Undo */}
          <button
            type='button'
            onClick={onUndo}
            disabled={!canUndo}
            className='flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-border-theme bg-bg-elevated/70 text-text-main hover:text-gold hover:border-gold/40 text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs'
            title='تراجع عن التسبيحة الأخيرة (Backspace)'>
            <i className='fas fa-rotate-left text-xs text-gold'></i>
            <span>تراجع</span>
          </button>

          {/* Reset */}
          <button
            type='button'
            onClick={onReset}
            className='flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-2xs'
            title='إعادة تعيين العداد (R)'>
            <i className='fas fa-arrow-rotate-right text-xs'></i>
            <span>إعادة</span>
          </button>

          {/* Save Session */}
          <button
            type='button'
            onClick={onSave}
            className='flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/60 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-2xs'
            title='حفظ جلسة التسبيح في السجل'>
            <i className='fas fa-floppy-disk text-xs'></i>
            <span>حفظ الجلسة</span>
          </button>
        </div>
      </div>

      {/* 2. Target Goal Selection (Presets + Stepper + Slider) */}
      <div className='pt-4 border-t border-border-theme/60'>
        <div className='flex items-center justify-between gap-2 mb-3'>
          <label
            htmlFor='tasbih-target-slider'
            className='text-xs font-bold text-text-muted flex items-center gap-1.5'>
            <i className='fas fa-bullseye text-gold text-xs'></i>
            <span>تحديد الهدف</span>
          </label>
          <div className='flex items-center gap-1'>
            <span className='text-xs text-text-muted'>الهدف المختار:</span>
            <span className='px-2 py-0.5 rounded-lg bg-gold/15 text-gold font-mono font-bold text-xs'>
              {target}
            </span>
          </div>
        </div>

        {/* Goal Preset Steppers (33, 66, 99, 100, 500, 1000) */}
        <div
          className='grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4'
          role='group'
          aria-label='أهداف التسبيح المحددة مسبقاً'>
          {TARGET_PRESETS.map((p) => {
            const isMatch = target === p;
            return (
              <button
                key={p}
                type='button'
                onClick={() => onSelectTarget(p)}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-mono font-bold border transition-all cursor-pointer active:scale-95 ${
                  isMatch
                    ? 'bg-gold text-bg-deep border-gold shadow-xs'
                    : 'bg-bg-elevated/70 border-border-theme text-text-muted hover:text-text-main hover:border-gold/40'
                }`}
                aria-pressed={isMatch}>
                {p}
              </button>
            );
          })}
        </div>

        {/* Horizontal Slider + Precise Stepper */}
        <div className='flex flex-col sm:flex-row items-center gap-4 bg-bg-elevated/40 p-3 rounded-2xl border border-border-theme/50'>
          <div className='w-full flex-1 flex items-center gap-3'>
            <span className='text-[11px] font-mono text-text-muted'>1</span>
            <input
              id='tasbih-target-slider'
              type='range'
              min='1'
              max='1000'
              step='1'
              value={target > 1000 ? 1000 : target}
              onChange={handleSliderChange}
              className='w-full tasbih-slider cursor-pointer'
              aria-label='شريط تمرير تحديد الهدف'
            />
            <span className='text-[11px] font-mono text-text-muted'>1000</span>
          </div>

          {/* Stepper buttons for micro-adjustments */}
          <div className='flex items-center gap-1.5 shrink-0'>
            <button
              type='button'
              onClick={() => stepTarget(-1)}
              className='w-8 h-8 rounded-xl bg-bg-card border border-border-theme hover:border-gold/40 text-text-main text-sm font-bold flex items-center justify-center transition active:scale-95 cursor-pointer'
              title='إنقاص الهدف بواحد'
              aria-label='إنقاص الهدف بواحد'>
              -
            </button>
            <input
              type='number'
              min='1'
              max='9999'
              value={target}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (v && v > 0) onSelectTarget(v);
              }}
              className='w-16 px-2 py-1 rounded-xl bg-bg-card border border-border-theme text-center font-mono font-bold text-xs sm:text-sm text-text-main focus:outline-none focus:border-gold'
              aria-label='إدخال الهدف يدوياً'
            />
            <button
              type='button'
              onClick={() => stepTarget(1)}
              className='w-8 h-8 rounded-xl bg-bg-card border border-border-theme hover:border-gold/40 text-text-main text-sm font-bold flex items-center justify-center transition active:scale-95 cursor-pointer'
              title='زيادة الهدف بواحد'
              aria-label='زيادة الهدف بواحد'>
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
